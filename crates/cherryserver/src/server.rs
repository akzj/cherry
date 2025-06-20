use std::path::PathBuf;

use anyhow::Result;
use axum::{
    Json, Router,
    extract::State,
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

impl CherryServer {
    pub(crate) async fn new(config: ServerConfig) -> Self {
        let db = Repo::new(&config.db_url).await;
        Self {
            db,
            config: config.clone(),
        }
    }
}

pub(crate) async fn start(server: CherryServer) {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/contract/list", get(list_contacts))
        .with_state(server.clone());

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
