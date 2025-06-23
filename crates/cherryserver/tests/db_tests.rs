use anyhow::Result;
use cherryserver::db::mock::MockRepo;
use uuid::Uuid;

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