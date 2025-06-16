use deadpool_postgres::Pool;
use log::info;
use serde::Serialize;
#[derive(Debug, Serialize)]
pub struct Friend {
    pub id: u32,
    pub name: String,
    pub avatar: Option<String>,
    pub status: String,
}

pub async fn get_user_friends(
    pool: &Pool,
    user_id: i32,
) -> Result<Vec<Friend>, Box<dyn std::error::Error + Send + Sync>> {
    info!("Fetching friends for user ID: {}", user_id);
    
    let client = pool.get().await?;
    
    let stmt = client
        .prepare(
            "SELECT u.id, u.name, u.avatar, u.status 
             FROM users u 
             JOIN friends f ON u.id = f.friend_id 
             WHERE f.user_id = $1 AND f.status = 1"
        )
        .await?;
    
    let rows = client.query(&stmt, &[&user_id]).await?;
    
    let mut friends = Vec::new();
    for row in rows {
        let status_code: i32 = row.get(3);
        let status = match status_code {
            0 => "offline",
            1 => "online",
            2 => "away",
            _ => "unknown",
        };
        
        friends.push(Friend {
            id: row.get::<_, i32>(0) as u32,
            name: row.get(1),
            avatar: row.get(2),
            status: status.to_string(),
        });
    }
    
    info!("Found {} friends for user ID: {}", friends.len(), user_id);
    Ok(friends)
} 