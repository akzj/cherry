use super::models::{Contact, User};
use sqlx::{
    query_as,
    sqlite::{SqlitePool, SqlitePoolOptions},
};

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

    pub async fn user_get_by_id(&self, id: i32) -> Result<User, sqlx::Error> {
        if let Some(pool) = &self.sqlx_pool {
            let user = query_as::<_, User>(
                "SELECT id, username, display_name, avatar_path, status FROM users WHERE id = ?",
            )
            .bind(id)
            .fetch_one(pool)
            .await?;

            Ok(user)
        } else {
            // Return a mock user for development when database is not available
            Ok(User {
                id,
                username: format!("user_{}", id),
                display_name: format!("User {}", id),
                avatar_path: None,
                status: "offline".to_string(),
            })
        }
    }

    pub async fn contact_list_all(&self) -> Result<Vec<Contact>, sqlx::Error> {
        if let Some(pool) = &self.sqlx_pool {
            // Use query_as with explicit type instead of the macro to avoid compile-time checks
            let contacts = sqlx::query_as::<_, Contact>("SELECT * FROM contacts")
                .fetch_all(pool)
                .await?;

            Ok(contacts)
        } else {
            // Return empty contacts list when database is not available
            Ok(Vec::new())
        }
    }
}
