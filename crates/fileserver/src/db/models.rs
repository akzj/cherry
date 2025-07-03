use uuid::Uuid;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct UploadFile {
    pub file_id: Uuid,
    pub conversation_id: Uuid,
    pub user_id: Uuid,
    pub filename: String,
    pub status: String,
    pub checksum: Option<String>,
    pub mime_type: Option<String>,
    pub size: Option<i64>,
    pub metadata: Option<Value>,
}

impl UploadFile {
    pub fn is_image(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("image/")).unwrap_or(false)
    }

    pub fn is_video(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("video/")).unwrap_or(false)
    }

    pub fn is_audio(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("audio/")).unwrap_or(false)
    }

    pub fn is_pdf(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("application/pdf")).unwrap_or(false)
    }

    pub fn is_text(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("text/")).unwrap_or(false)
    }

    pub fn is_office(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("application/vnd.openxmlformats-officedocument")).unwrap_or(false)
    }

    pub fn is_excel(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("application/vnd.ms-excel")).unwrap_or(false)
    }

    pub fn is_powerpoint(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("application/vnd.ms-powerpoint")).unwrap_or(false)
    }

    pub fn is_word(&self) -> bool {
        self.mime_type.as_ref().map(|mime_type| mime_type.starts_with("application/vnd.ms-word")).unwrap_or(false)
    }
    
}