// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod db;

use anyhow::Result;
use serde::Serialize;
use std::sync::Mutex;
use tauri::{State, Manager, Emitter};
use env_logger;

use crate::db::{
    models::{Contact as DbContact, User},
    repo::Repo,
};
use cherrycore::{
    client::cherry::{AuthCredentials, CherryClient},
    types::{LoginResponse, Conversation, Contact},
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

// 通知事件数据
#[derive(Debug, Serialize)]
struct NotificationEvent {
    #[serde(rename = "type")]
    event_type: String,
    data: serde_json::Value,
    timestamp: i64,
}

struct AppState {
    repo: Repo,
    cherry_client: Mutex<Option<CherryClient>>,
}

impl AppState {
    async fn init(&self, app: &tauri::AppHandle) -> Result<()> {
        let cherry_client = {
            let guard = self.cherry_client.lock().unwrap();
            guard.as_ref().cloned()
        };
        
        if let Some(cherry_client) = cherry_client {
            // 获取联系人列表
            match cherry_client.get_contacts().await {
                Ok(contacts) => {
                    // 通知前端更新联系人列表
                    let event = NotificationEvent {
                        event_type: "contacts_updated".to_string(),
                        data: serde_json::json!({
                            "count": contacts.len(),
                            "contacts": contacts
                        }),
                        timestamp: chrono::Utc::now().timestamp(),
                    };
                    
                    app.emit("notification", &event).unwrap();
                    log::info!("Emitted contacts_updated event with {} contacts", contacts.len());
                }
                Err(e) => {
                    log::error!("Failed to get contacts: {}", e);
                }
            }

            // 获取会话列表
            match cherry_client.get_conversations().await {
                Ok(conversations) => {
                    // 通知前端更新会话列表
                    let event = NotificationEvent {
                        event_type: "conversations_updated".to_string(),
                        data: serde_json::json!({
                            "count": conversations.len(),
                            "conversations": conversations
                        }),
                        timestamp: chrono::Utc::now().timestamp(),
                    };
                    
                    app.emit("notification", &event).unwrap();
                    log::info!("Emitted conversations_updated event with {} conversations", conversations.len());
                }
                Err(e) => {
                    log::error!("Failed to get conversations: {}", e);
                }
            }
        }
        
        Ok(())
    }

    // 发送通知事件
    fn emit_notification(&self, app: &tauri::AppHandle, event_type: &str, data: serde_json::Value) {
        let event = NotificationEvent {
            event_type: event_type.to_string(),
            data,
            timestamp: chrono::Utc::now().timestamp(),
        };
        
        if let Err(e) = app.emit("notification", &event) {
            log::error!("Failed to emit notification event: {}", e);
        } else {
            log::info!("Emitted {} notification event", event_type);
        }
    }
}

#[tauri::command]
async fn cmd_login(
    username: String,
    password: String,
    state: State<'_, AppState>,
    app: tauri::AppHandle,
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
    
    // 登录成功后初始化数据并通知前端
    state.init(&app).await.map_err(CommandError::from)?;
    
    Ok(login_response.user_info)
}

#[tauri::command]
async fn cmd_contact_list_all(state: State<'_, AppState>) -> Result<Vec<DbContact>, CommandError> {
    let contacts = state
        .repo
        .contact_list_all()
        .await
        .map_err(CommandError::from)?;
    Ok(contacts)
}

#[tauri::command]
async fn cmd_conversation_list_all(state: State<'_, AppState>) -> Result<Vec<Conversation>, CommandError> {
    let cherry_client = {
        let guard = state.cherry_client.lock().unwrap();
        guard.as_ref().cloned()
    };
    
    if let Some(cherry_client) = cherry_client {
        let conversations = cherry_client.get_conversations().await.map_err(CommandError::from)?;
        Ok(conversations)
    } else {
        Err(CommandError {
            message: "Not authenticated".to_string(),
        })
    }
}

#[tauri::command]
async fn cmd_refresh_contacts(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<Vec<Contact>, CommandError> {
    let cherry_client = {
        let guard = state.cherry_client.lock().unwrap();
        guard.as_ref().cloned()
    };
    
    if let Some(cherry_client) = cherry_client {
        let contacts = cherry_client.get_contacts().await.map_err(CommandError::from)?;
        
        // 通知前端更新联系人列表
        state.emit_notification(&app, "contacts_updated", serde_json::json!({
            "count": contacts.len(),
            "contacts": contacts
        }));
        
        Ok(contacts)
    } else {
        Err(CommandError {
            message: "Not authenticated".to_string(),
        })
    }
}

#[tauri::command]
async fn cmd_refresh_conversations(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<Vec<Conversation>, CommandError> {
    let cherry_client = {
        let guard = state.cherry_client.lock().unwrap();
        guard.as_ref().cloned()
    };
    
    if let Some(cherry_client) = cherry_client {
        let conversations = cherry_client.get_conversations().await.map_err(CommandError::from)?;
        
        // 通知前端更新会话列表
        state.emit_notification(&app, "conversations_updated", serde_json::json!({
            "count": conversations.len(),
            "conversations": conversations
        }));
        
        Ok(conversations)
    } else {
        Err(CommandError {
            message: "Not authenticated".to_string(),
        })
    }
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
            cmd_contact_list_all,
            cmd_conversation_list_all,
            cmd_refresh_contacts,
            cmd_refresh_conversations
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
