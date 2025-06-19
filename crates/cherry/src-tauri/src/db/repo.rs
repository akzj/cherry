use super::models::{Contact, User};
use sqlx::{
    query_as,
    sqlite::{SqlitePool, SqlitePoolOptions},
};

pub struct Repo {
    sqlx_pool: SqlitePool,
}

impl Repo {
    pub async fn new(db_url: &str) -> Self {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(db_url)
            .await
            .unwrap();
        Self { sqlx_pool: pool }
    }

    pub async fn user_get_by_id(&self, id: i32) -> Result<User, sqlx::Error> {
        let user = query_as::<_, User>(
            "SELECT id, username, display_name, avatar_path, status FROM users WHERE id = ?",
        )
        .bind(id)
        .fetch_one(&self.sqlx_pool)
        .await?;

        Ok(user)
    }

    pub async fn contact_list_all(&self) -> Result<Vec<Contact>, sqlx::Error> {
        let contacts = query_as!(Contact, "SELECT * FROM contacts")
            .fetch_all(&self.sqlx_pool)
            .await?;

        Ok(contacts)
    }
}
