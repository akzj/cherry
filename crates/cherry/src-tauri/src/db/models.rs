use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

// CREATE TABLE messages (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     conversation_id INTEGER NOT NULL,
//     sender_id INTEGER NOT NULL,
//     content TEXT NOT NULL,
//     type TEXT NOT NULL CHECK(type IN ('text', 'image', 'voice', 'video', 'file', 'location', 'contact', 'system', 'encrypted_text')),
//     status TEXT NOT NULL CHECK(status IN ('sent', 'delivered', 'read')),
//     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     reaction TEXT,
//     reply_to INTEGER,
//     media_path TEXT,
//     FOREIGN KEY (conversation_id) REFERENCES conversations(id),
//     FOREIGN KEY (sender_id) REFERENCES users(id),
//     FOREIGN KEY (reply_to) REFERENCES messages(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub id: i32,
    pub conversation_id: i32,
    pub sender_id: i32,
    pub content: Value,
    #[serde(rename = "type")]
    pub type_: String,
    pub status: String,
    pub timestamp: chrono::NaiveDateTime,
    pub reaction: Option<String>,
    pub reply_to: Option<i32>,
    pub media_path: Option<String>,
}

// CREATE TABLE offline_messages (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     conversation_id INTEGER NOT NULL,
//     sender_id INTEGER NOT NULL,
//     content TEXT NOT NULL,
//     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_sent BOOLEAN DEFAULT FALSE,
//     FOREIGN KEY (conversation_id) REFERENCES conversations(id),
//     FOREIGN KEY (sender_id) REFERENCES users(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct OfflineMessage {
    pub id: i32,
    pub conversation_id: i32,
    pub sender_id: i32,
    pub content: Value,
    pub timestamp: chrono::NaiveDateTime,
    pub is_sent: bool,
}

// CREATE TABLE
//     contacts (
//         id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//         user_id INTEGER NOT NULL,
//         contact_id INTEGER NOT NULL,
//         relationship_type TEXT DEFAULT 'friend', -- friend, family, colleague
//         nickname TEXT,
//         status TEXT, -- online, offline, etc.
//         last_seen TIMESTAMP WITH TIME ZONE,
//         notes TEXT,
//         is_verified BOOLEAN DEFAULT 0,
//         is_blocked BOOLEAN DEFAULT 0,
//         created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
//     );

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Contact {
    pub id: i64,
    pub user_id: i64,
    pub contact_id: i64,
    pub relationship_type: Option<String>,
    pub nickname: Option<String>,
    pub status: Option<String>,
    pub last_seen: Option<String>,
    pub notes: Option<String>,
    pub is_verified: Option<bool>,
    pub is_blocked: Option<bool>,
    pub created_at: String,
}

// CREATE TABLE friend_requests (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     from_user_id INTEGER NOT NULL, -- 发起申请的用户ID
//     to_user_id INTEGER NOT NULL, -- 接受申请的用户ID
//     content TEXT, -- 申请内容，可选
//     status TEXT NOT NULL DEFAULT 'pending', -- 状态：pending, accepted, rejected
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct FriendRequest {
    pub id: i32,
    pub from_user_id: i32,
    pub to_user_id: i32,
    pub content: Option<String>,
    pub status: String,
    pub created_at: chrono::NaiveDateTime,
}

// CREATE TABLE group_requests (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     group_id INTEGER NOT NULL, -- 外键，指向Group.id
//     user_id INTEGER NOT NULL, -- 申请用户ID
//     content TEXT, -- 申请内容，可选
//     status TEXT NOT NULL DEFAULT 'pending', -- 状态：pending, accepted, rejected
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupRequest {
    pub id: i32,
    pub group_id: i32,
    pub user_id: i32,
    pub content: Option<String>,
    pub status: String,
    pub created_at: chrono::NaiveDateTime,
}

// CREATE TABLE users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     username TEXT NOT NULL UNIQUE,
//     password_hash TEXT NOT NULL,
//     display_name TEXT NOT NULL,
//     avatar_path TEXT,
//     last_login TIMESTAMP,
//     registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     status TEXT DEFAULT 'online', -- online, offline, busy, away
//     last_active TIMESTAMP
// );

pub type User = cherrycore::types::User;

