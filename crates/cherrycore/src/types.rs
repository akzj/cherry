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
pub enum CherryMessage {
    Message {
        message: Message,
        conversation_id: Uuid,
    },
    Event {
        event: StreamEvent,
    },
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
    pub timestamp: DateTime<chrono::Utc>,
    pub reply_to: Option<i64>,
    #[serde(rename = "type")]
    pub type_: String,
    pub image_url: Option<String>,
    pub image_thumbnail_url: Option<String>,
    pub image_metadata: Option<ImageMetadata>,
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use serde_json::json;

    #[test]
    fn test_login_request_serialization() {
        let request = LoginRequest {
            type_: "username_password".to_string(),
            email: Some("testuser".to_string()),
            password: Some("testpass".to_string()),
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: LoginRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.type_, "username_password");
        assert_eq!(deserialized.email, Some("testuser".to_string()));
        assert_eq!(deserialized.password, Some("testpass".to_string()));
    }

    #[test]
    fn test_login_request_oauth() {
        let request = LoginRequest {
            type_: "github_oauth".to_string(),
            email: None,
            password: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: LoginRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.type_, "github_oauth");
        assert_eq!(deserialized.email, None);
        assert_eq!(deserialized.password, None);
    }

    #[test]
    fn test_login_response_serialization() {
        let user_id = Uuid::new_v4();
        let response = LoginResponse {
            user_info: UserInfo {
                user_id,
                username: "testuser".to_string(),
                email: "test@example.com".to_string(),
                avatar_url: Some("https://example.com/avatar.jpg".to_string()),
                status: "active".to_string(),
                profile: json!({}),
                app_config: json!({}),
                stream_meta: json!({}),
            },
            jwt_token: "test_token".to_string(),
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: LoginResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.user_info.user_id, user_id);
        assert_eq!(deserialized.user_info.username, "testuser");
        assert_eq!(deserialized.user_info.email, "test@example.com");
        assert_eq!(
            deserialized.user_info.avatar_url,
            Some("https://example.com/avatar.jpg".to_string())
        );
        assert_eq!(deserialized.user_info.status, "active");
        assert_eq!(deserialized.jwt_token, "test_token");
    }

    #[test]
    fn test_stream_append_request_serialization() {
        let request = StreamAppendRequest {
            stream_id: 123,
            data: Some(vec![1, 2, 3, 4]),
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: StreamAppendRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 123);
        assert_eq!(deserialized.data, Some(vec![1, 2, 3, 4]));
    }

    #[test]
    fn test_stream_read_request_serialization() {
        let request = StreamReadRequest {
            stream_id: 456,
            offset: 789,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: StreamReadRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 456);
        assert_eq!(deserialized.offset, 789);
    }

    #[test]
    fn test_stream_read_response_serialization() {
        let response = StreamReadResponse {
            stream_id: 123,
            offset: 456,
            data: vec![1, 2, 3, 4, 5],
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: StreamReadResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 123);
        assert_eq!(deserialized.offset, 456);
        assert_eq!(deserialized.data, vec![1, 2, 3, 4, 5]);
    }

    #[test]
    fn test_stream_append_response_serialization() {
        let response = StreamAppendResponse {
            stream_id: 789,
            offset: 1000,
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: StreamAppendResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 789);
        assert_eq!(deserialized.offset, 1000);
    }

    #[test]
    fn test_response_error_into_response() {
        let error = ResponseError::InternalError(anyhow::anyhow!("Test error"));
        let response = error.into_response();
        assert_eq!(
            response.status(),
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        );

        let error = ResponseError::AuthError(AuthError::InvalidToken);
        let response = error.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);

