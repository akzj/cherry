use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct FileUploadRequest {
    pub file_id: Uuid,
    pub conversation_id: Uuid,
    pub filename: String,
    pub checksum: Option<String>,
    pub mime_type: Option<String>,
    pub size: Option<i64>,
}