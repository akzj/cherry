use anyhow::Result;
use axum::{
    Json, Router,
    extract::{
        State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    response::IntoResponse,
    routing::{get, post},
};
use std::{io::Read, sync::Arc, time};
use tokio::{select, sync::Semaphore};

use cherrycore::{jwt::JwtClaims, types::*};
use tokio::sync::{mpsc, watch};

use crate::StreamServer;

#[axum::debug_handler]
async fn append_stream(
    claims: JwtClaims,
    server: State<StreamServer>,
    mut request: Json<StreamAppendRequest>,
) -> Result<Json<StreamAppendResponse>, ResponseError> {
    let mut acl_checker = acl_checker::new(claims.user_id, request.stream_id, &server);
    if !acl_checker.check_acl().await.unwrap_or(false) {
        return Err(ResponseError::Forbidden);
    }

    if request.data.is_none() || request.data.as_ref().unwrap().is_empty() {
        return Err(ResponseError::DataEmpty);
    }

    let stream_id = request.stream_id;
    let data = request.data.take().unwrap();
    let offset = server.store.append_async(stream_id, data).await?;

    // notify watchers to read the stream data
    let watchers = server.watchers.lock().unwrap();
    if let Some((tx, _rx)) = watchers.get(&stream_id) {
        let _ = tx.send_replace(offset);
    }

    Ok(Json(StreamAppendResponse { stream_id, offset }))
}

struct acl_checker<'a> {
    user_id: uuid::Uuid,
    stream_id: u64,
    server: &'a StreamServer,
    check_ts: time::Instant,
}

impl<'a> acl_checker<'a> {
    fn new(user_id: uuid::Uuid, stream_id: u64, server: &'a StreamServer) -> Self {
        Self {
            user_id,
            stream_id,
            server,
            check_ts: time::Instant::now()
                .checked_sub(time::Duration::from_secs(5))
                .unwrap(),
        }
    }

    async fn check_acl(&mut self) -> Result<bool> {
        if self.check_ts < time::Instant::now() {
            // TODO: check acl
            self.check_ts = time::Instant::now() + time::Duration::from_secs(5);
            Ok(true)
        } else {
            Ok(true)
        }
    }
}

async fn read_one_stream_handler(
    user_id: uuid::Uuid,
    token: tokio_util::sync::CancellationToken,
    request: StreamReadRequest,
    semaphore: Arc<Semaphore>,
    sender: mpsc::Sender<StreamReadResponse>,
    server: State<StreamServer>,
) -> Result<()> {
    let stream_id = request.stream_id;
    let mut offset = request.offset;
    let mut acl_checker = acl_checker::new(user_id, stream_id, &server);
    loop {
        // check acl every 5 seconds
        if !acl_checker.check_acl().await.unwrap_or(false) {
            log::error!("acl check failed, stream_id: {}", stream_id);
            return Err(anyhow::anyhow!("acl check failed"));
        }

        if let Ok((begin, end)) = server.store.get_stream_range(stream_id) {
            if offset < begin || offset > end {
                log::error!("offset or length is out of range");
                return Err(anyhow::anyhow!("offset or length is out of range"));
            }

            let _permit = select! {
                permit = semaphore.acquire() => {
                    permit
                }
                _ = token.cancelled() => {
                    return Ok(());
                }
            };

            let reader = server.store.new_stream_reader(stream_id).unwrap();
            reader.set_offset(offset);
            loop {
                // check acl every 5 seconds
                if !acl_checker.check_acl().await.unwrap_or(false) {
                    log::error!("acl check failed, stream_id: {}", stream_id);
                    return Err(anyhow::anyhow!("acl check failed"));
                }

                let mut reader = reader.clone();
                let data = select! {
                    data = tokio::task::spawn_blocking(move || {
                        let mut data = Vec::with_capacity(128 * 1024);
                        match reader.read(&mut data) {
                            Ok(read_bytes) => {
                                data.truncate(read_bytes);
                                Ok(data)
                            }
                            Err(e) => {
                                Err(e)
                            }
                        }
                    })=> {
                        match data {
                            Ok(data) => {
                                data
                            }
                            Err(e) => {
                                log::error!("spawn_blocking read stream error, stream_id: {}, error: {}", stream_id, e);
                                break;
                            }
                        }
                    }
                    _ = token.cancelled() => {
                        return Ok(());
                    }
                };

                if let Ok(data) = data {
                    if data.is_empty() {
                        log::info!("read stream end, stream_id: {}", stream_id);
                        break;
                    }

                    offset += data.len() as u64;
                    let response = StreamReadResponse {
                        stream_id,
                        offset,
                        data,
                    };
                    select! {
                        _ = sender.send(response) => {
                            continue;
                        }
                        _ = token.cancelled() => {
                            return Ok(());
                        }
                    }
                } else {
                    log::error!("read stream error, stream_id: {}", stream_id);
                    break;
                }
            }
        } else {
            log::info!("stream not found, stream_id: {}", stream_id);
        }

        let mut rx = server
            .watchers
            .lock()
            .unwrap()
            .entry(stream_id)
            .or_insert_with(|| {
                let (tx, rx) = watch::channel(offset);
                (tx, rx)
            })
            .1
            .clone();

        select! {
            _ = rx.wait_for(move |new_offset| *new_offset > offset) => {
                continue;
            }
            _ = token.cancelled() => {
                return Ok(());
            }
        }
    }
}

async fn read_stream_handler(
    user_id: uuid::Uuid,

    socket: WebSocket,
    server: State<StreamServer>,
) -> Result<()> {
    let mut socket = socket;
    let token = tokio_util::sync::CancellationToken::new();
    let (tx, mut rx) = mpsc::channel(32);
    let semaphore = Arc::new(Semaphore::new(8));
    while let Some(Ok(msg)) = socket.recv().await {
        match msg {
            Message::Text(text) => {
                let request: StreamReadRequest = serde_json::from_str(&text).unwrap();
                let semaphore = semaphore.clone();
                let tx = tx.clone();
                let token = token.clone();
                let server = server.clone();
                tokio::spawn(async move {
                    if let Err(e) = read_one_stream_handler(
                        user_id,
                        token,
                        request,
                        semaphore,
                        tx,
                        server.clone(),
                    )
                    .await
                    {
                        log::error!("read stream error: {}", e);
                    }
                });
            }
            _ => {}
        }
    }
    token.cancel();
    Ok(())
}

#[axum::debug_handler]
async fn read_stream(
    ws: WebSocketUpgrade,
    claims: JwtClaims,
    server: State<StreamServer>,
) -> impl IntoResponse {
    let user_id = claims.user_id;
    ws.on_upgrade(move |socket| async move {
        if let Err(e) = read_stream_handler(user_id, socket, server).await {
            log::error!("read stream error: {}", e);
        }
    })
}

pub(crate) fn init_routes() -> Router<StreamServer> {
    Router::new()
        .route("/api/v1/stream/append", post(append_stream))
        .route("/api/v1/stream/read", get(read_stream))
}
