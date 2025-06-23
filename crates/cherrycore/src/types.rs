use std::vec;

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
