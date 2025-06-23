use std::path::PathBuf;

use anyhow::Result;
use axum::{
    Json, Router,
    extract::{Query, State},
    routing::{get, post},
};
use cherrycore::{
    jwt::{AuthError, JwtClaims},
    types::*,
};
use serde::Deserialize;
use tokio::net::TcpListener;

use crate::db::{models::Contact, repo::Repo};

#[derive(Clone, Deserialize)]
pub(crate) struct ServerConfig {
    pub(crate) db_url: String,
    pub(crate) stream_server_url: String,
    pub(crate) expire_time: u64,
}

impl ServerConfig {
    pub(crate) async fn load(filename: PathBuf) -> Result<Self> {
        let content = tokio::fs::read_to_string(filename).await?;
        let config = serde_yaml::from_str(&content)
            .map_err(|e| anyhow::anyhow!("Failed to load config: {}", e))?;
        Ok(config)
    }
}
#[derive(Clone)]
pub(crate) struct CherryServer {
    config: ServerConfig,
    db: Repo,
    stream_client: cherrycore::client::stream::StreamClient,
}

#[axum::debug_handler]
async fn list_contacts(
    server: State<CherryServer>,
    claims: JwtClaims,
) -> Result<Json<Vec<Contact>>, ResponseError> {
    let user_id = claims.user_id;
    let contacts = server.db.list_contacts(user_id).await?;
    Ok(Json(contacts))
}

#[axum::debug_handler]
async fn list_streams(
    server: State<CherryServer>,
    request: Query<ListStreamRequest>,
) -> Result<Json<ListStreamResponse>, ResponseError> {
    let user_id = request.user_id;
    let streams = server.db.list_streams(user_id).await?;
    Ok(Json(ListStreamResponse {
        streams: streams
            .into_iter()
            .map(|s| Stream {
                stream_id: s.stream_id,
                owner_id: s.owner_id,
                stream_type: s.stream_type,
                status: s.status,
                offset: s.offset,
                stream_meta: s.stream_meta.clone(),
                created_at: s.created_at,
                updated_at: s.updated_at,
            })
            .collect(),
    }))
}

#[axum::debug_handler]
async fn list_conversations(
    server: State<CherryServer>,
    claims: JwtClaims,
) -> Result<Json<ListConversationsResponse>, ResponseError> {
    let user_id = claims.user_id;
    let conversations = server.db.list_conversations(user_id).await?;
    Ok(Json(ListConversationsResponse {
        conversations: conversations
            .into_iter()
            .map(|c| cherrycore::types::Conversation {
                conversation_id: c.conversation_id,
                conversation_type: c.conversation_type,
                members: c.members.clone(),
                meta: c.meta.clone(),
                stream_id: c.stream_id,
                created_at: c.created_at,
                updated_at: c.updated_at,
            })
            .collect(),
    }))
}

#[axum::debug_handler]
async fn login(
    server: State<CherryServer>,
    body: Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ResponseError> {
    let user = server
        .db
        .check_password(
            body.username.as_ref().unwrap(),
            body.password.as_ref().unwrap(),
        )
        .await?;

    if !user {
        return Err(AuthError::WrongCredentials.into());
    }

    let user = server
        .db
        .user_get_by_username(body.username.as_ref().unwrap())
        .await?;

    let jwt_token = JwtClaims::new(user.user_id, server.config.expire_time).to_token()?;

    Ok(Json(LoginResponse {
        jwt_token,
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        status: user.status,
    }))
}

#[axum::debug_handler]
async fn check_acl(
    server: State<CherryServer>,
    body: Json<CheckAclRequest>,
) -> Result<Json<CheckAclResponse>, ResponseError> {
    let allowed = server.db.check_acl(body.user_id, body.stream_id).await?;
    Ok(Json(CheckAclResponse { allowed }))
}

#[axum::debug_handler]
async fn update_stream_offset(
    server: State<CherryServer>,
    claims: JwtClaims,
    body: Json<UpdateStreamOffsetRequest>,
) -> Result<Json<UpdateStreamOffsetResponse>, ResponseError> {
    let user_id = claims.user_id;
    
    // Check if user has access to this stream
    let allowed = server.db.check_acl(user_id, body.stream_id).await?;
    if !allowed {
        return Err(ResponseError::Forbidden);
    }
    
    // Update the stream offset
    server.db.update_stream_offset(body.stream_id, body.offset).await?;
    
    Ok(Json(UpdateStreamOffsetResponse {
        stream_id: body.stream_id,
        offset: body.offset,
        success: true,
    }))
}

#[axum::debug_handler]
async fn create_conversation(
    server: State<CherryServer>,
    claims: JwtClaims,
    body: Json<CreateConversationRequest>,
) -> Result<Json<CreateConversationResponse>, ResponseError> {
    let creator_id = claims.user_id;
    
    // 验证请求参数
    if body.members.is_empty() {
        return Err(ResponseError::DataInvalid);
    }
    
    // 确保创建者包含在成员列表中
    let mut members = body.members.clone();
    if !members.contains(&creator_id) {
        members.push(creator_id);
    }
    
    // 验证会话类型
    let conversation_type = match body.conversation_type.as_str() {
        "direct" => {
            if members.len() != 2 {
                return Err(ResponseError::DataInvalid);
            }
            "direct"
        }
        "group" => {
            if members.len() < 2 {
                return Err(ResponseError::DataInvalid);
            }
            "group"
        }
        _ => return Err(ResponseError::DataInvalid),
    };
    
    // 设置默认元数据
    let default_meta = serde_json::json!({});
    let meta = body.meta.as_ref().unwrap_or(&default_meta);
    
    // 创建会话和流
    let (conversation, _stream, is_new) = server.db.create_conversation_with_stream(
        creator_id,
        conversation_type,
        &members,
        meta
    ).await?;
    
    // TODO: 向streamserver发送通知
    // 这里需要调用streamserver的API来发送会话创建通知
    
    Ok(Json(CreateConversationResponse {
        conversation_id: conversation.conversation_id,
        conversation_type: conversation.conversation_type,
        members: members,
        meta: conversation.meta,
        stream_id: conversation.stream_id,
        created_at: conversation.created_at,
        is_new,
    }))
}

impl CherryServer {
    pub(crate) async fn new(config: ServerConfig) -> Self {
        let db = Repo::new(&config.db_url).await;
        let stream_client = cherrycore::client::stream::StreamClient::new(config.stream_server_url.clone());
        Self {
            db,
            config: config.clone(),
            stream_client,
        }
    }
}

pub(crate) async fn start(server: CherryServer) {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/contract/list", get(list_contacts))
        .route("/api/v1/streams/list", get(list_streams))
        .route("/api/v1/conversations/list", get(list_conversations))
        .route("/api/v1/acl/check", get(check_acl))
        .route("/api/v1/streams/update_offset", post(update_stream_offset))
        .route("/api/v1/conversations/create", post(create_conversation))
        
        .with_state(server.clone());

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
