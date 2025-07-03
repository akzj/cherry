// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod db;

use anyhow::{Context, Result};
use cherrycore::client::file::FileClient;
use cherrycore::types::{FileUploadCompleteResponse, FileUploadCreateResponse};
use env_logger;
use serde::Serialize;
use std::collections::HashMap;
use std::io::Write;
use std::path::PathBuf;
use std::{
    env,
    sync::{Arc, Mutex},
};
use streamstore::StreamId;
use tauri::{ipc::Channel, Emitter, Manager, State};
use tokio::fs::File;
use tokio::sync::mpsc;
use uuid;
use uuid::Uuid;
use tauri_plugin_log::{Target, TargetKind};
use crate::db::{
    models::{Contact as DbContact, User},
    repo::Repo,
};
use cherrycore::{
    client::{
        cherry::CherryClient,
        stream::{StreamClient, StreamRecordDecoderMachine},
        AuthCredentials,
    },
    types::{
        CherryMessage, Contact, Conversation, DataFormat, LoginResponse, Message, StreamEvent,
        StreamReadRequest, UserInfo,
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

impl From<std::io::Error> for CommandError {
    fn from(err: std::io::Error) -> Self {
        CommandError {
            message: err.to_string(),
        }
    }
}

impl From<reqwest::Error> for CommandError {
    fn from(err: reqwest::Error) -> Self {
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

struct AppStateInner {
    cherry_client: Mutex<Option<CherryClient>>,
    stream_client: Mutex<Option<StreamClient>>,
    file_client: Mutex<Option<FileClient>>,
    conversations: Mutex<Vec<Conversation>>,
    user_info: Mutex<Option<UserInfo>>,
    conversation_read_position: Mutex<HashMap<Uuid, i64>>,
    read_stream_sender: Mutex<Option<mpsc::Sender<StreamReadRequest>>>,
}

#[derive(Clone)]
struct AppState {
    inner: Arc<AppStateInner>,
}

impl std::ops::Deref for AppState {
    type Target = AppStateInner;
    fn deref(&self) -> &Self::Target {
        return &self.inner;
    }
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

    fn get_file_client(&self) -> Result<FileClient> {
        let guard = self.file_client.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or(anyhow::anyhow!("Not authenticated"))
    }

    fn find_conversation_id(&self, stream_id: StreamId) -> Result<uuid::Uuid> {
        let guard = self.conversations.lock().unwrap();
        guard
            .iter()
            .find_map(|c| {
                if c.stream_id == stream_id {
                    Some(c.conversation_id)
                } else {
                    None
                }
            })
            .ok_or_else(|| anyhow::anyhow!("Conversation not found for stream_id: {}", stream_id))
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
        let state = self.clone();
        tokio::spawn(async move {
            let mut decoder_machine = StreamRecordDecoderMachine::new();
            // state.init(&app).await.map_err(CommandError::from)?;
            let stream_client = state.get_stream_client().unwrap();
            let (sender, mut receiver) = stream_client
                .open_stream()
                .await
                .context("Failed to open stream")
                .unwrap();

            let cherry_client = state.get_cherry_client().unwrap();
            let conversations = cherry_client
                .get_conversations()
                .await
                .map_err(|e| anyhow::anyhow!("Failed to get conversations: {}", e))
                .unwrap();
            log::info!("start_receive_message: conversations={:?}", conversations);
            *state.conversations.lock().unwrap() = conversations;

            // Collect conversations into a local variable to avoid holding MutexGuard across async boundary
            let conversations = state.conversations.lock().unwrap().clone();
            for conversation in conversations {
                let stream_id = conversation.stream_id;
                log::info!(
                    "start_receive_message: conversation_id={}, stream_id={}",
                    conversation.conversation_id,
                    stream_id
                );
                sender
                    .send(StreamReadRequest {
                        stream_id,
                        offset: 0,
                    })
                    .await
                    .map_err(|e| anyhow::anyhow!("Failed to send StreamReadRequest: {}", e))
                    .unwrap();
            }

            state.read_stream_sender.lock().unwrap().replace(sender);

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
                                let conversation_id =
                                    state.find_conversation_id(response.stream_id);
                                if conversation_id.is_err() {
                                    log::info!(
                                        "find_conversation_id error: {:?}",
                                        conversation_id.err()
                                    );
                                    continue;
                                }
                                let mut decoded_message: Message =
                                    serde_json::from_slice(&record.content).unwrap();
                                decoded_message.id = offset as i64;
                                log::info!(
                                    "Decoded message: stream_id={}, offset={}, {:?}",
                                    response.stream_id,
                                    offset,
                                    decoded_message
                                );
                                on_event
                                    .send(CherryMessage::Message {
                                        message: decoded_message,
                                        conversation_id: conversation_id.unwrap(),
                                    })
                                    .unwrap();
                            }
                            DataFormat::JsonEvent => {
                                let decoded_event: StreamEvent =
                                    serde_json::from_slice(&record.content).unwrap();
                                log::info!("Decoded event: {:?}", decoded_event);
                                on_event
                                    .send(CherryMessage::Event {
                                        event: decoded_event,
                                    })
                                    .unwrap();
                            }
                        }
                    }
                }
            }
        });

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
    on_event: Channel<CherryMessage>,
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<serde_json::Value, CommandError> {
    log::info!("cmd_login: username={}, password={}", email, password);
    let cherry_client = CherryClient::new().expect("Failed to create Cherry client");

    let login_response: LoginResponse = cherry_client
        .login(&email, &password)
        .await
        .map_err(CommandError::from)?;

    log::info!("login_response: {:?}", login_response);

    let cherry_client =
        cherry_client.with_auth((&login_response.user_info.user_id, &login_response.jwt_token));
    state.cherry_client.lock().unwrap().replace(cherry_client);

    let stream_client = StreamClient::new(
        "http://localhost:8080",
        (&login_response.user_info.user_id, &login_response.jwt_token),
    );
    state.stream_client.lock().unwrap().replace(stream_client);

    let file_client = FileClient::new(
        "http://localhost:8280",
        (&login_response.user_info.user_id, &login_response.jwt_token),
    );
    state.file_client.lock().unwrap().replace(file_client);

    // 登录成功后初始化数据并通知前端

    // 启动消息接收
    match state.start_receive_message(on_event).await {
        Ok(_) => log::info!("Message receiver started"),
        Err(e) => log::error!("Failed to start message receiver: {:?}", e),
    }

    // 克隆user_info以避免移动问题
    let user_info = login_response.user_info.clone();
    state.user_info.lock().unwrap().replace(user_info.clone());

    // 返回包含jwt_token的完整响应
    let response = serde_json::json!({
        "user_id": user_info.user_id.to_string(),
        "username": user_info.username,
        "email": user_info.email,
        "avatar_url": user_info.avatar_url,
        "status": user_info.status,
        "jwt_token": login_response.jwt_token
    });

    Ok(response)
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

    *state.conversations.lock().unwrap() = conversations.clone();

    Ok(conversations)
}

#[tauri::command]
async fn cmd_create_conversation(
    state: State<'_, AppState>,
    conversation_type: String,
    members: Vec<Uuid>,
) -> Result<Conversation, CommandError> {
    let cherry_client = state.get_cherry_client()?;
    let conversation = match cherry_client
        .create_conversation(conversation_type, &members)
        .await
    {
        Ok(conversation) => conversation,
        Err(e) => {
            log::error!("Failed to create conversation: {:?}", e);
            return Err(CommandError {
                message: e.to_string(),
            });
        }
    };
    let sender = state
        .read_stream_sender
        .lock()
        .unwrap()
        .as_ref()
        .unwrap()
        .clone();
    sender
        .send(StreamReadRequest {
            stream_id: conversation.stream_id,
            offset: 0,
        })
        .await
        .unwrap();

    Ok(conversation)
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
async fn cmd_send_message(
    conversation_id: String,
    content: String,
    message_type: Option<String>,
    reply_to: Option<i64>,
    state: State<'_, AppState>,
) -> Result<(), CommandError> {
    log::info!(
        "cmd_send_message: conversation_id={}, content={}",
        conversation_id,
        content
    );

    // 将字符串转换为UUID
    let conversation_uuid = Uuid::parse_str(&conversation_id).map_err(|e| CommandError {
        message: format!("Invalid conversation ID format: {}", e),
    })?;

    // 获取会话信息并克隆数据，避免持有 MutexGuard 跨越 async 边界
    let stream_id = {
        let conversations = state.conversations.lock().unwrap();
        let conversation = conversations
            .iter()
            .find(|c| c.conversation_id == conversation_uuid)
            .ok_or_else(|| CommandError {
                message: format!("Conversation not found: {}", conversation_id),
            })?;
        conversation.stream_id
    };

    // 获取用户信息
    let user_id = {
        let user_info = state.user_info.lock().unwrap();
        user_info.as_ref().unwrap().user_id
    };

    // 创建消息
    let message = Message {
        id: 0, // 服务器会分配ID
        user_id,
        content,
        timestamp: chrono::Utc::now(),
        reply_to,
        type_: message_type.unwrap_or_else(|| "text".to_string()),
        image_url: None,
        image_thumbnail_url: None,
        image_metadata: None,
    };

    // 获取流客户端
    let stream_client = state.get_stream_client().unwrap();

    // 编码消息
    let encoded_data = message.encode().unwrap();

    // 发送到流服务器
    match stream_client.append_stream(stream_id, encoded_data).await {
        Ok(response) => {
            log::info!("Message sent successfully, offset: {}", response.offset);
        }
        Err(e) => {
            log::error!("Failed to send message: {:?}", e);
        }
    }

    Ok(())
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

#[tauri::command]
async fn cmd_validate_token(
    token: String,
    state: State<'_, AppState>,
) -> Result<bool, CommandError> {
    log::info!("cmd_validate_token: validating token");

    // 检查token是否为空
    if token.is_empty() {
        return Ok(false);
    }

    // 这里可以添加JWT验证逻辑
    // 暂时返回false，强制重新登录以确保安全
    log::info!("Token validation: returning false for security");
    Ok(false)
}

#[tauri::command]
async fn cmd_save_read_position(
    conversation_id: String,
    last_read_message_id: i64,
    state: State<'_, AppState>,
) -> Result<(), CommandError> {
    log::info!(
        "cmd_save_read_position: conversation_id={}, last_read_message_id={}",
        conversation_id,
        last_read_message_id
    );

    // 将字符串转换为UUID
    let conversation_uuid = Uuid::parse_str(&conversation_id).map_err(|e| CommandError {
        message: format!("Invalid conversation ID format: {}", e),
    })?;

    // 获取用户ID
    let user_id = {
        let user_info = state.user_info.lock().unwrap();
        user_info.as_ref().unwrap().user_id
    };

    // 这里应该调用后端API保存读取位置
    // 暂时只记录日志
    log::info!(
        "Saving read position for user {} in conversation {}: message_id {}",
        user_id,
        conversation_uuid,
        last_read_message_id
    );

    let mut conversation_read_position = state.conversation_read_position.lock().unwrap();
    conversation_read_position.insert(conversation_uuid, last_read_message_id);

    // TODO: 实现实际的API调用
    // let cherry_client = state.get_cherry_client()?;
    // cherry_client.save_read_position(conversation_uuid, last_read_message_id).await?;

    Ok(())
}

#[tauri::command]
async fn cmd_get_read_position(
    conversation_id: String,
    state: State<'_, AppState>,
) -> Result<Option<i64>, CommandError> {
    log::info!("cmd_get_read_position: conversation_id={}", conversation_id);

    // 将字符串转换为UUID
    let conversation_uuid = Uuid::parse_str(&conversation_id).map_err(|e| CommandError {
        message: format!("Invalid conversation ID format: {}", e),
    })?;

    // 获取用户ID
    let user_id = {
        let user_info = state.user_info.lock().unwrap();
        user_info.as_ref().unwrap().user_id
    };

    // 这里应该调用后端API获取读取位置
    // 暂时返回None
    log::info!(
        "Getting read position for user {} in conversation {}",
        user_id,
        conversation_uuid
    );

    let conversation_read_position = state.conversation_read_position.lock().unwrap();
    let read_position = conversation_read_position.get(&conversation_uuid);
    log::info!("read_position: {:?}", read_position);
    Ok(read_position.cloned())

    // TODO: 实现实际的API调用
    // let cherry_client = state.get_cherry_client()?;
    // let position = cherry_client.get_read_position(conversation_uuid).await?;

    // Ok(None)
}

#[tauri::command]
async fn cmd_download_file(
    url: String,
    file_path: String,
    state: State<'_, AppState>,
) -> Result<String, CommandError> {
    log::info!("cmd_download_file: url={} file_path={}", url, file_path);
    let client = state.get_file_client()?;
    let file_path = client.download_file(&url, &file_path).await?;
    Ok(file_path.to_string())
}

#[tauri::command]
async fn cmd_upload_file(
    conversation_id: Uuid,
    file_path: String,
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<FileUploadCompleteResponse, CommandError> {
    log::info!("cmd_create_upload_file: file_path={}", file_path);

    let mime_type = mime_guess::from_path(&file_path)
        .first_or_octet_stream()
        .to_string();
    // check is image
    let is_image = mime_type.starts_with("image/");
    // get image metadata
    let metadata = if is_image {
        let file_path = file_path.clone();
        let image = tokio::spawn(async move { image::open(&file_path) })
            .await
            .map_err(|e| CommandError {
                message: e.to_string(),
            })?
            .unwrap();
        let width = image.width();
        let height = image.height();
        Some(serde_json::json!({
            "width": width,
            "height": height,
        }))
    } else {
        None
    };

    let (tx, mut rx) = mpsc::channel(100);
    let file_client = state.get_file_client()?;
    let response = file_client
        .upload_file(
            conversation_id,
            &file_path,
            metadata,
            Box::new(move |progress| {
                let tx = tx.clone();
                tokio::spawn(async move {
                    tx.send(progress).await.unwrap();
                });
            }),
        )
        .await
        .map_err(|e| {
            log::error!("Failed to upload file: {:?}", e);
            e
        })?;
    log::info!("upload_file success: {:?}", response);

    while let Some(progress) = rx.recv().await {
        app.emit("upload_file_progress", &progress).unwrap();
        log::info!("upload_file progress: {:?}", progress);
    }

    Ok(response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    // set rust_log to use the environment variable RUST_LOG
    let log_level = "RUST_LOG";
    let env = env::var(log_level).unwrap_or_else(|_| "debug".to_string());
    unsafe {
        env::set_var(log_level, env);
    }

    // env_logger::Builder::from_default_env()
    //     .format(|buf, record| {
    //         writeln!(
    //             buf,
    //             "{}:{} level:{} {}",
    //             record.file().unwrap(),
    //             record.line().unwrap(),
    //             record.level(),
    //             record.args()
    //         )
    //     })
    //     .init();

    // let db_path = std::env::current_dir().unwrap().join("sqlite.db");
    // println!("db_path: {}", db_path.to_str().unwrap());

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            inner: Arc::new(AppStateInner {
                conversations: Mutex::new(vec![]),
                file_client: Mutex::new(None),
                stream_client: Mutex::new(None),
                cherry_client: Mutex::new(None),
                user_info: Mutex::new(None),
                conversation_read_position: Mutex::new(HashMap::new()),
                read_stream_sender: Mutex::new(None),
            }),
            // todo: 需要重新设计
            // repo: Repo::new(db_path.to_str().unwrap()).await,
        })
        .register_uri_scheme_protocol("cherry", |_app, request| {
            let url = request.uri().to_string();
            log::info!("serve_file: url={}", url);
            let query = url.split('?').nth(1).unwrap_or("");
            let file_path = querystring::querify(query)
                .iter()
                .find(|(k, _)| *k == "file_path")
                .map(|(_, v)| v.to_string())
                .unwrap_or_default();
            log::info!("serve_file: file_path={}", file_path);
            let path = PathBuf::from(file_path);
            //let mime = mime_guess::from_path(&path).first_or_octet_stream();
            let data = std::fs::read(&path).unwrap_or_default();
            http::Response::builder()
                //.header(http::header::CONTENT_TYPE, "image/jpeg")
                .body(data)
                .unwrap()
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd_login,
            cmd_contact_list_all,
            cmd_conversation_list_all,
            cmd_create_conversation,
            cmd_refresh_contacts,
            cmd_refresh_conversations,
            cmd_send_message,
            cmd_validate_token,
            cmd_save_read_position,
            cmd_get_read_position,
            cmd_upload_file,
            cmd_download_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
