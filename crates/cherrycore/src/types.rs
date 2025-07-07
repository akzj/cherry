use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

use base64::Engine;
use chrono::DateTime;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde_json::Value;
use serde_with::{base64::Base64, serde_as};
use sqlx::types::Json;
use std::{
    collections::HashMap,
    fmt::{Debug, Display},
    io::{Cursor, Read, Write},
};
use streamstore::StreamId;
use uuid::Uuid;

use crate::jwt::AuthError;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    #[serde(rename = "type")]
    pub type_: String, // email, github_oauth
    pub email: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserInfo {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub avatar_url: Option<String>,
    pub status: String,
    pub profile: Value,
    pub app_config: Value,
    pub stream_meta: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub user_info: UserInfo,
    pub jwt_token: String,
}

#[derive(Debug, Serialize, Deserialize)]

pub struct StreamAppendRequest {
    pub stream_id: StreamId,
    pub data: Option<Vec<u8>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamAppendBatchRequest {
    pub batch: Vec<StreamAppendRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamAppendBatchResponse {}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamReadRequest {
    pub stream_id: StreamId,
    pub offset: u64,
}

#[serde_as]
#[derive(Serialize, Deserialize)]
pub struct StreamReadResponse {
    pub stream_id: StreamId,
    pub offset: u64,
    #[serde_as(as = "Base64")]
    pub data: Vec<u8>,
}

impl Debug for StreamReadResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "StreamReadResponse {{ stream_id: {}, offset: {}, data_len: {} }}",
            self.stream_id,
            self.offset,
            self.data.len()
        )
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamAppendResponse {
    pub stream_id: StreamId,
    pub offset: u64, // 偏移量
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckAclRequest {
    pub user_id: Uuid,
    pub stream_id: Option<StreamId>,
    pub conversation_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckAclResponse {
    pub allowed: bool,
}

pub enum ResponseError {
    InternalError(anyhow::Error),
    ClientConnectionError(anyhow::Error),
    AuthError(AuthError),
    DataEmpty,
    DataTooLarge,
    DataInvalid,
    AccessDenied,
    StreamNotFound,
    Forbidden,
}

impl IntoResponse for ResponseError {
    fn into_response(self) -> Response {
        match self {
            Self::InternalError(error) => {
                (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()).into_response()
            }
            Self::ClientConnectionError(error) => {
                (StatusCode::BAD_REQUEST, error.to_string()).into_response()
            }
            Self::AuthError(error) => (StatusCode::UNAUTHORIZED, error.to_string()).into_response(),
            Self::DataEmpty => (StatusCode::BAD_REQUEST, "data is empty").into_response(),
            Self::DataTooLarge => (StatusCode::BAD_REQUEST, "data is too large").into_response(),
            Self::DataInvalid => (StatusCode::BAD_REQUEST, "data is invalid").into_response(),
            Self::AccessDenied => (StatusCode::FORBIDDEN, "access denied").into_response(),
            Self::StreamNotFound => (StatusCode::NOT_FOUND, "stream not found").into_response(),
            Self::Forbidden => (StatusCode::FORBIDDEN, "forbidden").into_response(),
        }
    }
}

impl From<anyhow::Error> for ResponseError {
    fn from(error: anyhow::Error) -> Self {
        Self::InternalError(error)
    }
}

impl Display for ResponseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InternalError(error) => write!(f, "Internal error: {}", error),
            Self::AuthError(error) => write!(f, "Auth error: {}", error),
            Self::DataEmpty => write!(f, "Data is empty"),
            Self::DataTooLarge => write!(f, "Data is too large"),
            Self::DataInvalid => write!(f, "Data is invalid"),
            Self::AccessDenied => write!(f, "Access denied"),
            Self::ClientConnectionError(error) => write!(f, "Client connection error: {}", error),
            Self::StreamNotFound => write!(f, "Stream not found"),
            Self::Forbidden => write!(f, "Forbidden"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListStreamRequest {
    pub user_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Stream {
    pub stream_id: StreamId,
    pub owner_id: Uuid,
    pub stream_type: String,
    pub status: String,
    pub offset: i64,
    pub stream_meta: Value,
    pub created_at: DateTime<chrono::Utc>,
    pub updated_at: DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListStreamResponse {
    pub streams: Vec<Stream>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conversation {
    pub conversation_id: Uuid,
    pub conversation_type: String,
    pub members: Value,
    pub meta: Value,
    pub stream_id: StreamId,
    pub created_at: DateTime<chrono::Utc>,
    pub updated_at: DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListConversationsResponse {
    pub conversations: Vec<Conversation>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamErrorResponse {
    pub error: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateStreamOffsetRequest {
    pub stream_id: StreamId,
    pub offset: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateStreamOffsetResponse {
    pub stream_id: StreamId,
    pub offset: i64,
    pub success: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateConversationRequest {
    pub conversation_type: String, // "direct" or "group"
    pub members: Vec<Uuid>,        // 会话成员的用户ID列表
    pub meta: Option<Value>,       // 可选的会话元数据，如群组名称等
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateConversationResponse {
    pub conversation_id: Uuid,
    pub conversation_type: String,
    pub members: Vec<Uuid>,
    pub meta: Value,
    pub stream_id: i64,
    pub created_at: DateTime<chrono::Utc>,
    pub is_new: bool, // 是否是新创建的会话（用于1对1重复检测）
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub display_name: String,
    pub avatar_path: Option<String>,
    pub status: String, // online, offline, busy, away
}

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct Contact {
    pub contact_id: Uuid,
    pub owner_id: Uuid,
    pub target_id: Uuid,
    pub relation_type: String,
    pub created_at: DateTime<chrono::Utc>,
    pub updated_at: DateTime<chrono::Utc>,
    pub remark_name: Option<String>,
    pub avatar_url: Option<String>,
    pub status: String,
    pub tags: Value,
    pub is_favorite: bool,
    pub mute_settings: Value,
}

pub enum StreamType {
    Message,
    File,
    Image,
    Audio,
    Notification,
    Video,
    Other,
}

impl From<String> for StreamType {
    fn from(s: String) -> Self {
        match s.as_str() {
            "message" => StreamType::Message,
            "file" => StreamType::File,
            "image" => StreamType::Image,
            "audio" => StreamType::Audio,
            "notification" => StreamType::Notification,
            "video" => StreamType::Video,
            "other" => StreamType::Other,
            _ => StreamType::Other,
        }
    }
}

impl Into<String> for &StreamType {
    fn into(self) -> String {
        match self {
            StreamType::Message => "message".to_string(),
            StreamType::File => "file".to_string(),
            StreamType::Image => "image".to_string(),
            StreamType::Audio => "audio".to_string(),
            StreamType::Notification => "notification".to_string(),
            StreamType::Video => "video".to_string(),
            StreamType::Other => "other".to_string(),
        }
    }
}

impl ToString for StreamType {
    fn to_string(&self) -> String {
        self.into()
    }
}



#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "event_type", rename_all = "snake_case")]
pub enum StreamEvent {
    ConversationCreated {
        conversation_id: Uuid,
    },
    ConversationMemberAdded {
        conversation_id: Uuid,
        member_id: Uuid,
    },
    ConversationMemberRemoved {
        conversation_id: Uuid,
        member_id: Uuid,
    },
}

impl StreamEvent {
    pub fn encode(&self) -> Result<Vec<u8>, anyhow::Error> {
        let content = serde_json::to_string(&self)
            .map_err(|e| anyhow::anyhow!("Failed to serialize event: {}", e))?;
        let record = StreamRecord {
            meta: StreamRecordMeta::new(DataFormat::JsonEvent),
            content: content.as_bytes().to_vec(),
            tail: StreamRecordMeta::new(DataFormat::JsonEvent),
        };
        record.encode()
    }

    pub fn decode(data: &[u8]) -> Result<Self, anyhow::Error> {
        let record = StreamRecord::decode(data)?;
        let content = String::from_utf8(record.content)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize event: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize event: {}", e))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub id: i64,
    pub user_id: Uuid,
    pub content: Value,
    pub conversation_id: Uuid,
    pub timestamp: DateTime<chrono::Utc>,
    pub reply_to: Option<i64>,
    #[serde(rename = "type")]
    pub type_: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReactionContent {
    pub emoji: String,
    pub users: Vec<Uuid>,
    pub action: String,

}

impl Message {
    pub fn encode(&self) -> Result<Vec<u8>, anyhow::Error> {
        let content = serde_json::to_string(&self)
            .map_err(|e| anyhow::anyhow!("Failed to serialize message: {}", e))?;
        let record = StreamRecord {
            meta: StreamRecordMeta::default(),
            content: content.as_bytes().to_vec(),
            tail: StreamRecordMeta::default(),
        };
        record.encode()
    }

    pub fn decode(data: &[u8]) -> Result<Self, anyhow::Error> {
        let record = StreamRecord::decode(data)?;
        let content = String::from_utf8(record.content)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize message: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize message: {}", e))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataFormat {
    JsonMessage = 0,
    JsonEvent = 1,
}

impl DataFormat {
    pub fn to_u32(&self) -> u32 {
        match self {
            DataFormat::JsonMessage => 0,
            DataFormat::JsonEvent => 1,
        }
    }
}

impl From<u32> for DataFormat {
    fn from(value: u32) -> Self {
        match value {
            0 => DataFormat::JsonMessage,
            1 => DataFormat::JsonEvent,
            _ => DataFormat::JsonMessage,
        }
    }
}
impl Default for DataFormat {
    fn default() -> Self {
        DataFormat::JsonMessage
    }
}

pub const MESSAGE_RECORD_META_SIZE: usize = 16;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StreamRecordMeta {
    pub version: u32,
    pub content_size: u32,
    pub crc32: u32,
    pub data_format: DataFormat,
}

impl StreamRecordMeta {
    pub fn new(data_format: DataFormat) -> Self {
        Self {
            version: 0,
            content_size: 0,
            crc32: 0,
            data_format,
        }
    }

    pub fn encode(&self) -> Result<Vec<u8>, anyhow::Error> {
        let mut binary_data = Vec::new();
        binary_data.write_all(&self.version.to_le_bytes())?;
        binary_data.write_all(&self.content_size.to_le_bytes())?;
        binary_data.write_all(&self.crc32.to_le_bytes())?;
        binary_data.write_all(&self.data_format.to_u32().to_le_bytes())?;
        Ok(binary_data)
    }

    pub fn decode(data: &[u8]) -> Result<Self, anyhow::Error> {
        if data.len() < MESSAGE_RECORD_META_SIZE {
            return Err(anyhow::anyhow!(
                "Invalid data length for MessageRecordMeta, expected: {}, got: {}",
                MESSAGE_RECORD_META_SIZE,
                data.len()
            ));
        }

        let mut cursor = Cursor::new(data);
        let mut version_bytes = [0u8; 4];
        cursor.read_exact(&mut version_bytes)?;
        let mut content_size_bytes = [0u8; 4];
        cursor.read_exact(&mut content_size_bytes)?;
        let mut crc32_bytes = [0u8; 4];
        cursor.read_exact(&mut crc32_bytes)?;
        let mut data_format_bytes = [0u8; 4];
        cursor.read_exact(&mut data_format_bytes)?;
        let version = u32::from_le_bytes(version_bytes);
        let content_size = u32::from_le_bytes(content_size_bytes);
        let crc32 = u32::from_le_bytes(crc32_bytes);
        let data_format = u32::from_le_bytes(data_format_bytes);
        Ok(StreamRecordMeta {
            version,
            content_size,
            crc32,
            data_format: data_format.into(),
        })
    }
}

#[derive(Debug)]
pub struct StreamRecord {
    pub meta: StreamRecordMeta,
    pub content: Vec<u8>,
    pub tail: StreamRecordMeta,
}

impl StreamRecord {
    pub fn encode(&self) -> Result<Vec<u8>, anyhow::Error> {
        use std::io::Write;

        // 序列化 content 为 JSON 字符串，然后转换为字节
        let content_bytes = &self.content;

        let mut meta = StreamRecordMeta::default();
        // 计算 crc32
        let crc32 = crc32fast::hash(&content_bytes);
        meta.crc32 = crc32;
        meta.content_size = content_bytes.len() as u32;
        meta.data_format = self.meta.data_format.clone();
        meta.version = self.meta.version;

        let mut data = Vec::new();
        data.write_all(&meta.encode()?)?;
        data.write_all(&content_bytes)?;
        data.write_all(&meta.encode()?)?;
        Ok(data)
    }

    pub fn decode(data: &[u8]) -> Result<StreamRecord, anyhow::Error> {
        let meta = StreamRecordMeta::decode(data)?;
        let data = &data[MESSAGE_RECORD_META_SIZE..];
        if data.len() < meta.content_size as usize {
            return Err(anyhow::anyhow!(
                "Invalid data length, expected: {}, got: {}",
                meta.content_size,
                data.len()
            ));
        }
        let content_bytes = &data[..meta.content_size as usize];
        let content_crc32 = crc32fast::hash(content_bytes);
        if content_crc32 != meta.crc32 {
            return Err(anyhow::anyhow!(
                "Invalid crc32, expected: {}, got: {}",
                meta.crc32,
                content_crc32
            ));
        }

        let data = &data[meta.content_size as usize..];
        if data.len() < MESSAGE_RECORD_META_SIZE {
            return Err(anyhow::anyhow!(
                "Invalid data length, expected: {}, got: {}",
                MESSAGE_RECORD_META_SIZE,
                data.len()
            ));
        }
        let tail = StreamRecordMeta::decode(data)?;

        Ok(StreamRecord {
            meta,
            content: content_bytes.to_vec(),
            tail,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageMetadata {
    pub width: u32,
    pub height: u32,
    pub size: u64, // 文件大小（字节）
    pub format: String, // 图片格式：jpg, png, gif, webp等
    pub mime_type: String,
    pub filename: String,
    pub checksum: String, // SHA256校验和
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileUploadCreateRequest {
    pub conversation_id: Uuid,
    pub file_name: String,
    pub mime_type: String,
    pub size: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileUploadCompleteRequest {
    pub conversation_id: Uuid,
    pub file_id: Uuid,
    pub checksum: String,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileUploadCompleteResponse {
    pub file_id: Uuid,
    pub file_name: String,
    pub file_url: String,
    pub file_thumbnail_url: String,
    pub file_metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileUploadCreateResponse {
    pub upload_url: String,
    pub file_id: Uuid,
    pub expires_at: DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageUploadCompleteRequest {
    pub image_id: Uuid,
    pub checksum: String,
    pub metadata: ImageMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageUploadCompleteResponse {
    pub success: bool,
    pub image_url: String,
    pub thumbnail_url: String,
    pub message_id: Option<i64>, // 如果直接发送消息，返回消息ID
}
