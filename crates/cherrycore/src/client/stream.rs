use std::{collections::HashMap, sync::Arc, time::Duration};

use crate::{client::{AuthCredentials, ClientConfig}, types::{
    Message as CherryMessage, StreamAppendBatchRequest, StreamAppendBatchResponse, StreamAppendRequest, StreamAppendResponse, StreamReadRequest, StreamReadResponse, StreamRecord, StreamRecordMeta, MESSAGE_RECORD_META_SIZE
}};
use anyhow::Result;
use async_tungstenite::tungstenite::{Message, client::IntoClientRequest};
use futures_util::StreamExt;
use streamstore::StreamId;
use tokio::select;

#[derive(Clone)]
pub struct StreamClient {
    inner: Arc<StreamClientInner>,
}

#[derive(Clone)]
pub struct StreamClientInner {
    config: ClientConfig,
    client: reqwest::Client,
    auth: Option<AuthCredentials>,
}

impl std::ops::Deref for StreamClient {
    type Target = StreamClientInner;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl StreamClient {
    pub fn new<C, A>(config: C, auth: A) -> Self
    where
        C: Into<ClientConfig>,
        A: Into<AuthCredentials>,
    {
        Self {
            inner: Arc::new(StreamClientInner {
                config: config.into(),
                client: reqwest::Client::builder()
                    .pool_idle_timeout(Duration::from_secs(10))
                    .pool_max_idle_per_host(3)
                    .connect_timeout(Duration::from_secs(10))
                    .connection_verbose(true)
                    .no_proxy()
                    .build()
                    .unwrap(),
                auth: Some(auth.into()),
            }),
        }
    }

    pub async fn append_stream(
        &self,
        stream_id: StreamId,
        data: Vec<u8>,
    ) -> Result<StreamAppendResponse, anyhow::Error> {
        let url = format!("{}/api/v1/stream/append", self.config.base_url);
        let request = StreamAppendRequest {
            stream_id,
            data: Some(data),
        };

        let mut req = self.client.post(url);
        if let Some(auth) = &self.auth {
            req = req.header("Authorization", format!("Bearer {}", auth.jwt_token));
        }
        let resp = req.json(&request).send().await?;
        let response = resp.json::<StreamAppendResponse>().await?;
        Ok(response)
    }

    pub async fn send_message(
        &self,
        stream_id: StreamId,
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
        let url = format!("{}/api/v2/stream/append_batch", self.config.base_url);
        let request = StreamAppendBatchRequest { batch };

        let mut req = self.client.post(url);
        if let Some(auth) = &self.auth {
            req = req.header("Authorization", format!("Bearer {}", auth.jwt_token));
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
            self.config.base_url.replace("http", "ws")
        );

        log::info!("Attempting WebSocket connection to: {}", url);
        let mut request = url.into_client_request().unwrap();
        if let Some(auth) = &self.auth {
            let auth_header = format!("Bearer {}", auth.jwt_token);
            log::info!("Setting Authorization header: {}", auth_header);
            request
                .headers_mut()
                .insert("Authorization", auth_header.parse().unwrap());
        } else {
            log::warn!("No JWT token provided for WebSocket connection");
        }

        let (mut ws_stream, _) = async_tungstenite::tokio::connect_async(request).await?;
        log::info!("WebSocket connection established successfully");

        let (tx, msg_rx) = tokio::sync::mpsc::channel(100);
        let (req_tx, mut req_rx) = tokio::sync::mpsc::channel::<StreamReadRequest>(100);
        tokio::spawn(async move {
            log::info!("WebSocket message handler started");
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
                        let msg_text = serde_json::to_string(&msg).unwrap();
                        log::debug!("Sending request: {}", msg_text);
                        let msg = Message::Text(msg_text.into());
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

pub struct StreamRecordDecoder {
    stream_id: i64,
    offset: u64,
    data: Vec<u8>,
}

impl StreamRecordDecoder {
    pub fn new(stream_id: i64, offset: u64, data: Vec<u8>) -> Self {
        Self {
            stream_id,
            offset,
            data,
        }
    }

    pub fn decode_all(&mut self) -> Result<Option<Vec<(StreamRecord, u64)>>> {
        let mut records = Vec::new();
        let mut data = self.data.as_slice();
        loop {
            if data.len() < MESSAGE_RECORD_META_SIZE * 2 {
                break;
            }
            let meta = StreamRecordMeta::decode(data).unwrap();

            let expected_size = meta.content_size as usize + MESSAGE_RECORD_META_SIZE * 2;
            if data.len() < expected_size {
                break;
            }
            let record = StreamRecord::decode(data).unwrap();
            data = &data[expected_size..];

            let offset = self.offset;
            self.offset += expected_size as u64;

            records.push((record, offset));
        }

        if records.is_empty() {
            return Ok(None);
        }

        self.data = data.to_vec();

        Ok(Some(records))
    }

    pub fn append(&mut self, data: &[u8], offset: u64) -> Result<()> {
        if self.data.len() + self.offset as usize != offset as usize {
            return Err(anyhow::anyhow!(
                "offset mismatch, expected: {}, got: {}",
                self.data.len() + self.offset as usize,
                offset as usize
            ));
        }
        self.data.extend_from_slice(data);
        Ok(())
    }
}

pub struct StreamRecordDecoderMachine {
    machines: HashMap<StreamId, StreamRecordDecoder>,
}

impl StreamRecordDecoderMachine {
    pub fn new() -> Self {
        Self {
            machines: HashMap::new(),
        }
    }
    pub fn decode(
        &mut self,
        stream_id: StreamId,
        offset: u64,
        data: &[u8],
    ) -> Result<Option<Vec<(StreamRecord, u64)>>> {
        if !self.machines.contains_key(&stream_id) {
            self.machines.insert(
                stream_id,
                StreamRecordDecoder::new(stream_id, offset, data.to_vec()),
            );
        } else {
            let decoder = self.machines.get_mut(&stream_id).unwrap();
            decoder.append(data, offset).unwrap();
        }
        let decoder = self.machines.get_mut(&stream_id).unwrap();
        decoder.decode_all()
    }
}
