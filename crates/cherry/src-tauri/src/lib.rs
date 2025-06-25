// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod db;

use anyhow::Result;
use env_logger;
use serde::Serialize;
use std::sync::Mutex;
use tauri::{ipc::Channel, Emitter, Manager, State};

use crate::db::{
    models::{Contact as DbContact, User},
    repo::Repo,
};
use cherrycore::{
    client::{
        cherry::{AuthCredentials, CherryClient},
        stream::{StreamClient, StreamRecordDecoderMachine},
    },
    types::{
        CherryMessage, Contact, Conversation, DataFormat, LoginResponse, Message, StreamEvent,
        StreamReadRequest,
    },
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
    //repo: Repo,
    cherry_client: Mutex<Option<CherryClient>>,
    stream_client: Mutex<Option<StreamClient>>,
    conversations: Mutex<Vec<Conversation>>,
}

impl AppState {
    fn get_cherry_client(&self) -> Result<CherryClient> {
        let guard = self.cherry_client.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or(anyhow::anyhow!("Not authenticated"))
    }

    fn get_stream_client(&self) -> Result<StreamClient> {
        let guard = self.stream_client.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or(anyhow::anyhow!("Not authenticated"))
    }

    async fn emit_contacts_updated(&self, app: &tauri::AppHandle) -> Result<()> {
        let cherry_client = self.get_cherry_client()?;
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
                log::info!(
                    "Emitted contacts_updated event with {} contacts",
                    contacts.len()
                );
            }
            Err(e) => {
                log::error!("Failed to get contacts: {}", e);
            }
        }
        Ok(())
    }

    async fn emit_conversations_updated(&self, app: &tauri::AppHandle) -> Result<()> {
        // 获取会话列表
        let cherry_client = self.get_cherry_client()?;
        match cherry_client.get_conversations().await {
            Ok(conversations) => {
                // 通知前端更新会话列表
                *self.conversations.lock().unwrap() = conversations.clone();
                let event = NotificationEvent {
                    event_type: "conversations_updated".to_string(),
                    data: serde_json::json!({
                        "count": conversations.len(),
                        "conversations": conversations
                    }),
                    timestamp: chrono::Utc::now().timestamp(),
                };

                app.emit("notification", &event).unwrap();
                log::info!(
                    "Emitted conversations_updated event with {} conversations",
                    conversations.len()
                );
            }
            Err(e) => {
                log::error!("Failed to get conversations: {}", e);
            }
        }
        Ok(())
    }

    async fn start_receive_message(&self, on_event: Channel<CherryMessage>) -> Result<()> {
        let stream_client = self.get_stream_client()?;
        let (sender, mut receiver) = stream_client.open_stream().await?;

        let mut decoder_machine = StreamRecordDecoderMachine::new();
        tokio::spawn(async move {
            while let Some(response) = receiver.recv().await {
                log::info!("Received message: {:?}", response);
                let records = decoder_machine.decode(
                    response.stream_id,
                    response.offset,
                    response.data.as_slice(),
                );
                if let Ok(Some(records)) = records {
                    for (record, offset) in records {
                        match record.meta.data_format {
                            DataFormat::JsonMessage => {
                                let decoded_message: Message =
                                    serde_json::from_slice(&record.content).unwrap();
                                log::info!("Decoded message: {:?}", decoded_message);
                                on_event
                                    .send(CherryMessage::Message(decoded_message))
                                    .unwrap();
                            }
                            DataFormat::JsonEvent => {
                                let decoded_event: StreamEvent =
                                    serde_json::from_slice(&record.content).unwrap();
                                log::info!("Decoded event: {:?}", decoded_event);
                                on_event.send(CherryMessage::Event(decoded_event)).unwrap();
                            }
                        }
                    }
                }
            }
        });

        // Collect conversations into a local variable to avoid holding MutexGuard across async boundary
        let conversations = self.conversations.lock().unwrap().clone();
        for conversation in conversations {
            let stream_id = conversation.stream_id;
            sender
                .send(StreamReadRequest {
                    stream_id,
                    offset: 0,
                })
                .await?;
        }

        Ok(())
    }

    async fn init(&self, app: &tauri::AppHandle) -> Result<()> {
        self.emit_contacts_updated(app).await?;
        self.emit_conversations_updated(app).await?;
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
    email: String,
    password: String,
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    on_event: Channel<CherryMessage>,
) -> Result<cherrycore::types::UserInfo, CommandError> {
    log::info!("cmd_login: username={}, password={}", email, password);
    let cherry_client = CherryClient::new().expect("Failed to create Cherry client");

    let login_response: LoginResponse = cherry_client
        .login(&email, &password)
        .await
        .map_err(CommandError::from)?;

    let cherry_client = cherry_client.with_auth(AuthCredentials {
        user_id: login_response.user_info.user_id,
        jwt_token: login_response.jwt_token.clone(),
    });
    state.cherry_client.lock().unwrap().replace(cherry_client);

    let stream_client = StreamClient::new(
        "http://localhost:8080",
        Some(login_response.jwt_token.clone()),
    );
    state.stream_client.lock().unwrap().replace(stream_client);

    // 登录成功后初始化数据并通知前端
    state.init(&app).await.map_err(CommandError::from)?;
    
    // 启动消息接收
    state.start_receive_message(on_event).await?;

    Ok(login_response.user_info)
}

#[tauri::command]
async fn cmd_contact_list_all(state: State<'_, AppState>) -> Result<Vec<Contact>, CommandError> {
    let cherry_client = state.get_cherry_client()?;
    let contacts = cherry_client
        .get_contacts()
        .await
        .map_err(CommandError::from)?;
    Ok(contacts)
}

#[tauri::command]
async fn cmd_conversation_list_all(
    state: State<'_, AppState>,
) -> Result<Vec<Conversation>, CommandError> {
    let cherry_client = state.get_cherry_client()?;

    let conversations = cherry_client
        .get_conversations()
        .await
        .map_err(CommandError::from)?;
    log::info!(
        "cmd_conversation_list_all: conversations={:?}",
        conversations
    );
    Ok(conversations)
}

#[tauri::command]
async fn cmd_refresh_contacts(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<Vec<Contact>, CommandError> {
    let cherry_client = state.get_cherry_client()?;

    let contacts = cherry_client
        .get_contacts()
        .await
        .map_err(CommandError::from)?;

    // 通知前端更新联系人列表
    state.emit_notification(
        &app,
        "contacts_updated",
        serde_json::json!({
            "count": contacts.len(),
            "contacts": contacts
        }),
    );

    Ok(contacts)
}

#[tauri::command]
async fn cmd_refresh_conversations(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<Vec<Conversation>, CommandError> {
    let cherry_client = state.get_cherry_client()?;

    let conversations = cherry_client
        .get_conversations()
        .await
        .map_err(CommandError::from)?;

    // 通知前端更新会话列表
    state.emit_notification(
        &app,
        "conversations_updated",
        serde_json::json!({
            "count": conversations.len(),
            "conversations": conversations
        }),
    );

    Ok(conversations)
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
            conversations: Mutex::new(vec![]),
            stream_client: Mutex::new(None),
            cherry_client: Mutex::new(None),
            // todo: 需要重新设计
            // repo: Repo::new(db_path.to_str().unwrap()).await,
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd_login,
            cmd_contact_list_all,
            cmd_conversation_list_all,
            cmd_refresh_contacts,
            cmd_refresh_conversations
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
