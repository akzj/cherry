// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod client;
mod db;
mod types;
use anyhow::Result;
use diesel::r2d2::{self, ConnectionManager};
use diesel::result::Error as DieselError;
use diesel::SqliteConnection;
use serde::Serialize;
use tauri::State;

use crate::client::CherryClientOptions;
use crate::db::{api::*, models::*};
use crate::types::*;

type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

trait CherryClient {
    async fn new(options: CherryClientOptions) -> Self;
    async fn contact_list_all(&self) -> Result<Vec<Contact>>;
    async fn user_get_by_id(&self, id: u64) -> Result<User>;
    async fn conversation_list_all(&self) -> Result<Vec<Conversation>>;
    async fn login_request(server_url: String, req: LoginReq) -> Result<LoginResp>;
}

#[derive(Debug, Serialize)]
struct CommandError {
    message: String,
}

impl From<DieselError> for CommandError {
    fn from(err: DieselError) -> Self {
        CommandError {
            message: err.to_string(),
        }
    }
}

impl From<anyhow::Error> for CommandError {
    fn from(err: anyhow::Error) -> Self {
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
    db_pool: DbPool,
}

#[tauri::command]
async fn cmd_contact_list_all(state: State<'_, AppState>) -> Result<Vec<Contact>, CommandError> {
    let mut conn = state.db_pool.get().unwrap();
    let contacts = crate::db::api::contact_list_all(&mut *conn).map_err(CommandError::from)?;
    Ok(contacts)
}

#[tauri::command]
async fn cmd_user_get_by_id(id: i32, state: State<'_, AppState>) -> Result<User, CommandError> {
    let mut conn = state.db_pool.get().unwrap();
    let user = user_get_by_id(&mut *conn, id).map_err(CommandError::from)?;
    Ok(user)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manager = ConnectionManager::<SqliteConnection>::new("cherry.db");
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { db_pool: pool })
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd_user_get_by_id,
            cmd_contact_list_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
