use deadpool_postgres::Pool;
use log::{info, warn};

pub async fn authenticate_user(
    pool: &Pool,
    username: &str,
    password: &str,
) -> Result<Option<i32>, Box<dyn std::error::Error + Send + Sync>> {
    info!("Authenticating user: {}", username);
    
    let client = pool.get().await?;
    
    // Get user's hashed password from database
    let stmt = client
        .prepare("SELECT id, password FROM users WHERE name = $1")
        .await?;
    
    let rows = client.query(&stmt, &[&username]).await?;
    
    if let Some(row) = rows.first() {
        let user_id: i32 = row.get(0);
        let stored_hash: String = row.get(1);
        
        // Verify password using bcrypt
        match bcrypt::verify(password, &stored_hash) {
            Ok(true) => {
                info!("User {} authenticated successfully with ID: {}", username, user_id);
                Ok(Some(user_id))
            }
            Ok(false) => {
                warn!("Password verification failed for user: {}", username);
                Ok(None)
            }
            Err(e) => {
                warn!("Error verifying password for user {}: {}", username, e);
                Ok(None)
            }
        }
    } else {
        info!("User not found: {}", username);
        Ok(None)
    }
}

/// Hash a password using bcrypt
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    bcrypt::hash(password, bcrypt::DEFAULT_COST)
}

// 修改密码时哈希新密码
pub async fn change_password(
    pool: &Pool,
    user_id: i32,
    new_password: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let hashed_password = hash_password(new_password)?;
    
    let client = pool.get().await?;
    let stmt = client
        .prepare("UPDATE users SET password = $1 WHERE id = $2")
        .await?;
    
    client.execute(&stmt, &[&hashed_password, &user_id]).await?;
    Ok(())
} 