use std::time::Duration;

use anyhow::Result;
use serde_json::json;
use sqlx::{
    Pool,
    postgres::{PgPool, PgPoolOptions},
    query, query_as,
    types::Uuid,
};

use crate::db::models::*;

#[derive(Clone)]
pub struct Repo {
    sqlx_pool: PgPool,
}

impl Repo {
    pub async fn new(db_url: &str) -> Self {
        let pool = PgPoolOptions::new()
            .max_connections(500)
            .acquire_timeout(Duration::from_secs(10))
            .connect(db_url)
            .await
            .unwrap();
        Self { sqlx_pool: pool }
    }

    pub async fn user_get_by_username(&self, username: &str) -> Result<User> {
        let user = query_as!(User, "SELECT * FROM users WHERE username = $1", username)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user)
    }

    pub async fn check_password(&self, username: &str, password: &str) -> Result<bool> {
        let user = query_as!(User, "SELECT * FROM users WHERE username = $1", username)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user.password_hash == password)
    }

    pub async fn list_contacts(&self, user_id: Uuid) -> Result<Vec<Contact>> {
        let contacts = query_as!(
            Contact,
            "SELECT * FROM contacts WHERE owner_id = $1",
            user_id
        )
        .fetch_all(&self.sqlx_pool)
        .await?;
        Ok(contacts)
    }

    pub async fn list_streams(&self, user_id: Uuid) -> Result<Vec<Stream>> {
        let streams = query_as!(Stream, "SELECT * FROM streams WHERE owner_id = $1", user_id)
            .fetch_all(&self.sqlx_pool)
            .await?;
        Ok(streams)
    }

    pub async fn list_conversations(&self, user_id: Uuid) -> Result<Vec<Conversation>> {
        let conversations = query_as!(
            Conversation,
            "SELECT * FROM conversations WHERE members @> $1::jsonb",
            json!(user_id.to_string())
        )
        .fetch_all(&self.sqlx_pool)
        .await?;
        Ok(conversations)
    }

    pub async fn update_stream_offset(&self, stream_id: i64, offset: i64) -> Result<()> {
        let _ = query!(
            "UPDATE streams SET \"offset\" = $1 WHERE stream_id = $2",
            offset,
            stream_id
        )
        .execute(&self.sqlx_pool)
        .await?;
        Ok(())
    }
}
