use std::time::Duration;

use anyhow::{Context, Result};
use cherrycore::types::StreamType;
use serde_json::json;
use sqlx::{
    Pool,
    postgres::{PgPool, PgPoolOptions},
    query, query_as, query_scalar,
    types::Uuid,
};

use crate::db::models::FileUploadRequest;


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

    pub async fn create_file_upload_request(&self, file_id: Uuid, conversation_id: Uuid,  mime_type: String, size: i64) -> Result<()> {
        let sql = "INSERT INTO file_upload_requests (file_id, conversation_id, mime_type, size) VALUES ($1, $2, $3, $4)";
        query(sql)
            .bind(file_id)
            .bind(conversation_id)
            .bind(mime_type)
            .bind(size)
            .execute(&self.sqlx_pool)
            .await.context("create_file_upload_request")?;
        Ok(())
    }

    pub async fn update_file_upload_request(&self, file_name: String, file_id: Uuid, checksum: String, size: i64) -> Result<()> {
        let sql = "UPDATE file_upload_requests SET filename = $1, checksum = $2, size = $3 WHERE file_id = $4";
        query(sql)
            .bind(file_name)
            .bind(checksum)
            .bind(size)
            .bind(file_id)
            .execute(&self.sqlx_pool)
            .await.context("update_file_upload_request")?;
        Ok(())
    }

    pub async fn get_file_upload_request(&self, file_id: Uuid) -> Result<FileUploadRequest> {
        let sql = "SELECT * FROM file_upload_requests WHERE file_id = $1";
        let request = query_as::<_, FileUploadRequest>(sql)
            .bind(file_id)
            .fetch_one(&self.sqlx_pool)
            .await.context("get_file_upload_request")?;
        Ok(request)
    }
}

