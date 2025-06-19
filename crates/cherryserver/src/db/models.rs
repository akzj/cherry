// -- 用户表
// CREATE TABLE IF NOT EXISTS users (
//     user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     username VARCHAR(50) NOT NULL UNIQUE,
//     avatar_url TEXT,
//     email VARCHAR(100) NOT NULL UNIQUE,
//     password_hash TEXT NOT NULL,
//     profile JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储动态用户属性
//     app_config JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储应用配置
//     stream_meta JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储流元数据
//     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

use chrono::DateTime;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub avatar_url: Option<String>,
    pub status: String,
    pub email: String,
    pub password_hash: String,
    pub profile: JsonValue,
    pub app_config: JsonValue,
    pub stream_meta: JsonValue,
    pub created_at: DateTime<chrono::Utc>,
    pub last_active: DateTime<chrono::Utc>,
}

// CREATE TABLE IF NOT EXISTS contacts (
//     contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     target_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('friend', 'blocked', 'pending_outgoing', 'pending_incoming')),
//     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

//     -- 联系人专属信息
//     remark_name VARCHAR(100),           -- 备注名
//     tags JSONB DEFAULT '[]'::JSONB,     -- 标签分类 ["同事", "家人"]
//     is_favorite BOOLEAN NOT NULL DEFAULT false,
//     mute_settings JSONB DEFAULT '{}'::JSONB, -- {"muted": true, "expire_at": "2023-12-31"}

//     -- 唯一约束确保不会重复添加
//     UNIQUE (owner_id, target_id)
// );

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct Contact {
    pub contact_id: Uuid,
    pub owner_id: Uuid,
    pub target_id: Uuid,
    pub relation_type: String,
    pub created_at: DateTime<chrono::Utc>,
    pub updated_at: DateTime<chrono::Utc>,
    pub remark_name: Option<String>,
    pub tags: JsonValue,
    pub is_favorite: bool,
    pub mute_settings: JsonValue,
}
