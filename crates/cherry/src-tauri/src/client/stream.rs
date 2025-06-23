use std::{sync::Arc, time::Duration};

use anyhow::Result;
use async_tungstenite::{tokio::ConnectStream, tungstenite::Message, WebSocketStream};
use cherrycore::types::{
    StreamAppendRequest, StreamAppendResponse, StreamReadRequest, StreamReadResponse,
};
use futures_util::{SinkExt, StreamExt};
use tokio::select;

pub struct StreamClient {
    stream_server_url: String,
    client: reqwest::Client,
}

impl StreamClient {
    pub fn new(stream_server_url: String) -> Self {
        Self {
            stream_server_url,
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

        let resp = self.client.post(url).json(&request).send().await?;
        let response = resp.json::<StreamAppendResponse>().await?;
        Ok(response)
    }
}

pub async fn open_stream(
    stream_server_ws_url: String,
) -> Result<(
    tokio::sync::mpsc::Sender<StreamReadRequest>,
    tokio::sync::mpsc::Receiver<StreamReadResponse>,
)> {
    let url = format!("{}/api/v1/stream/read", stream_server_ws_url);
    let (mut ws_stream, _) = async_tungstenite::tokio::connect_async(url).await?;

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
