use std::path::PathBuf;

use anyhow::Result;
use axum::{
    Json, Router,
    extract::State,
    http::HeaderMap,
    routing::{get, post},
};
use cherrycore::types::*;
use serde::Deserialize;
use tokio::net::TcpListener;

use crate::{
    db::{models::Contact, repo::Repo},
    jwt::{Jwt, JwtConfig},
};

#[derive(Clone, Deserialize)]
pub(crate) struct ServerConfig {
    pub(crate) expire_time: u64,
    pub(crate) db_url: String,
    pub(crate) jwt_secret: String,
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
    jwt: Jwt,
}

type Rejection = (axum::http::StatusCode, String);

fn get_token(headers: HeaderMap) -> Result<String, Rejection> {
    let token = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|v| v.to_string())
        .ok_or((
            axum::http::StatusCode::UNAUTHORIZED,
            "Unauthorized".to_string(),
        ))?;
    Ok(token)
}

#[axum::debug_handler]
async fn list_contacts(
    headers: HeaderMap,
    server: State<CherryServer>,
) -> Result<Json<Vec<Contact>>, Rejection> {
    let token = get_token(headers)?;
    let user_id = server
        .jwt
        .verify_token(&token)
        .map_err(|e| (axum::http::StatusCode::UNAUTHORIZED, e.to_string()))?
        .user_id;
    let contacts = server
        .db
        .list_contacts(user_id)
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(contacts))
}

#[axum::debug_handler]
async fn login(
    server: State<CherryServer>,
    body: Json<LoginRequest>,
) -> Result<Json<LoginResponse>, Rejection> {
    let user = server
        .db
        .check_password(
            body.username.as_ref().unwrap(),
            body.password.as_ref().unwrap(),
        )
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if !user {
        return Err((
            axum::http::StatusCode::UNAUTHORIZED,
            "Invalid username or password".to_string(),
        ));
    }

    let user = server
        .db
        .user_get_by_username(body.username.as_ref().unwrap())
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let jwt_token = server
        .jwt
        .generate_token(JwtClaims {
            user_id: user.user_id,
            exp: 0, // TODO: set exp
            iat: 0, // TODO: set iat
        })
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

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
        let jwt_secret = config.jwt_secret.clone();
        Self {
            db,
            config: config.clone(),
            jwt: Jwt::new(JwtConfig {
                secret: jwt_secret,
                expire_time: config.expire_time,
            }),
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
