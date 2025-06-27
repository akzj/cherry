use std::path::{Path, PathBuf};
use std::fs;
use std::collections::HashMap;
use anyhow::{Result, Context};
use axum::{
    extract::Multipart,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::{DateTime, Utc};
use image::{DynamicImage, ImageFormat, GenericImageView};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use tempfile::NamedTempFile;
use tokio::fs as tokio_fs;
use uuid::Uuid;
use cherrycore::types::{ImageMetadata, ImageUploadRequest, ImageUploadResponse, ImageUploadCompleteRequest, ImageUploadCompleteResponse};

#[derive(Debug, Clone)]
pub struct ImageService {
    upload_dir: PathBuf,
    public_url: String,
    max_file_size: u64,
}

impl ImageService {
    pub fn new(upload_dir: PathBuf, public_url: String) -> Self {
        Self {
            upload_dir,
            public_url,
            max_file_size: 10 * 1024 * 1024, // 10MB
        }
    }

    pub async fn init(&self) -> Result<()> {
        tokio::fs::create_dir_all(&self.upload_dir).await?;
        let thumbnail_dir = self.upload_dir.join("thumbnails");
        tokio::fs::create_dir_all(&thumbnail_dir).await?;
        Ok(())
    }

    pub async fn create_upload_url(&self, request: ImageUploadRequest) -> Result<ImageUploadResponse> {
        if request.size > self.max_file_size {
            return Err(anyhow::anyhow!("File size exceeds limit"));
        }

        let image_id = Uuid::new_v4();
        let expires_at = Utc::now() + chrono::Duration::minutes(30);

        Ok(ImageUploadResponse {
            upload_url: format!("/api/images/upload/{}", image_id),
            image_id,
            expires_at,
        })
    }

    pub async fn handle_upload(&self, image_id: Uuid, mut multipart: Multipart) -> Result<ImageUploadCompleteResponse> {
        // 简化的上传处理
        let mut file_data = None;
        while let Some(field) = multipart.next_field().await? {
            if field.name() == Some("file") {
                let data = field.bytes().await?;
                file_data = Some(data);
                break;
            }
        }

        let file_data = file_data.ok_or_else(|| anyhow::anyhow!("No file found"))?;
        
        // 保存文件
        let filename = format!("{}.bin", image_id);
        let file_path = self.upload_dir.join(&filename);
        tokio::fs::write(&file_path, &file_data).await?;

        // 构建URL
        let image_url = format!("{}/images/{}", self.public_url, filename);
        let thumbnail_url = format!("{}/images/{}", self.public_url, filename); // 简化处理

        Ok(ImageUploadCompleteResponse {
            success: true,
            image_url,
            thumbnail_url,
            message_id: None,
        })
    }

    pub async fn serve_image(&self, filename: &str) -> Result<Vec<u8>> {
        let file_path = self.upload_dir.join(filename);
        let data = tokio::fs::read(&file_path).await?;
        Ok(data)
    }
}

#[derive(Debug)]
pub enum ImageError {
    FileTooLarge,
    InvalidFileType,
    UploadFailed(String),
    NotFound,
}

impl IntoResponse for ImageError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::FileTooLarge => (StatusCode::BAD_REQUEST, "File too large"),
            Self::InvalidFileType => (StatusCode::BAD_REQUEST, "Invalid file type"),
            Self::UploadFailed(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            Self::NotFound => (StatusCode::NOT_FOUND, "Image not found"),
        };
        (status, message).into_response()
    }
} 