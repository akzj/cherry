use std::{sync::Arc, time::Duration};

use crate::types::{
    Message as CherryMessage, StreamAppendBatchRequest, StreamAppendBatchResponse,
    StreamAppendRequest, StreamAppendResponse, StreamReadRequest, StreamReadResponse,
};
use anyhow::Result;
use async_tungstenite::{
    WebSocketStream,
    tokio::ConnectStream,
    tungstenite::{Message, client::IntoClientRequest},
};
use futures_util::{SinkExt, StreamExt};
use tokio::select;

#[derive(Clone)]
pub struct StreamClient {
    stream_server_url: String,
    client: reqwest::Client,
    jwt_token: Option<String>,
}

impl StreamClient {
    pub fn new(stream_server_url: &str, jwt_token: Option<String>) -> Self {
        Self {
            stream_server_url: stream_server_url.to_string(),
            jwt_token,
            client: reqwest::Client::builder()
                .pool_idle_timeout(Duration::from_secs(10))
                .pool_max_idle_per_host(3)
                .connect_timeout(Duration::from_secs(10))
                .connection_verbose(true)
                .build()
                .unwrap(),
        }
    }

    pub async fn append_stream(
        &self,
        stream_id: u64,
        data: Vec<u8>,
    ) -> Result<StreamAppendResponse, anyhow::Error> {
        let url = format!("{}/api/v1/stream/append", self.stream_server_url);
        let request = StreamAppendRequest {
            stream_id,
            data: Some(data),
        };

        let mut req = self.client.post(url);
        if let Some(jwt_token) = &self.jwt_token {
            req = req.header("Authorization", format!("Bearer {}", jwt_token));
        }
        let resp = req.json(&request).send().await?;
        let response = resp.json::<StreamAppendResponse>().await?;
        Ok(response)
    }

    pub async fn send_message(
        &self,
        stream_id: u64,
        message: CherryMessage,
    ) -> Result<(), anyhow::Error> {
        let data = message.encode()?;
        self.append_stream(stream_id, data).await?;
        Ok(())
    }

    pub async fn append_stream_batch(
        &self,
        batch: Vec<StreamAppendRequest>,
    ) -> Result<StreamAppendBatchResponse, anyhow::Error> {
        let url = format!("{}/api/v2/stream/append_batch", self.stream_server_url);
        let request = StreamAppendBatchRequest { batch };

        let mut req = self.client.post(url);
        if let Some(jwt_token) = &self.jwt_token {
            req = req.header("Authorization", format!("Bearer {}", jwt_token));
        }
        let resp = req.json(&request).send().await?;
        let response = resp.json::<StreamAppendBatchResponse>().await?;
        Ok(response)
    }

    pub async fn open_stream(
        &self,
    ) -> Result<(
        tokio::sync::mpsc::Sender<StreamReadRequest>,
        tokio::sync::mpsc::Receiver<StreamReadResponse>,
    )> {
        // replace http with ws
        let url = format!(
            "{}/api/v1/stream/read",
            self.stream_server_url.replace("http", "ws")
        );
        let mut request = url.into_client_request().unwrap();
        if let Some(jwt_token) = &self.jwt_token {
            request.headers_mut().insert(
                "Authorization",
                format!("Bearer {}", jwt_token).parse().unwrap(),
            );
        }

        let (mut ws_stream, _) = async_tungstenite::tokio::connect_async(request).await?;
        let (tx, msg_rx) = tokio::sync::mpsc::channel(100);
        let (req_tx, mut req_rx) = tokio::sync::mpsc::channel::<StreamReadRequest>(100);
        tokio::spawn(async move {
            loop {
                select! {
                    Some(msg) = ws_stream.next() => {
                        match msg {
                            Ok(Message::Text(text)) => {
                                let msg: StreamReadResponse = serde_json::from_str(&text).unwrap();
                                if let Err(e) = tx.send(msg).await {
                                    log::error!("send stream read response error: {:?}", e);
                                    break;
                                }
                            }
                            Ok(Message::Ping(ping)) => {
                                log::info!("ping: {:?}", ping);
                            }
                            Ok(Message::Pong(pong)) => {
                                log::info!("pong: {:?}", pong);
                            }
                            Ok(Message::Close(close)) => {
                                log::info!("close: {:?}", close);
                            }
                            Ok(Message::Binary(binary)) => {
                                log::info!("binary: {:?}", binary);
                            }
                            Ok(Message::Frame(frame)) => {
                                log::info!("frame: {:?}", frame);
                            }
                            Err(e) => {
                                log::error!("error: {:?}", e);
                                break;
                            }
                        }
                    }

                    Some(msg) = req_rx.recv() => {
                        let msg = Message::Text(serde_json::to_string(&msg).unwrap().into());
                        if let Err(e) = ws_stream.send(msg).await {
                            log::error!("send stream read request error: {:?}", e);
                            break;
                        }
                    }
                }
            }
        });

        Ok((req_tx, msg_rx))
    }
}