// CREATE TABLE conversations (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     type TEXT NOT NULL CHECK(type IN ('private', 'group')),
//     user_id INTEGER NOT NULL,
//     other_user_id INTEGER,
//     group_id INTEGER,
//     last_message_id INTEGER,
//     unread_count INTEGER DEFAULT 0,
//     is_pinned BOOLEAN DEFAULT 0,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (user_id) REFERENCES users(id),
//     FOREIGN KEY (other_user_id) REFERENCES users(id),
//     FOREIGN KEY (group_id) REFERENCES groups(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    pub id: i32,
    pub type_: String,
    pub user_id: i32,
    pub other_user_id: Option<i32>,
    pub group_id: Option<i32>,
    pub last_message_id: Option<i32>,
    pub unread_count: i32,
    pub is_pinned: bool,
    pub created_at: chrono::NaiveDateTime,
}

// CREATE TABLE groups (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     name TEXT NOT NULL,
//     description TEXT,
//     creator_id INTEGER NOT NULL,
//     avatar_path TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_encrypted BOOLEAN DEFAULT 0,
//     encryption_key TEXT,
//     visibility TEXT DEFAULT 'public', -- public, private, secret
//     member_count INTEGER DEFAULT 0,
//     last_active TIMESTAMP,
//     FOREIGN KEY (creator_id) REFERENCES users(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct Group {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub creator_id: i32,
    pub avatar_path: Option<String>,
    pub created_at: chrono::NaiveDateTime,
    pub is_encrypted: bool,
    pub encryption_key: Option<String>,
    pub visibility: String, // public, private, secret
    pub member_count: i32,
    pub last_active: Option<chrono::NaiveDateTime>,
}

// CREATE TABLE group_members (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     group_id INTEGER NOT NULL,
//     user_id INTEGER NOT NULL,
//     role TEXT DEFAULT 'member', -- member, admin, owner
//     joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_online BOOLEAN DEFAULT 0,
//     last_seen TIMESTAMP,
//     is_muted BOOLEAN DEFAULT 0,
//     mute_until TIMESTAMP,
//     is_banned BOOLEAN DEFAULT 0,
//     FOREIGN KEY (group_id) REFERENCES groups(id),
//     FOREIGN KEY (user_id) REFERENCES users(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupMember {
    pub id: i32,
    pub group_id: i32,
    pub user_id: i32,
    pub role: String,
    pub joined_at: chrono::NaiveDateTime,
    pub is_online: bool,
    pub last_seen: Option<chrono::NaiveDateTime>,
    pub is_muted: bool,
    pub mute_until: Option<chrono::NaiveDateTime>,
    pub is_banned: bool,
}

// CREATE TABLE files (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     sender_id INTEGER NOT NULL,
//     conversation_id INTEGER,
//     type TEXT NOT NULL CHECK(type IN ('image', 'document', 'audio', 'video', 'other')),
//     name TEXT NOT NULL,
//     size INTEGER NOT NULL,
//     path TEXT NOT NULL,
//     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (sender_id) REFERENCES users(id),
//     FOREIGN KEY (conversation_id) REFERENCES conversations(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct File {
    pub id: i32,
    pub sender_id: i32,
    pub conversation_id: Option<i32>,
    pub type_: String,
    pub name: String,
    pub size: i32,
    pub path: String,
    pub uploaded_at: chrono::NaiveDateTime,
}

// CREATE TABLE settings (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     user_id INTEGER NOT NULL UNIQUE,
//     key TEXT NOT NULL,
//     value TEXT NOT NULL,
//     category TEXT DEFAULT 'general',
//     FOREIGN KEY (user_id) REFERENCES users(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    pub id: i32,
    pub key: String,
    pub value: String,
    pub category: String,
}

// CREATE TABLE notifications (
//     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     sender_id INTEGER,
//     conversation_id INTEGER,
//     user_id INTEGER NOT NULL,
//     type TEXT NOT NULL CHECK(type IN ('message', 'system', 'event')),
//     content TEXT NOT NULL,
//     is_read BOOLEAN DEFAULT FALSE,
//     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     expires_at TIMESTAMP,
//     FOREIGN KEY (sender_id) REFERENCES users(id),
//     FOREIGN KEY (conversation_id) REFERENCES conversations(id),
//     FOREIGN KEY (user_id) REFERENCES users(id)
// );

#[derive(Debug, Serialize, Deserialize)]
pub struct Notification {
    pub id: i32,
    pub sender_id: Option<i32>,
    pub conversation_id: Option<i32>,
    pub user_id: i32,
    pub type_: String,
    pub content: String,
    pub is_read: bool,
    pub timestamp: chrono::NaiveDateTime,
    pub expires_at: Option<chrono::NaiveDateTime>,
}
