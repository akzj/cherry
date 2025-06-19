// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod client;
mod db;
use anyhow::Result;

use serde::Serialize;
use tauri::State;

use crate::client::CherryClientOptions;
use crate::db::{models::*, repo::*};
use cherrycore::types::*;

trait CherryClient {
    async fn new(options: CherryClientOptions) -> Self;
    async fn contact_list_all(&self) -> Result<Vec<Contact>>;
    async fn user_get_by_id(&self, id: u64) -> Result<User>;
    async fn conversation_list_all(&self) -> Result<Vec<Conversation>>;
    async fn login_request(server_url: String, req: LoginRequest) -> Result<LoginResponse>;
}

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

struct AppState {
    repo: Repo,
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

    let db_path= std::env::current_dir().unwrap().join("sqlite.db");
    println!("db_path: {}", db_path.to_str().unwrap());
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            repo: Repo::new(db_path.to_str().unwrap()).await,
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd_user_get_by_id,
            cmd_contact_list_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
