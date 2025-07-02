use std::time::Duration;

use anyhow::Result;
use cherrycore::types::StreamType;
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

    pub async fn user_get_by_email(&self, email: &str) -> Result<User> {
        let user = query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user)
    }

    pub async fn check_password(&self, email: &str, password: &str) -> Result<bool> {
        let user = query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user.password_hash == password)
    }

    pub async fn list_contacts(&self, user_id: Uuid) -> Result<Vec<Contact>> {
        let contacts = query_as::<_, Contact>(
            "SELECT contacts.*, users.avatar_url, users.status FROM contacts LEFT JOIN users ON contacts.target_id = users.user_id WHERE contacts.owner_id = $1")
            .bind(user_id)
            .fetch_all(&self.sqlx_pool)
            .await?;
        Ok(contacts)
    }

    pub async fn list_streams(&self, user_id: Uuid) -> Result<Vec<Stream>> {
        // Return stream IDs as i64 instead of full Stream objects to avoid schema issues
        let streams = query_as::<_, Stream>("SELECT * FROM streams WHERE owner_id = $1")
            .bind(user_id)
            .fetch_all(&self.sqlx_pool)
            .await?;
        Ok(streams)
    }

    pub async fn list_conversations(&self, user_id: Uuid) -> Result<Vec<Conversation>> {
        // Simplified to return conversation IDs to avoid schema issues
        let conversations =
            query_as::<_, Conversation>("SELECT * FROM conversations WHERE members @> $1::jsonb")
                .bind(json!([user_id.to_string()]))
                .fetch_all(&self.sqlx_pool)
                .await?;
        Ok(conversations)
    }

    pub async fn update_stream_offset(&self, stream_id: i64, offset: i64) -> Result<()> {
        let _ = query("UPDATE streams SET \"offset\" = $1 WHERE stream_id = $2")
            .bind(offset)
            .bind(stream_id)
            .execute(&self.sqlx_pool)
            .await?;
        Ok(())
    }

    pub async fn check_acl_by_conversation_id(&self, user_id: Uuid, conversation_id: Uuid) -> Result<bool> {
        let count: Option<i64> = query_scalar("SELECT count(*) FROM conversations WHERE conversation_id = $1 AND members @> $2::jsonb")
            .bind(conversation_id)
            .bind(json!([user_id.to_string()]))
            .fetch_one(&self.sqlx_pool)
            .await?;
        let count = count.unwrap_or(0);
        Ok(count > 0)
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

    pub async fn get_notification_stream_ids(&self, user_ids: &[Uuid]) -> Result<Vec<i64>> {
        if user_ids.is_empty() {
            return Ok(vec![]);
        }
        let stream_ids = query_scalar::<_, i64>(
            r#"
            SELECT DISTINCT stream_id 
            FROM streams 
            WHERE owner_id = ANY($1::uuid[])
            AND stream_type = 'notification'
            "#,
        )
        .bind(user_ids)
        .fetch_all(&self.sqlx_pool)
        .await?;

        Ok(stream_ids)
    }

    // 检查1对1会话是否已存在
    pub async fn find_direct_conversation(
        &self,
        user1: Uuid,
        user2: Uuid,
    ) -> Result<Option<Conversation>> {
        let members_json = json!([user1.to_string(), user2.to_string()]);
        let members_json_reverse = json!([user2.to_string(), user1.to_string()]);

        let conversation = query_as::<_, Conversation>(
            r#"
            SELECT * FROM conversations 
            WHERE conversation_type = 'direct' 
            AND (members = $1::jsonb OR members = $2::jsonb)
            LIMIT 1
            "#,
        )
        .bind(&members_json)
        .bind(&members_json_reverse)
        .fetch_optional(&self.sqlx_pool)
        .await?;

        Ok(conversation)
    }

    // 创建新的流
    pub async fn create_stream(&self, owner_id: Uuid, stream_type: &str) -> Result<Stream> {
        let stream = query_as::<_, Stream>(
            r#"
            INSERT INTO streams (
                owner_id, stream_type, status, "offset", stream_meta, 
                created_at, updated_at
            )
            VALUES (
                $1, $2, 'active', 0, '{}'::jsonb, 
                NOW(), NOW()
            )
            RETURNING *
            "#,
        )
        .bind(owner_id)
        .bind(stream_type)
        .fetch_one(&self.sqlx_pool)
        .await?;

        Ok(stream)
    }

    // 创建新的会话
    pub async fn create_conversation(
        &self,
        conversation_type: &str,
        members: &[Uuid],
        meta: &serde_json::Value,
        stream_id: i64,
    ) -> Result<Conversation> {
        let members_json = json!(
            members
                .iter()
                .map(|id| id.to_string())
                .collect::<Vec<String>>()
        );

        let conversation = query_as::<_, Conversation>(
            r#"
            INSERT INTO conversations (
                conversation_type, members, meta, stream_id,
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4,
                NOW(), NOW()
            )
            RETURNING *
            "#,
        )
        .bind(conversation_type)
        .bind(&members_json)
        .bind(meta)
        .bind(stream_id)
        .fetch_one(&self.sqlx_pool)
        .await?;

        Ok(conversation)
    }

    // 组合方法：创建会话和对应的流（使用事务）
    pub async fn create_conversation_with_stream(
        &self,
        creator_id: Uuid,
        conversation_type: &str,
        members: &[Uuid],
        meta: &serde_json::Value,
    ) -> Result<(Conversation, Stream, bool)> {
        // 开始事务
        let mut tx = self.sqlx_pool.begin().await?;

        // 如果是1对1会话，在事务中检查是否已存在
        if conversation_type == "direct" && members.len() == 2 {
            let members_json = json!([members[0].to_string(), members[1].to_string()]);
            let members_json_reverse = json!([members[1].to_string(), members[0].to_string()]);

            let existing_conversation = query_as::<_, Conversation>(
                r#"
                SELECT * FROM conversations 
                WHERE conversation_type = 'direct' 
                AND (members = $1::jsonb OR members = $2::jsonb)
                LIMIT 1
                FOR UPDATE
                "#,
            )
            .bind(&members_json)
            .bind(&members_json_reverse)
            .fetch_optional(&mut *tx)
            .await?;

            if let Some(conversation) = existing_conversation {
                // 获取对应的流
                let stream = query_as::<_, Stream>("SELECT * FROM streams WHERE stream_id = $1")
                    .bind(conversation.stream_id)
                    .fetch_one(&mut *tx)
                    .await?;

                // 提交事务（虽然没有修改，但要释放锁）
                tx.commit().await?;
                return Ok((conversation, stream, false)); // false 表示不是新创建的
            }
        }

        // 在事务中创建新的流
        let stream = query_as::<_, Stream>(
            r#"
            INSERT INTO streams (
                owner_id, stream_type, status, "offset", stream_meta, 
                created_at, updated_at
            )
            VALUES (
                $1, $2, 'active', 0, '{}'::jsonb, 
                NOW(), NOW()
            )
            RETURNING *
            "#,
        )
        .bind(creator_id)
        .bind(StreamType::Message.to_string())
        .fetch_one(&mut *tx)
        .await?;

        // 在事务中创建新的会话
        let members_json = json!(
            members
                .iter()
                .map(|id| id.to_string())
                .collect::<Vec<String>>()
        );
        let conversation = query_as::<_, Conversation>(
            r#"
            INSERT INTO conversations (
                conversation_type, members, meta, stream_id,
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4,
                NOW(), NOW()
            )
            RETURNING *
            "#,
        )
        .bind(conversation_type)
        .bind(&members_json)
        .bind(meta)
        .bind(stream.stream_id)
        .fetch_one(&mut *tx)
        .await?;

        // 提交事务
        tx.commit().await?;

        Ok((conversation, stream, true)) // true 表示是新创建的
    }
}
