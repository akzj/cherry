use std::path::Path;
use std::sync::Mutex;
use std::{sync::Arc, time::Duration};

use anyhow::{Context, Result};
use futures_util::io::BufReader;
use futures_util::stream::{self, Stream, StreamExt};
use reqwest::{Client, ClientBuilder, Url, blocking};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::digest::{FixedOutput, Update};
use sha2::{Digest, Sha256};
use tokio::{fs::File, io::AsyncReadExt};
use uuid::Uuid;

/// 支持进度回调的文件流
struct ProgressStream {
    file: File,
    file_name: String,
    total_size: u64,
    bytes_read: u64,
    hash: Arc<Mutex<Sha256>>,
    progress_callback: Box<dyn Fn(UploadProgress) + Send + Sync>,
}

impl ProgressStream {
    fn new(
        file: File,
        file_name: String,
        total_size: u64,
        hash: Arc<Mutex<Sha256>>,
        progress_callback: Box<dyn Fn(UploadProgress) + Send + Sync>,
    ) -> Self {
        Self {
            file,
            file_name,
            total_size,
            bytes_read: 0,
            hash,
            progress_callback,
        }
    }
}

impl Stream for ProgressStream {
    type Item = Result<bytes::Bytes, std::io::Error>;

    fn poll_next(
        mut self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Option<Self::Item>> {
        use std::pin::Pin;
        use tokio::io::{AsyncRead, ReadBuf};

        let mut buf = [0u8; 8192]; // 8KB chunks
        let mut read_buf = ReadBuf::new(&mut buf);
        let file = Pin::new(&mut self.file);

        match file.poll_read(cx, &mut read_buf) {
            std::task::Poll::Ready(Ok(())) => {
                let n = read_buf.filled().len();
                if n == 0 {
                    // EOF
                    std::task::Poll::Ready(None)
                } else {
                    self.bytes_read += n as u64;
                    sha2::Digest::update(&mut (*self.hash.lock().unwrap()), &buf[..n]);
                    let progress = UploadProgress::new(
                        self.bytes_read,
                        self.total_size,
                        self.file_name.clone(),
                    );
                    (self.progress_callback)(progress);
                    std::task::Poll::Ready(Some(Ok(bytes::Bytes::copy_from_slice(&buf[..n]))))
                }
            }
            std::task::Poll::Ready(Err(e)) => std::task::Poll::Ready(Some(Err(e))),
            std::task::Poll::Pending => std::task::Poll::Pending,
        }
    }
}

use crate::types::FileUploadCompleteResponse;
use crate::{
    client::{AuthCredentials, ClientConfig},
    types::{FileUploadCompleteRequest, FileUploadCreateRequest, FileUploadCreateResponse},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadProgress {
    pub bytes_uploaded: u64,
    pub total_bytes: u64,
    pub percentage: f64,
    pub file_name: String,
}

impl UploadProgress {
    fn new(bytes_uploaded: u64, total_bytes: u64, file_name: String) -> Self {
        let percentage = if total_bytes > 0 {
            (bytes_uploaded as f64 / total_bytes as f64) * 100.0
        } else {
            0.0
        };
        Self {
            bytes_uploaded,
            total_bytes,
            percentage,
            file_name,
        }
    }
}

#[derive(Clone)]
pub struct FileClient {
    inner: Arc<FileClientInner>,
}

pub struct FileClientInner {
    config: ClientConfig,
    client: Client,
    auth: Option<AuthCredentials>,
}

impl std::ops::Deref for FileClient {
    type Target = FileClientInner;
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl FileClient {
    pub fn new<C, A>(config: C, auth: A) -> Self
    where
        C: Into<ClientConfig>,
        A: Into<AuthCredentials>,
    {
        let config = config.into();
        let client = ClientBuilder::new()
            .timeout(config.timeout)
            .pool_idle_timeout(config.pool_idle_timeout)
            .pool_max_idle_per_host(config.max_idle_per_host)
            .user_agent(config.user_agent.clone())
            .no_proxy()
            .build()
            .unwrap();
        Self {
            inner: Arc::new(FileClientInner {
                config,
                client,
                auth: Some(auth.into()),
            }),
        }
    }

    pub async fn create_upload_file(
        &self,
        conversation_id: Uuid,
        file_path: &str,
    ) -> Result<FileUploadCreateResponse> {
        let path = Path::new(file_path);
        let file_name = path.file_name().unwrap().to_str().unwrap().to_string();
        let file = File::open(file_path).await?;
        let size = file.metadata().await?.len() as i64;
        let mime_type = mime_guess::from_path(file_path)
            .first_or_octet_stream()
            .to_string();

        let url = format!("{}/api/v1/files/upload/create", self.config.base_url);
        let request = FileUploadCreateRequest {
            conversation_id,
            file_name,
            mime_type,
            size,
        };
        let mut req = self.client.post(url);
        if let Some(auth) = &self.auth {
            req = req.header("Authorization", format!("Bearer {}", auth.jwt_token));
        }
        let response = req.json(&request).send().await?;
        let response_body: FileUploadCreateResponse = response.json().await?;
        Ok(response_body)
    }

    pub async fn upload_file_with_progress<F>(
        &self,
        file_path: &str,
        upload_url: &str,
        progress_callback: F,
    ) -> Result<String>
    where
        F: Fn(UploadProgress) + Send + Sync + 'static,
    {
        let base_url = Url::parse(&self.config.base_url).context("Failed to parse base URL")?;
        let upload_url = base_url
            .join(&upload_url)
            .context("Failed to join upload URL")?;

        let file = File::open(file_path).await.context("Failed to open file")?;
        let metadata = file
            .metadata()
            .await
            .context("Failed to get file metadata")?;
        let total_size = metadata.len();
        let checksum = Arc::new(Mutex::new(Sha256::new()));

        let progress_stream = ProgressStream::new(
            file,
            file_path.to_string(),
            total_size,
            checksum.clone(),
            Box::new(progress_callback),
        );

        log::info!("upload_url: {}", upload_url);

        let mut req = self.client.post(upload_url);
        if let Some(auth) = &self.auth {
            req = req.header("Authorization", format!("Bearer {}", auth.jwt_token));
        }
        let body = reqwest::Body::wrap_stream(progress_stream);
        // multipart/form-data
        let form =
            reqwest::multipart::Form::new().part("file", reqwest::multipart::Part::stream(body));
        req = req.multipart(form);

        let response = req.send().await?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            log::error!(
                "Failed to upload file: {} message={:?}",
                status,
                body
            );  
            return Err(anyhow::anyhow!(
                "Failed to upload file: {} message={}",
                status,
                body
            ));
        }   

        let checksum = {
            let guard = checksum.lock().unwrap();
            guard.clone().finalize_fixed().to_vec()
        };
        let checksum = hex::encode(checksum);
        log::info!("checksum: {}", checksum);

        log::info!(
            "Upload file success: file_path={} status={}",
            file_path,
            response.status()
        );

        Ok(checksum)
    }

    pub async fn upload_file_complete(
        &self,
        conversation_id: Uuid,
        file_id: Uuid,
        checksum: String,
        metadata: Option<Value>,
    ) -> Result<FileUploadCompleteResponse> {
        let url = format!("{}/api/v1/files/upload/complete", self.config.base_url);
        let request = FileUploadCompleteRequest {
            conversation_id,
            file_id,
            checksum,
            metadata,
        };
        let mut req = self.client.post(url);
        if let Some(auth) = &self.auth {
            req = req.header("Authorization", format!("Bearer {}", auth.jwt_token));
        }
        let response = req.json(&request).send().await?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            log::error!(
                "Failed to upload file complete: {} message={:?}",
                status,
                body
            );
            return Err(anyhow::anyhow!(
                "Failed to upload file complete: {} message={}",
                status,
                body
            ));
        }
        log::info!(
            "Upload file complete success: file_id={} status={}",
            file_id,
            response.status()
        );
        let response_body: FileUploadCompleteResponse = response.json().await?;
        Ok(response_body)
    }

    pub async fn upload_file(
        &self,
        conversation_id: Uuid,
        file_path: &str,
        metadata: Option<Value>,
        progress_callback: Box<dyn Fn(UploadProgress) + Send + Sync>,
    ) -> Result<FileUploadCompleteResponse> {
        let created_response = self.create_upload_file(conversation_id, file_path).await?;
        log::info!("create_upload_file response: {:?}", created_response);
        let upload_url = created_response.upload_url;
        let checksum = self
            .upload_file_with_progress(file_path, &upload_url, progress_callback)
            .await?;
        let mut complete_response = self
            .upload_file_complete(
                conversation_id,
                created_response.file_id,
                checksum,
                metadata,
            )
            .await?;

        log::info!("upload_file_complete response: {:?}", complete_response);

        let base_url = Url::parse(&self.config.base_url).context("Failed to parse base URL")?;
        let file_url = base_url
            .join(&complete_response.file_url)
            .context("Failed to join file URL")?;
        let file_thumbnail_url = base_url
            .join(&complete_response.file_thumbnail_url)
            .context("Failed to join file thumbnail URL")?;
        complete_response.file_url = file_url.to_string();
        complete_response.file_thumbnail_url = file_thumbnail_url.to_string();

        Ok(complete_response)
    }
}