        let error = ResponseError::DataEmpty;
        let response = error.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_REQUEST);

        let error = ResponseError::DataTooLarge;
        let response = error.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_REQUEST);

        let error = ResponseError::DataInvalid;
        let response = error.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_REQUEST);

        let error = ResponseError::StreamNotFound;
        let response = error.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::NOT_FOUND);

        let error = ResponseError::Forbidden;
        let response = error.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::FORBIDDEN);
    }

    #[test]
    fn test_response_error_from_anyhow() {
        let anyhow_error = anyhow::anyhow!("Test error");
        let response_error: ResponseError = anyhow_error.into();

        match response_error {
            ResponseError::InternalError(_) => {}
            _ => panic!("Expected InternalError"),
        }
    }

    #[test]
    fn test_list_stream_request_serialization() {
        let user_id = Uuid::new_v4();
        let request = ListStreamRequest { user_id };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: ListStreamRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.user_id, user_id);
    }

    #[test]
    fn test_stream_serialization() {
        let owner_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        let stream = Stream {
            stream_id: 123,
            owner_id,
            stream_type: "chat".to_string(),
            status: "active".to_string(),
            offset: 456,
            stream_meta: json!({"key": "value"}),
            created_at: now,
            updated_at: now,
        };

        let json = serde_json::to_string(&stream).unwrap();
        let deserialized: Stream = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 123);
        assert_eq!(deserialized.owner_id, owner_id);
        assert_eq!(deserialized.stream_type, "chat");
        assert_eq!(deserialized.status, "active");
        assert_eq!(deserialized.offset, 456);
        assert_eq!(deserialized.stream_meta, json!({"key": "value"}));
    }

    #[test]
    fn test_list_stream_response_serialization() {
        let owner_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        let stream = Stream {
            stream_id: 123,
            owner_id,
            stream_type: "chat".to_string(),
            status: "active".to_string(),
            offset: 456,
            stream_meta: json!({"key": "value"}),
            created_at: now,
            updated_at: now,
        };

        let response = ListStreamResponse {
            streams: vec![stream],
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: ListStreamResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.streams.len(), 1);
        assert_eq!(deserialized.streams[0].stream_id, 123);
    }

    #[test]
    fn test_conversation_serialization() {
        let conversation_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        let conversation = Conversation {
            conversation_id,
            conversation_type: "group".to_string(),
            members: json!(["user1", "user2"]),
            meta: json!({"name": "Test Group"}),
            stream_id: 789,
            created_at: now,
            updated_at: now,
        };

        let json = serde_json::to_string(&conversation).unwrap();
        let deserialized: Conversation = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.conversation_id, conversation_id);
        assert_eq!(deserialized.conversation_type, "group");
        assert_eq!(deserialized.members, json!(["user1", "user2"]));
        assert_eq!(deserialized.meta, json!({"name": "Test Group"}));
        assert_eq!(deserialized.stream_id, 789);
    }

    #[test]
    fn test_list_conversations_response_serialization() {
        let conversation_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        let conversation = Conversation {
            conversation_id,
            conversation_type: "group".to_string(),
            members: json!(["user1", "user2"]),
            meta: json!({"name": "Test Group"}),
            stream_id: 789,
            created_at: now,
            updated_at: now,
        };

        let response = ListConversationsResponse {
            conversations: vec![conversation],
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: ListConversationsResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.conversations.len(), 1);
        assert_eq!(
            deserialized.conversations[0].conversation_id,
            conversation_id
        );
    }

    #[test]
    fn test_stream_error_response_serialization() {
        let response = StreamErrorResponse {
            error: "Something went wrong".to_string(),
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: StreamErrorResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.error, "Something went wrong");
    }

    #[test]
    fn test_debug_implementations() {
        let user_id = Uuid::new_v4();

        let login_request = LoginRequest {
            type_: "test".to_string(),
            email: Some("user".to_string()),
            password: Some("pass".to_string()),
        };
        let debug_str = format!("{:?}", login_request);
        assert!(debug_str.contains("LoginRequest"));

        let login_response = LoginResponse {
            user_info: UserInfo {
                user_id,
                username: "test".to_string(),
                email: "test@example.com".to_string(),
                avatar_url: None,
                status: "active".to_string(),
                profile: json!({}),
                app_config: json!({}),
                stream_meta: json!({}),
            },
            jwt_token: "test_token".to_string(),
        };
        let debug_str = format!("{:?}", login_response);
        assert!(debug_str.contains("LoginResponse"));

        let stream_append_request = StreamAppendRequest {
            stream_id: 1,
            data: Some(vec![1, 2, 3]),
        };
        let debug_str = format!("{:?}", stream_append_request);
        assert!(debug_str.contains("StreamAppendRequest"));
    }

    #[test]
    fn test_base64_encoding_in_stream_read_response() {
        let response = StreamReadResponse {
            stream_id: 123,
            offset: 456,
            data: vec![72, 101, 108, 108, 111], // "Hello" in bytes
        };

        let json = serde_json::to_string(&response).unwrap();
        // The data should be base64 encoded in JSON
        assert!(json.contains("SGVsbG8=")); // "Hello" in base64

        let deserialized: StreamReadResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.data, vec![72, 101, 108, 108, 111]);
    }

    #[test]
    fn test_update_stream_offset_request_serialization() {
        let request = UpdateStreamOffsetRequest {
            stream_id: 123,
            offset: 456,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: UpdateStreamOffsetRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 123);
        assert_eq!(deserialized.offset, 456);
    }

    #[test]
    fn test_update_stream_offset_response_serialization() {
        let response = UpdateStreamOffsetResponse {
            stream_id: 123,
            offset: 456,
            success: true,
        };

        let json = serde_json::to_string(&response).unwrap();
        let deserialized: UpdateStreamOffsetResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.stream_id, 123);
        assert_eq!(deserialized.offset, 456);
        assert_eq!(deserialized.success, true);
    }

    #[test]
    fn test_create_conversation_request_serialization() {
        let user1 = Uuid::new_v4();
        let user2 = Uuid::new_v4();
        let request = CreateConversationRequest {
            conversation_type: "direct".to_string(),
            members: vec![user1, user2],
            meta: Some(json!({"name": "Test Chat"})),
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: CreateConversationRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.conversation_type, "direct");
        assert_eq!(deserialized.members.len(), 2);
        assert_eq!(deserialized.meta, Some(json!({"name": "Test Chat"})));
    }

    // MessageRecordMeta 测试
    #[test]
    fn test_message_record_meta_encode_decode() {
        let meta = StreamRecordMeta {
            version: 1,
            content_size: 100,
            crc32: 12345,
            data_format: DataFormat::JsonEvent,
        };

        let encoded = meta.encode().unwrap();
        assert_eq!(encoded.len(), MESSAGE_RECORD_META_SIZE);

        let decoded = StreamRecordMeta::decode(&encoded).unwrap();
        assert_eq!(decoded.version, 1);
        assert_eq!(decoded.content_size, 100);
        assert_eq!(decoded.crc32, 12345);
        assert_eq!(decoded.data_format.to_u32(), DataFormat::JsonEvent.to_u32());
    }

    #[test]
    fn test_message_record_meta_decode_invalid_length() {
        let invalid_data = vec![1, 2, 3]; // 长度不足
        let result = StreamRecordMeta::decode(&invalid_data);
        assert!(result.is_err());
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("Invalid data length")
        );
    }

    #[test]
    fn test_message_record_meta_default() {
        let meta = StreamRecordMeta::default();
        assert_eq!(meta.version, 0);
        assert_eq!(meta.content_size, 0);
        assert_eq!(meta.crc32, 0);
        assert_eq!(meta.data_format.to_u32(), DataFormat::JsonMessage.to_u32());
    }

    // Message 编码解码测试
    #[test]
    fn test_message_encode_decode() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!("Hello, World!"),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let encoded = message.encode().unwrap();
        let decoded = Message::decode(&encoded).unwrap();

        // 验证 content 字段
        assert_eq!(decoded.id, message.id);
        assert_eq!(decoded.user_id, message.user_id);
        assert_eq!(decoded.content, message.content);
        assert_eq!(decoded.type_, message.type_);
    }

    #[test]
    fn test_message_encode_decode_with_reply() {
        let message = Message {
            id: 2,
            user_id: Uuid::new_v4(),
            content: json!("This is a reply message"),
            timestamp: chrono::Utc::now(),
            reply_to: Some(1),
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let encoded = message.encode().unwrap();
        let decoded = Message::decode(&encoded).unwrap();

        assert_eq!(decoded.id, message.id);
        assert_eq!(decoded.reply_to, message.reply_to);
        assert_eq!(decoded.content, message.content);
    }

    #[test]
    fn test_message_decode_invalid_crc32() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!("Test message"),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let mut encoded = message.encode().unwrap();

        // 修改 content 数据来破坏 CRC32
        let meta_size = MESSAGE_RECORD_META_SIZE;
        let content_start = meta_size;
        if encoded.len() > content_start + 5 {
            encoded[content_start + 5] = encoded[content_start + 5].wrapping_add(1);
        }

        let result = Message::decode(&encoded);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Invalid crc32"));
    }

    #[test]
    fn test_message_decode_invalid_length() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!("Test message"),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let mut encoded = message.encode().unwrap();

        // 截断数据
        encoded.truncate(encoded.len() - 10);

        let result = Message::decode(&encoded);
        assert!(result.is_err());
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("Invalid data length")
        );
    }

    #[test]
    fn test_message_decode_invalid_json() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!("Test message"),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let mut encoded = message.encode().unwrap();

        // 修改 content 数据来破坏 JSON
        let meta_size = MESSAGE_RECORD_META_SIZE;
        let content_start = meta_size;
        if encoded.len() > content_start + 10 {
            encoded[content_start + 10] = b'X'; // 插入无效字符
        }

        let result = Message::decode(&encoded);
        assert!(result.is_err());
        let error_msg = result.unwrap_err().to_string();
        println!("Actual error message: {}", error_msg);
        assert!(error_msg.contains("Invalid crc32"));
    }

    #[test]
    fn test_message_encode_decode_empty_content() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!(""),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let encoded = message.encode().unwrap();
        let decoded = Message::decode(&encoded).unwrap();

        assert_eq!(decoded.content, "");
    }

    #[test]
    fn test_message_encode_decode_large_content() {
        let large_content = "A".repeat(10000);
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!(large_content.clone()),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let encoded = message.encode().unwrap();
        let decoded = Message::decode(&encoded).unwrap();

        assert_eq!(decoded.content, large_content);
    }

    #[test]
    fn test_message_record_meta_serialize_deserialize() {
        let meta = StreamRecordMeta {
            version: 2,
            content_size: 200,
            crc32: 54321,
            data_format: DataFormat::JsonEvent,
        };

        let json = serde_json::to_string(&meta).unwrap();
        let deserialized: StreamRecordMeta = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.version, meta.version);
        assert_eq!(deserialized.content_size, meta.content_size);
        assert_eq!(deserialized.crc32, meta.crc32);
        assert_eq!(deserialized.data_format.to_u32(), meta.data_format.to_u32());
    }

    #[test]
    fn test_message_serialize_deserialize() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!("Test message"),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let json = serde_json::to_string(&message).unwrap();
        let deserialized: Message = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, message.id);
        assert_eq!(deserialized.user_id, message.user_id);
        assert_eq!(deserialized.content, message.content);
        assert_eq!(deserialized.type_, message.type_);
    }

    // StreamEvent 编码解码测试
    #[test]
    fn test_stream_event_encode_decode() {
        let event = StreamEvent::ConversationCreated {
            conversation_id: Uuid::new_v4(),
        };

        let encoded = event.encode().unwrap();
        let decoded = StreamEvent::decode(&encoded).unwrap();

        match (event, decoded) {
            (
                StreamEvent::ConversationCreated {
                    conversation_id: id1,
                },
                StreamEvent::ConversationCreated {
                    conversation_id: id2,
                },
            ) => {
                assert_eq!(id1, id2);
            }
            _ => panic!("Event types don't match"),
        }
    }

    #[test]
    fn test_stream_event_member_added_encode_decode() {
        let event = StreamEvent::ConversationMemberAdded {
            conversation_id: Uuid::new_v4(),
            member_id: Uuid::new_v4(),
        };

        let encoded = event.encode().unwrap();
        let decoded = StreamEvent::decode(&encoded).unwrap();

        match (event, decoded) {
            (
                StreamEvent::ConversationMemberAdded {
                    conversation_id: conv_id1,
                    member_id: member_id1,
                },
                StreamEvent::ConversationMemberAdded {
                    conversation_id: conv_id2,
                    member_id: member_id2,
                },
            ) => {
                assert_eq!(conv_id1, conv_id2);
                assert_eq!(member_id1, member_id2);
            }
            _ => panic!("Event types don't match"),
        }
    }

    #[test]
    fn test_stream_event_member_removed_encode_decode() {
        let event = StreamEvent::ConversationMemberRemoved {
            conversation_id: Uuid::new_v4(),
            member_id: Uuid::new_v4(),
        };

        let encoded = event.encode().unwrap();
        let decoded = StreamEvent::decode(&encoded).unwrap();

        match (event, decoded) {
            (
                StreamEvent::ConversationMemberRemoved {
                    conversation_id: conv_id1,
                    member_id: member_id1,
                },
                StreamEvent::ConversationMemberRemoved {
                    conversation_id: conv_id2,
                    member_id: member_id2,
                },
            ) => {
                assert_eq!(conv_id1, conv_id2);
                assert_eq!(member_id1, member_id2);
            }
            _ => panic!("Event types don't match"),
        }
    }

    #[test]
    fn test_stream_event_decode_invalid_json() {
        let event = StreamEvent::ConversationCreated {
            conversation_id: Uuid::new_v4(),
        };

        let mut encoded = event.encode().unwrap();

        // 修改 content 数据来破坏 JSON
        let meta_size = MESSAGE_RECORD_META_SIZE;
        let content_start = meta_size;
        if encoded.len() > content_start + 10 {
            encoded[content_start + 10] = b'X'; // 插入无效字符
        }

        let result = StreamEvent::decode(&encoded);
        assert!(result.is_err());
        let error_msg = result.unwrap_err().to_string();
        assert!(error_msg.contains("Invalid crc32"));
    }

    // DataFormat 测试
    #[test]
    fn test_data_format_values() {
        assert_eq!(DataFormat::JsonMessage.to_u32(), 0);
        assert_eq!(DataFormat::JsonEvent.to_u32(), 1);
    }

    #[test]
    fn test_data_format_from_u32() {
        assert_eq!(DataFormat::from(0), DataFormat::JsonMessage);
        assert_eq!(DataFormat::from(1), DataFormat::JsonEvent);
        assert_eq!(DataFormat::from(999), DataFormat::JsonMessage); // 默认值
    }

    #[test]
    fn test_data_format_partial_eq() {
        assert_eq!(DataFormat::JsonMessage, DataFormat::from(0));
        assert_eq!(DataFormat::JsonEvent, DataFormat::from(1));
        assert_ne!(DataFormat::JsonMessage, DataFormat::from(1));
        assert_ne!(DataFormat::JsonEvent, DataFormat::from(0));
    }

    #[test]
    fn test_data_format_default() {
        assert_eq!(DataFormat::default(), DataFormat::JsonMessage);
    }

    #[test]
    fn test_data_format_serialize_deserialize() {
        let formats = vec![DataFormat::JsonMessage, DataFormat::JsonEvent];

        for format in formats {
            let json = serde_json::to_string(&format).unwrap();
            let deserialized: DataFormat = serde_json::from_str(&json).unwrap();
            assert_eq!(deserialized, format);
        }
    }

    // StreamRecord 与 DataFormat 集成测试
    #[test]
    fn test_stream_record_with_data_format() {
        let content = b"test content".to_vec();
        let content_len = content.len();
        let content_crc32 = crc32fast::hash(&content);

        let record = StreamRecord {
            meta: StreamRecordMeta {
                version: 1,
                content_size: content_len as u32,
                crc32: content_crc32,
                data_format: DataFormat::JsonEvent,
            },
            content: content.clone(),
            tail: StreamRecordMeta {
                version: 1,
                content_size: content_len as u32,
                crc32: content_crc32,
                data_format: DataFormat::JsonEvent,
            },
        };

        let encoded = record.encode().unwrap();
        let decoded = StreamRecord::decode(&encoded).unwrap();

        assert_eq!(decoded.meta.data_format, DataFormat::JsonEvent);
        assert_eq!(decoded.tail.data_format, DataFormat::JsonEvent);
        assert_eq!(decoded.content, b"test content");
    }

    #[test]
    fn test_message_with_data_format() {
        let message = Message {
            id: 1,
            user_id: Uuid::new_v4(),
            content: json!("Test message"),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        };

        let encoded = message.encode().unwrap();
        let decoded = Message::decode(&encoded).unwrap();

        assert_eq!(decoded.id, message.id);
        assert_eq!(decoded.content, message.content);
    }
}
