use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

use chrono::DateTime;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_with::{base64::Base64, serde_as};
use uuid::Uuid;

use crate::jwt::AuthError;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    #[serde(rename = "type")]
    pub type_: String, // username_password, github_oauth
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub avatar_url: Option<String>,
    pub status: String,
    pub jwt_token: String,
}

#[derive(Debug, Serialize, Deserialize)]

pub struct StreamAppendRequest {
    pub stream_id: u64,
    pub data: Option<Vec<u8>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamReadRequest {
    pub stream_id: u64,
    pub offset: u64,
}

#[serde_as]
#[derive(Debug, Serialize, Deserialize)]
pub struct StreamReadResponse {
    pub stream_id: u64,
    pub offset: u64,
    #[serde_as(as = "Base64")]
    pub data: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamAppendResponse {
    pub stream_id: u64,
    pub offset: u64, // 偏移量
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckAclRequest {
    pub user_id: Uuid,
    pub stream_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckAclResponse {
    pub allowed: bool,
}

pub enum ResponseError {
    InternalError(anyhow::Error),
    AuthError(AuthError),
    DataEmpty,
    DataTooLarge,
    DataInvalid,
    StreamNotFound,
    Forbidden,
}

impl IntoResponse for ResponseError {
    fn into_response(self) -> Response {
        match self {
            Self::InternalError(error) => {
                (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()).into_response()
            }
            Self::AuthError(error) => (StatusCode::UNAUTHORIZED, error.to_string()).into_response(),
            Self::DataEmpty => (StatusCode::BAD_REQUEST, "data is empty").into_response(),
            Self::DataTooLarge => (StatusCode::BAD_REQUEST, "data is too large").into_response(),
            Self::DataInvalid => (StatusCode::BAD_REQUEST, "data is invalid").into_response(),
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

#[derive(Debug, Serialize, Deserialize)]
pub struct ListStreamRequest {
    pub user_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Stream {
    pub stream_id: i64,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    pub conversation_id: Uuid,
    pub conversation_type: String,
    pub members: Value,
    pub meta: Value,
    pub stream_id: i64,
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
    pub stream_id: i64,
    pub offset: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateStreamOffsetResponse {
    pub stream_id: i64,
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
    pub is_new: bool,              // 是否是新创建的会话（用于1对1重复检测）
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
            username: Some("testuser".to_string()),
            password: Some("testpass".to_string()),
        };
        
        let json = serde_json::to_string(&request).unwrap();
        let deserialized: LoginRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.type_, "username_password");
        assert_eq!(deserialized.username, Some("testuser".to_string()));
        assert_eq!(deserialized.password, Some("testpass".to_string()));
    }

    #[test]
    fn test_login_request_oauth() {
        let request = LoginRequest {
            type_: "github_oauth".to_string(),
            username: None,
            password: None,
        };
        
        let json = serde_json::to_string(&request).unwrap();
        let deserialized: LoginRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.type_, "github_oauth");
        assert_eq!(deserialized.username, None);
        assert_eq!(deserialized.password, None);
    }

    #[test]
    fn test_login_response_serialization() {
        let user_id = Uuid::new_v4();
        let response = LoginResponse {
            user_id,
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: Some("https://example.com/avatar.jpg".to_string()),
            status: "active".to_string(),
            jwt_token: "test_token".to_string(),
        };
        
        let json = serde_json::to_string(&response).unwrap();
        let deserialized: LoginResponse = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.user_id, user_id);
        assert_eq!(deserialized.username, "testuser");
        assert_eq!(deserialized.email, "test@example.com");
        assert_eq!(deserialized.avatar_url, Some("https://example.com/avatar.jpg".to_string()));
        assert_eq!(deserialized.status, "active");
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
        assert_eq!(response.status(), axum::http::StatusCode::INTERNAL_SERVER_ERROR);

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
            ResponseError::InternalError(_) => {},
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
        assert_eq!(deserialized.conversations[0].conversation_id, conversation_id);
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
            username: Some("user".to_string()),
            password: Some("pass".to_string()),
        };
        let debug_str = format!("{:?}", login_request);
        assert!(debug_str.contains("LoginRequest"));
        
        let login_response = LoginResponse {
            user_id,
            username: "test".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: None,
            status: "active".to_string(),
            jwt_token: "token".to_string(),
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

    #[test]
    fn test_create_conversation_response_serialization() {
        let conversation_id = Uuid::new_v4();
        let user1 = Uuid::new_v4();
        let user2 = Uuid::new_v4();
        let now = chrono::Utc::now();
        
        let response = CreateConversationResponse {
            conversation_id,
            conversation_type: "group".to_string(),
            members: vec![user1, user2],
            meta: json!({"name": "Test Group"}),
            stream_id: 789,
            created_at: now,
            is_new: true,
        };
        
        let json = serde_json::to_string(&response).unwrap();
        let deserialized: CreateConversationResponse = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.conversation_id, conversation_id);
        assert_eq!(deserialized.conversation_type, "group");
        assert_eq!(deserialized.members.len(), 2);
        assert_eq!(deserialized.stream_id, 789);
        assert_eq!(deserialized.is_new, true);
    }
}
