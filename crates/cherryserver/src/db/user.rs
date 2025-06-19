// -- 用户表
// CREATE TABLE IF NOT EXISTS users (
//     user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     username VARCHAR(50) NOT NULL UNIQUE,
//     email VARCHAR(100) NOT NULL UNIQUE,
//     password_hash TEXT NOT NULL,
//     profile JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储动态用户属性
//     app_config JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储应用配置
//     stream_meta JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储流元数据
//     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

use chrono::DateTime;
use diesel::{
    Selectable,
    prelude::{Insertable, Queryable},
};
use serde_json::Value;
use uuid::Uuid;

#[derive(Queryable, Insertable, Selectable)]
#[diesel(table_name = crate::db::schema::users)]
pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub profile: Value,
    pub app_config: Value,
    pub stream_meta: Value,
    pub created_at: DateTime<chrono::Utc>,
    pub last_active: DateTime<chrono::Utc>,
}
