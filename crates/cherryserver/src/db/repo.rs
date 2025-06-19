use std::time::Duration;

use anyhow::Result;
use sqlx::{
    Pool,
    postgres::{PgPool, PgPoolOptions},
    query_as,
    types::Uuid,
};

use crate::db::models::*;

#[derive(Clone)]
pub struct Repo {
    sqlx_pool: PgPool,
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

    pub async fn user_get_by_username(&self, username: &str) -> Result<User> {
        let user = query_as!(User, "SELECT * FROM users WHERE username = $1", username)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user)
    }

    pub async fn check_password(&self, username: &str, password: &str) -> Result<bool> {
        let user = query_as!(User, "SELECT * FROM users WHERE username = $1", username)
            .fetch_one(&self.sqlx_pool)
            .await?;
        Ok(user.password_hash == password)
    }

    pub async fn list_contacts(&self, user_id: Uuid) -> Result<Vec<Contact>> {
        let contacts = query_as!(
            Contact,
            "SELECT * FROM contacts WHERE owner_id = $1",
            user_id
        )
        .fetch_all(&self.sqlx_pool)
        .await?;
        Ok(contacts)
    }
}
