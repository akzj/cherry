#[cfg(test)]
mod tests {
    // This test doesn't require a database connection and can be run anywhere
    #[test]
    fn test_basic_functionality() {
        assert_eq!(2 + 2, 4);
    }
    
    // The following tests require a database connection
    // Uncomment when database is available

    use super::*;
    use crate::db::models::*;
    use crate::db::repo::Repo;
    use anyhow::Result;
    use chrono::Utc;
    use serde_json::json;
    use sqlx::{postgres::PgPoolOptions, PgPool};
    use std::time::Duration;
    use uuid::Uuid;

    // Helper function to create a test database connection
    async fn setup_test_db() -> PgPool {
        // Use an environment variable for the test database URL or a default test URL
        let db_url = std::env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres123@localhost:5432/cherryserver".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(3))
            .connect(&db_url)
            .await
            .expect("Failed to connect to test database");
        
        // Clear test data in the correct order to respect foreign key constraints
        let _ = sqlx::query("DELETE FROM conversations").execute(&pool).await;
        let _ = sqlx::query("DELETE FROM contacts").execute(&pool).await;
        let _ = sqlx::query("DELETE FROM streams").execute(&pool).await;
        let _ = sqlx::query("DELETE FROM users").execute(&pool).await;
        
        pool
    }

