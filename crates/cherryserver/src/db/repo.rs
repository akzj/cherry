use std::time::Duration;

use anyhow::Result;
use serde_json::json;
use sqlx::{
    Pool,
    postgres::{PgPool, PgPoolOptions},
    query, query_as, query_scalar,
    types::Uuid,
};

use crate::db::models::*;

#[derive(Clone)]
pub struct Repo {
    pub(crate) sqlx_pool: PgPool,
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
    
    // Create a new Repo with an existing pool (useful for testing)
    pub fn with_pool(pool: PgPool) -> Self {
        Self { sqlx_pool: pool }
    }

    pub async fn user_get_by_username(&self, username: &str) -> Result<User> {
        let user = query_as::<_, User>("SELECT * FROM users WHERE username = $1")
            .bind(username)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user)
    }

    pub async fn check_password(&self, username: &str, password: &str) -> Result<bool> {
        let user = query_as::<_, User>("SELECT * FROM users WHERE username = $1")
            .bind(username)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user.password_hash == password)
    }

    pub async fn list_contacts(&self, user_id: Uuid) -> Result<Vec<Contact>> {
        let contacts = query_as::<_, Contact>("SELECT * FROM contacts WHERE owner_id = $1")
            .bind(user_id)
            .fetch_all(&self.sqlx_pool)
            .await?;
        Ok(contacts)
    }

    pub async fn list_streams(&self, user_id: Uuid) -> Result<Vec<Stream>> {
        // Return stream IDs as i64 instead of full Stream objects to avoid schema issues
        let streams   = query_as::<_,Stream>("SELECT * FROM streams WHERE owner_id = $1")
            .bind(user_id)
            .fetch_all(&self.sqlx_pool)
            .await?;
        Ok(streams)
    }

    pub async fn list_conversations(&self, user_id: Uuid) -> Result<Vec<Conversation>> {
        // Simplified to return conversation IDs to avoid schema issues
        let conversations  = query_as::<_,Conversation>(
            "SELECT * FROM conversations WHERE members @> $1::jsonb"
        )
        .bind(json!([user_id.to_string()]))
        .fetch_all(&self.sqlx_pool)
        .await?;
        Ok(conversations)
    }

    pub async fn update_stream_offset(&self, stream_id: i64, offset: i64) -> Result<()> {
        let _ = query("UPDATE streams SET stream_meta = jsonb_set(stream_meta, '{offset}', $1::jsonb, true) WHERE stream_id = $2")
            .bind(json!(offset))
            .bind(stream_id)
            .execute(&self.sqlx_pool)
            .await?;
        Ok(())
    }

    pub async fn check_acl(&self, user_id: Uuid, stream_id: i64) -> Result<bool> {
        let count: Option<i64> = query_scalar("SELECT count(*) FROM conversations WHERE members @> $1::jsonb AND message_stream_id = $2")
            .bind(json!([user_id.to_string()]))
            .bind(stream_id)
            .fetch_one(&self.sqlx_pool)
            .await?;
        let count = count.unwrap_or(0);
        Ok(count > 0)
    }
}
