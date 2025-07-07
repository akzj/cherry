use crate::db::models::MessageSnapshot;

use super::models::{Contact, User};
use anyhow::Ok;
use cherrycore::types::{Message, ReactionContent};
use sqlx::{ query_as, sqlite::{SqlitePool, SqlitePoolOptions}, Pool, Row, Sqlite };
use sqlx::query;
use uuid::Uuid;

pub struct Repo {
    sqlx_pool: Option<SqlitePool>,
}

impl Repo {
    pub async fn new(db_url: &str) -> Self {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(db_url)
            .await
            .ok();
        Self { sqlx_pool: pool }
    }

    pub async fn get_message_by_id(&self, id: i64) -> anyhow::Result<MessageSnapshot> {
        let pool = self.sqlx_pool.as_ref().unwrap();
        let message = query_as::<_, MessageSnapshot>(
            "SELECT * FROM messages WHERE id = ?",
        )
        .bind(id)
        .fetch_one(pool)
        .await?;


        Ok(message)
    }

    pub async fn receive_message(&self,  message: Message) -> anyhow::Result<(MessageSnapshot)> {
        let pool = self.sqlx_pool.as_ref().unwrap();
        let snapshot:MessageSnapshot  =  match message.type_.as_str(){
            "text" | "image" | "voice" | "video" | "file" | "location" | "contact" | "system" | "encrypted_text" => {
                MessageSnapshot {
                    id: message.id,
                    status: "unread".to_string(),
                    user_id: message.user_id.to_string(),
                    conversation_id: message.conversation_id.to_string(),
                    content: message.content,
                    type_: message.type_,
                    timestamp: message.timestamp,
                    reply_to: message.reply_to,
                    reactions: Some(serde_json::to_value(Vec::<ReactionContent>::new()).unwrap()),

                }
            }
            "reaction" => {
                log::info!("receive reaction message: {:?}", message);
                if message.reply_to.is_none() {
                    return Err(anyhow::anyhow!("Reaction message has no reply_to"));
                }
                
               let mut snapshot_message = self.get_message_by_id(message.reply_to.unwrap()).await?;
               let mut reactions:Vec<ReactionContent> = serde_json::from_value(snapshot_message.reactions.clone().unwrap()).unwrap();
               let reaction_content:ReactionContent = serde_json::from_value(message.content.clone()).unwrap();
                if let Some(reaction) = reactions.iter_mut().find(|r| r.emoji == reaction_content.emoji) {
                    if reaction_content.action == "add" {
                        reaction.users.push(message.user_id);
                    } else {
                        reaction.users.retain(|u| u != &message.user_id);
                    }
                } else {
                    if reaction_content.action == "add" {
                        reactions.push(reaction_content);
                    }else{
                        log::info!("remove reaction: {} not found", reaction_content.emoji);
                    }
                }
               snapshot_message.reactions = Some(serde_json::to_value(reactions).unwrap());
               snapshot_message
            }
            _ => {
                return Err(anyhow::anyhow!("Unsupported message type"));
            }
        };

        //  insert message conflict on id and update if exists
        let result = query(
            "INSERT INTO messages (id, user_id, conversation_id, content, type_, status, timestamp, reply_to, reactions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            content = excluded.content,
            reactions = excluded.reactions
            ",
        )
        .bind(&snapshot.id)
        .bind(&snapshot.user_id.to_string())
        .bind(&snapshot.conversation_id.to_string())
        .bind(&snapshot.content)
        .bind(&snapshot.type_)
        .bind(&snapshot.status)
        .bind(&snapshot.timestamp)
        .bind(&snapshot.reply_to)
        .bind(serde_json::to_value(snapshot.reactions.clone().unwrap_or_default()).unwrap())
        .execute(pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(anyhow::anyhow!("Failed to insert message"));
        }else{
            let message = self.get_message_by_id(snapshot.id).await?;
            log::info!("message {:?} insert or update success", message);
        }
        Ok(snapshot)
    }

    pub async fn list_messages(&self, conversation_id: Uuid, forward_id: Option<i64>, backward_id: Option<i64>, limit: i64) -> anyhow::Result<Vec<MessageSnapshot>> {
        let pool = self.sqlx_pool.as_ref().unwrap();
        
        let (sql, params) = match (forward_id, backward_id) {
            // 向下拉取：获取比 forward_id 最新的消息（更小的ID）
            (Some(forward), None) => {
                ("SELECT * FROM messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC LIMIT ?", 
                 vec![conversation_id.to_string(), forward.to_string(), limit.to_string()])
            },
            // 向上拉取：获取比 backward_id 最旧的消息（更大的ID）
            (None, Some(backward)) => {
                ("SELECT * FROM messages WHERE conversation_id = ? AND id < ? ORDER BY id DESC LIMIT ?", 
                 vec![conversation_id.to_string(), backward.to_string(), limit.to_string()])
            },
            // 初始加载：获取最新的消息
            (None, None) => {
                ("SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?", 
                 vec![conversation_id.to_string(), limit.to_string()])
            },
            // 同时指定 before 和 after 是不合理的
            (Some(_), Some(_)) => {
                return Err(anyhow::anyhow!("Cannot specify both forward_id and backward_id"));
            }
        };

        log::info!("query: {}, params: {:?}", sql, params);
        let mut query = sqlx::query_as::<_, MessageSnapshot>(sql);
        // 绑定参数
        for param in params {
            query = query.bind(param);
        }
        
        let mut messages = query.fetch_all(pool).await?;

        // sort by id
        messages.sort_by_key(|m| m.id); 

        log::info!("messages: length: {}", messages.len());

        Ok(messages)
    }

    pub async fn get_latest_message_id(&self, conversation_id: Uuid) -> anyhow::Result<Option<i64>> {
        let pool = self.sqlx_pool.as_ref().unwrap();
        let result = sqlx::query_scalar::<_, i64>(
            "SELECT MAX(id) FROM messages WHERE conversation_id = ?"
        )
        .bind(conversation_id.to_string())
        .fetch_optional(pool)
        .await?;
        
        Ok(result)
    }

    // pub async fn user_get_by_id(&self, id: i32) -> Result<User, sqlx::Error> {
    //     if let Some(pool) = &self.sqlx_pool {
    //         let user = query_as::<_, User>(
    //             "SELECT id, username, display_name, avatar_path, status FROM users WHERE id = ?",
    //         )
    //         .bind(id)
    //         .fetch_one(pool)
    //         .await?;

    //         Ok(user)
    //     } else {
    //         // Return a mock user for development when database is not available
    //         Ok(User {
    //             id,
    //             username: format!("user_{}", id),
    //             display_name: format!("User {}", id),
    //             avatar_path: None,
    //             status: "offline".to_string(),
    //         })
    //     }
    // }

    // pub async fn contact_list_all(&self) -> Result<Vec<Contact>, sqlx::Error> {
    //     if let Some(pool) = &self.sqlx_pool {
    //         // Use query_as with explicit type instead of the macro to avoid compile-time checks
    //         let contacts = sqlx::query_as::<_, Contact>("SELECT * FROM contacts")
    //             .fetch_all(pool)
    //             .await?;

    //         Ok(contacts)
    //     } else {
    //         // Return empty contacts list when database is not available
    //         Ok(Vec::new())
    //     }
    // }
}