    // Helper function to create a test user
    async fn create_test_user(pool: &PgPool) -> User {
        let user_id = Uuid::new_v4();
        let username = format!("test_user_{}", user_id.to_string().split('-').next().unwrap());
        let email = format!("{}@example.com", username);
        
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (
                user_id, username, email, password_hash, status, 
                profile, app_config, stream_meta, created_at, last_active
            )
            VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, $8, $9, $10
            )
            RETURNING *
            "#
        )
        .bind(user_id)
        .bind(&username)
        .bind(&email)
        .bind("test_password_hash")
        .bind("active")
        .bind(json!({}))
        .bind(json!({}))
        .bind(json!({}))
        .bind(Utc::now())
        .bind(Utc::now())
        .fetch_one(pool)
        .await
        .expect(&format!("Failed to create test user: {}", username));
        
        user
    }

    // Helper function to create a test stream
    async fn create_test_stream(pool: &PgPool, owner_id: Uuid) -> Stream {
        let stream = sqlx::query_as::<_, Stream>(
            r#"
            INSERT INTO streams (
                owner_id, stream_type, status, "offset", stream_meta, 
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7
            )
            RETURNING *
            "#
        )
        .bind(owner_id)
        .bind("message")
        .bind("active")
        .bind(0i64)
        .bind(json!({}))
        .bind(Utc::now())
        .bind(Utc::now())
        .fetch_one(pool)
        .await
        .expect("Failed to create test stream");
        
        stream
    }

    // Helper function to create a test contact
    async fn create_test_contact(pool: &PgPool, owner_id: Uuid, target_id: Uuid) -> Contact {
        let contact = sqlx::query_as::<_, Contact>(
            r#"
            INSERT INTO contacts (
                owner_id, target_id, relation_type, 
                remark_name, tags, is_favorite, mute_settings,
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, 
                $4, $5, $6, $7,
                $8, $9
            )
            RETURNING *
            "#
        )
        .bind(owner_id)
        .bind(target_id)
        .bind("friend")
        .bind(Some("Test Contact"))
        .bind(json!([]))
        .bind(false)
        .bind(json!({}))
        .bind(Utc::now())
        .bind(Utc::now())
        .fetch_one(pool)
        .await
        .expect("Failed to create test contact");
        
        contact
    }

    // Helper function to create a test conversation
    async fn create_test_conversation(pool: &PgPool, stream_id: i64, members: Vec<Uuid>) -> Conversation {
        let conversation = sqlx::query_as::<_, Conversation>(
            r#"
            INSERT INTO conversations (
                conversation_type, members, meta, stream_id,
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4,
                $5, $6
            )
            RETURNING *
            "#
        )
        .bind("direct")
        .bind(json!(members.iter().map(|id| id.to_string()).collect::<Vec<String>>()))
        .bind(json!({}))
        .bind(stream_id)
        .bind(Utc::now())
        .bind(Utc::now())
        .fetch_one(pool)
        .await
        .expect("Failed to create test conversation");
        
        conversation
    }

    // Helper function to create a test notification stream
    async fn create_test_notification_stream(pool: &PgPool, owner_id: Uuid) -> Stream {
        let stream = sqlx::query_as::<_, Stream>(
            r#"
            INSERT INTO streams (
                owner_id, stream_type, status, "offset", stream_meta, 
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7
            )
            RETURNING *
            "#
        )
        .bind(owner_id)
        .bind("notification")
        .bind("active")
        .bind(0i64)
        .bind(json!({}))
        .bind(Utc::now())
        .bind(Utc::now())
        .fetch_one(pool)
        .await
        .expect("Failed to create test notification stream");
        
        stream
    }

    #[tokio::test]
    async fn test_user_get_by_username() -> Result<()> {
        let pool = setup_test_db().await;
        let test_user = create_test_user(&pool).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test the user_get_by_username method
        let user = repo.user_get_by_email(&test_user.email).await?;
        
        assert_eq!(user.user_id, test_user.user_id);
        assert_eq!(user.username, test_user.username);
        assert_eq!(user.email, test_user.email);    
        
        Ok(())
    }

    #[tokio::test]
    async fn test_check_password() -> Result<()> {
        let pool = setup_test_db().await;
        let test_user = create_test_user(&pool).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test with correct password
        let result = repo.check_password(&test_user.username, "test_password_hash").await?;
        assert!(result);
        
        // Test with incorrect password
        let result = repo.check_password(&test_user.username, "wrong_password").await?;
        assert!(!result);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_list_contacts() -> Result<()> {
        let pool = setup_test_db().await;
        let owner = create_test_user(&pool).await;
        let target = create_test_user(&pool).await;
        
        // Create a test contact
        let _test_contact = create_test_contact(&pool, owner.user_id, target.user_id).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test the list_contacts method
        let contacts = repo.list_contacts(owner.user_id).await?;
        
        assert_eq!(contacts.len(), 1);
        assert_eq!(contacts[0].owner_id, owner.user_id);
        assert_eq!(contacts[0].target_id, target.user_id);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_list_streams() -> Result<()> {
        let pool = setup_test_db().await;
        let owner = create_test_user(&pool).await;
        
        // Create a test stream
        let test_stream = create_test_stream(&pool, owner.user_id).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test the list_streams method
        let streams = repo.list_streams(owner.user_id).await?;
        
        // Debug information
        println!("Expected stream_id: {}", test_stream.stream_id);
        println!("Expected owner_id: {}", owner.user_id);
        println!("Found {} streams", streams.len());
        for (i, stream) in streams.iter().enumerate() {
            println!("Stream {}: id={}, owner_id={}", i, stream.stream_id, stream.owner_id);
        }
        
        assert_eq!(streams.len(), 1, "Expected 1 stream, found {}", streams.len());
        assert_eq!(streams[0].stream_id, test_stream.stream_id);
        assert_eq!(streams[0].owner_id, owner.user_id);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_list_conversations() -> Result<()> {
        let pool = setup_test_db().await;
        let user1 = create_test_user(&pool).await;
        let user2 = create_test_user(&pool).await;
        
        // Create a test stream
        let test_stream = create_test_stream(&pool, user1.user_id).await;
        
        // Create a test conversation
        let test_conversation = create_test_conversation(
            &pool, 
            test_stream.stream_id, 
            vec![user1.user_id, user2.user_id]
        ).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test the list_conversations method for user1
        let conversations = repo.list_conversations(user1.user_id).await?;
        
        assert_eq!(conversations.len(), 1);
        assert_eq!(conversations[0].conversation_id, test_conversation.conversation_id);
        
        // Test the list_conversations method for user2
        let conversations = repo.list_conversations(user2.user_id).await?;
        
        assert_eq!(conversations.len(), 1);
        assert_eq!(conversations[0].conversation_id, test_conversation.conversation_id);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_update_stream_offset() -> Result<()> {
        let pool = setup_test_db().await;
        let owner = create_test_user(&pool).await;
        
        // Create a test stream
        let test_stream = create_test_stream(&pool, owner.user_id).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Update the stream offset
        let new_offset = 100;
        repo.update_stream_offset(test_stream.stream_id, new_offset).await?;
        
        // Verify the offset was updated
        let updated_stream = sqlx::query_as::<_, Stream>(
            "SELECT * FROM streams WHERE stream_id = $1"
        )
        .bind(test_stream.stream_id)
        .fetch_one(&pool)
        .await?;
        
        assert_eq!(updated_stream.offset, new_offset);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_update_stream_offset_api() -> Result<()> {
        let pool = setup_test_db().await;
        let owner = create_test_user(&pool).await;
        
        // Create a test stream
        let test_stream = create_test_stream(&pool, owner.user_id).await;
        
        // Create a test conversation to establish ACL
        let _test_conversation = create_test_conversation(
            &pool, 
            test_stream.stream_id, 
            vec![owner.user_id]
        ).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test updating stream offset through the API logic
        let new_offset = 150;
        let result = repo.update_stream_offset(test_stream.stream_id, new_offset).await;
        assert!(result.is_ok());
        
        // Verify the offset was updated in the database
        let updated_stream = sqlx::query_as::<_, Stream>(
            "SELECT * FROM streams WHERE stream_id = $1"
        )
        .bind(test_stream.stream_id)
        .fetch_one(&pool)
        .await?;
        
        assert_eq!(updated_stream.offset, new_offset);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_get_notification_stream_ids() -> Result<()> {
        let pool = setup_test_db().await;
        let user1 = create_test_user(&pool).await;
        let user2 = create_test_user(&pool).await;
        
        // Create notification streams for both users
        let notification_stream1 = create_test_notification_stream(&pool, user1.user_id).await;
        let notification_stream2 = create_test_notification_stream(&pool, user2.user_id).await;
        
        // Create a regular message stream (should not be returned)
        let _message_stream = create_test_stream(&pool, user1.user_id).await;
        
        // Create a repo with the test pool
        let repo = Repo::with_pool(pool.clone());
        
        // Test getting notification stream IDs for both users
        let user_ids = vec![user1.user_id, user2.user_id];
        let stream_ids = repo.get_notification_stream_ids(&user_ids).await?;
        
        // Should return both notification stream IDs
        assert_eq!(stream_ids.len(), 2);
        assert!(stream_ids.contains(&notification_stream1.stream_id));
        assert!(stream_ids.contains(&notification_stream2.stream_id));
        
        // Test with empty user_ids
        let empty_result = repo.get_notification_stream_ids(&[]).await?;
        assert_eq!(empty_result.len(), 0);
        
        // Test with single user
        let single_user_result = repo.get_notification_stream_ids(&[user1.user_id]).await?;
        assert_eq!(single_user_result.len(), 1);
        assert_eq!(single_user_result[0], notification_stream1.stream_id);
        
        // Test with non-existent user (should return empty)
        let non_existent_user = Uuid::new_v4();
        let non_existent_result = repo.get_notification_stream_ids(&[non_existent_user]).await?;
        assert_eq!(non_existent_result.len(), 0);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_create_conversation_with_stream() -> Result<()> {
        let pool = setup_test_db().await;
        let repo = Repo::with_pool(pool.clone());

        // 创建两个用户
        let user1 = create_test_user(&pool).await;
        let user2 = create_test_user(&pool).await;

        // 1. 测试 direct 会话首次创建
        let members = vec![user1.user_id, user2.user_id];
        let meta = serde_json::json!({});
        let (conv1, stream1, is_new1) = repo
            .create_conversation_with_stream(user1.user_id, "direct", &members, &meta)
            .await?;
        assert!(is_new1);
        assert_eq!(conv1.conversation_type, "direct");
        assert_eq!(stream1.owner_id, user1.user_id);

        // 2. 测试 direct 会话重复创建（应复用）
        let (conv2, stream2, is_new2) = repo
            .create_conversation_with_stream(user1.user_id, "direct", &members, &meta)
            .await?;
        assert!(!is_new2);
        assert_eq!(conv1.conversation_id, conv2.conversation_id);
        assert_eq!(stream1.stream_id, stream2.stream_id);

        // 3. 测试 group 会话每次都新建
        let group_members = vec![user1.user_id, user2.user_id];
        let (group_conv1, group_stream1, group_is_new1) = repo
            .create_conversation_with_stream(user1.user_id, "group", &group_members, &meta)
            .await?;
        assert!(group_is_new1);

        let (group_conv2, group_stream2, group_is_new2) = repo
            .create_conversation_with_stream(user1.user_id, "group", &group_members, &meta)
            .await?;
        assert!(group_is_new2);
        assert_ne!(group_conv1.conversation_id, group_conv2.conversation_id);
        assert_ne!(group_stream1.stream_id, group_stream2.stream_id);

        Ok(())
    }

}