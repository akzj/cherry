// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod db;

use anyhow::Result;
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
use env_logger;

use crate::db::{
    models::{Contact, User},
    repo::Repo,
};
use cherrycore::{
    client::cherry::{AuthCredentials, CherryClient},
    types::LoginResponse,
};

#[derive(Debug, Serialize)]
struct CommandError {
    message: String,
}

impl From<anyhow::Error> for CommandError {
    fn from(err: anyhow::Error) -> Self {
        CommandError {
            message: err.to_string(),
        }
    }
}

impl From<sqlx::Error> for CommandError {
    fn from(err: sqlx::Error) -> Self {
        CommandError {
            message: err.to_string(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct Options {
    // stream data pull/push server
    stream_server: String,
    // chat server
    cherry_server: String,
    user_id: u64,
}

// 用户信息结构

struct AppState {
    repo: Repo,
    cherry_client: Mutex<Option<CherryClient>>,
}

impl AppState {
    async fn init(&self) -> Result<()> {
        let mut cherry_client = self.cherry_client.lock().unwrap().as_ref().unwrap().clone();

        let contract = cherry_client.get_contacts().await;

        Ok(())
    }
}

#[tauri::command]
async fn cmd_login(
    username: String,
    password: String,
    state: State<'_, AppState>,
) -> Result<cherrycore::types::UserInfo, CommandError> {
    log::info!("cmd_login: username={}, password={}", username, password);
    let cherry_client = CherryClient::new().expect("Failed to create Cherry client");

    let login_response: LoginResponse = cherry_client
        .login(&username, &password)
        .await
        .map_err(CommandError::from)?;
    let cherry_client = cherry_client.with_auth(AuthCredentials {
        user_id: login_response.user_info.user_id,
        jwt_token: login_response.jwt_token,
    });
    state.cherry_client.lock().unwrap().replace(cherry_client);
    Ok(login_response.user_info)
}

#[tauri::command]
async fn cmd_contact_list_all(state: State<'_, AppState>) -> Result<Vec<Contact>, CommandError> {
    let contacts = state
        .repo
        .contact_list_all()
        .await
        .map_err(CommandError::from)?;
    Ok(contacts)
}

#[tauri::command]
async fn cmd_user_get_by_id(id: i32, state: State<'_, AppState>) -> Result<User, CommandError> {
    let user = state
        .repo
        .user_get_by_id(id)
        .await
        .map_err(CommandError::from)?;
    Ok(user)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("debug"));

    let db_path = std::env::current_dir().unwrap().join("sqlite.db");
    println!("db_path: {}", db_path.to_str().unwrap());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            repo: Repo::new(db_path.to_str().unwrap()).await,
            cherry_client: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd_login,
            cmd_user_get_by_id,
            cmd_contact_list_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
