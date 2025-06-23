use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value as JsonValue};
use uuid::Uuid;

// Models
#[derive(Debug, Serialize, Deserialize, Clone)]
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
    pub created_at: DateTime<Utc>,
    pub last_active: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Contact {
    pub contact_id: Uuid,
    pub owner_id: Uuid,
    pub target_id: Uuid,
    pub relation_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub remark_name: Option<String>,
    pub tags: JsonValue,
    pub is_favorite: bool,
    pub mute_settings: JsonValue,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Stream {
    pub stream_id: i64,
    pub owner_id: Uuid,
    pub stream_type: String,
    pub status: String,
    pub offset: i64,
    pub stream_meta: JsonValue,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conversation {
    pub conversation_id: Uuid,
    pub conversation_type: String,
    pub members: JsonValue,
    pub meta: JsonValue,
    pub stream_id: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Mock Repository
#[derive(Clone)]
pub struct MockRepo {
    // We could add fields here to store mock data
}

impl MockRepo {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn user_get_by_username(&self, username: &str) -> Result<User> {
        // Return a mock user
        Ok(User {
            user_id: Uuid::new_v4(),
            username: username.to_string(),
            avatar_url: Some("https://example.com/avatar.png".to_string()),
            status: "active".to_string(),
            email: format!("{}@example.com", username),
            password_hash: "test_password_hash".to_string(),
            profile: json!({}),
            app_config: json!({}),
            stream_meta: json!({}),
            created_at: Utc::now(),
            last_active: Utc::now(),
        })
    }

    pub async fn check_password(&self, _username: &str, password: &str) -> Result<bool> {
        // For testing, we'll consider "test_password_hash" as the correct password
        Ok(password == "test_password_hash")
    }

    pub async fn list_contacts(&self, user_id: Uuid) -> Result<Vec<Contact>> {
        // Return a mock contact list
        let contact_id = Uuid::new_v4();
        let target_id = Uuid::new_v4();
        
        Ok(vec![Contact {
            contact_id,
            owner_id: user_id,
            target_id,
            relation_type: "friend".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            remark_name: Some("Test Contact".to_string()),
            tags: json!([]),
            is_favorite: false,
            mute_settings: json!({}),
        }])
    }

    pub async fn list_streams(&self, user_id: Uuid) -> Result<Vec<Stream>> {
        // Return a mock stream list
        Ok(vec![Stream {
            stream_id: 1,
            owner_id: user_id,
            stream_type: "message".to_string(),
            status: "active".to_string(),
            offset: 0,
            stream_meta: json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }])
    }

    pub async fn list_conversations(&self, user_id: Uuid) -> Result<Vec<Conversation>> {
        // Return a mock conversation list
        Ok(vec![Conversation {
            conversation_id: Uuid::new_v4(),
            conversation_type: "direct".to_string(),
            members: json!([user_id.to_string()]),
            meta: json!({}),
            stream_id: 1,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }])
    }

    pub async fn update_stream_offset(&self, _stream_id: i64, _offset: i64) -> Result<()> {
        // Pretend to update the stream offset
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_basic_functionality() {
        assert_eq!(2 + 2, 4);
    }
    
    #[tokio::test]
    async fn test_mock_user_get_by_username() -> Result<()> {
        let repo = MockRepo::new();
        let username = "test_user";
        
        let user = repo.user_get_by_username(username).await?;
        
        assert_eq!(user.username, username);
        assert_eq!(user.email, format!("{}@example.com", username));
        
        Ok(())
    }
    
    #[tokio::test]
    async fn test_mock_check_password() -> Result<()> {
        let repo = MockRepo::new();
        
        // Test with correct password
        let result = repo.check_password("any_user", "test_password_hash").await?;
        assert!(result);
        
        // Test with incorrect password
        let result = repo.check_password("any_user", "wrong_password").await?;
        assert!(!result);
        
        Ok(())
    }
    
    #[tokio::test]
    async fn test_mock_list_contacts() -> Result<()> {
        let repo = MockRepo::new();
        let user_id = Uuid::new_v4();
        
        let contacts = repo.list_contacts(user_id).await?;
        
        assert_eq!(contacts.len(), 1);
        assert_eq!(contacts[0].owner_id, user_id);
        
        Ok(())
    }
    
    #[tokio::test]
    async fn test_mock_list_streams() -> Result<()> {
        let repo = MockRepo::new();
        let user_id = Uuid::new_v4();
        
        let streams = repo.list_streams(user_id).await?;
        
        assert_eq!(streams.len(), 1);
        assert_eq!(streams[0].owner_id, user_id);
        
        Ok(())
    }
    
    #[tokio::test]
    async fn test_mock_list_conversations() -> Result<()> {
        let repo = MockRepo::new();
        let user_id = Uuid::new_v4();
        
        let conversations = repo.list_conversations(user_id).await?;
        
        assert_eq!(conversations.len(), 1);
        assert!(conversations[0].members.to_string().contains(&user_id.to_string()));
        
        Ok(())
    }
    
    #[tokio::test]
    async fn test_mock_update_stream_offset() -> Result<()> {
        let repo = MockRepo::new();
        
        // This should just return Ok(())
        let result = repo.update_stream_offset(1, 100).await;
        
        assert!(result.is_ok());
        
        Ok(())
    }
}