use std::time::Duration;

use anyhow::{Context, Result};
use cherrycore::types::StreamType;
use serde_json::{json, Value};
use sqlx::{
    Pool,
    postgres::{PgPool, PgPoolOptions},
    query, query_as, query_scalar,
    types::Uuid,
};

use crate::db::models::UploadFile;


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

    pub async fn create_file_upload_request(&self, user_id: Uuid, file_id: Uuid,file_name: String, conversation_id: Uuid,  mime_type: String, size: i64) -> Result<()> {
        let sql = "INSERT INTO upload_files (file_id, user_id, filename, conversation_id, mime_type, size, status,  created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'created', now(), now())";
        query(sql)
            .bind(file_id)
            .bind(user_id)
            .bind(file_name)
            .bind(conversation_id)
            .bind(mime_type)
            .bind(size)
            .execute(&self.sqlx_pool)
            .await.context("create_file_upload_request")?;
        Ok(())
    }

    pub async fn update_file_upload_request(&self, file_name: String, file_id: Uuid, checksum: String, size: i64) -> Result<()> {
        let sql = "UPDATE upload_files SET filename = $1, checksum = $2, size = $3, status = 'uploaded', updated_at = now() WHERE file_id = $4";
        query(sql)
            .bind(file_name)
            .bind(checksum)
            .bind(size)
            .bind(file_id)
            .execute(&self.sqlx_pool)
            .await.context("update_file_upload_request")?;
        Ok(())
    }

    pub async fn get_file_upload_request(&self, file_id: Uuid) -> Result<UploadFile> {
        let sql = "SELECT * FROM upload_files WHERE file_id = $1";
        let request = query_as::<_, UploadFile>(sql)
            .bind(file_id)
            .fetch_one(&self.sqlx_pool)
            .await.context("get_file_upload_request")?;
        Ok(request)
    }

    pub async fn upload_file_complete(&self, file_id: Uuid, metadata: Option<Value>) -> Result<()> {
        let sql = "UPDATE upload_files SET metadata = $1, status = 'completed', updated_at = now() WHERE file_id = $2 AND status = 'uploaded'";
        query(sql)
            .bind(metadata)
            .bind(file_id)
            .execute(&self.sqlx_pool)
            .await.context("upload_file_complete")?;
        Ok(())
    }
}

