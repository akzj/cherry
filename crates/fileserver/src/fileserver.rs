use std::sync::Arc;

use axum::{body::Bytes, extract::{Path, State}, http::StatusCode, routing::{get, post}, BoxError, Json, Router};
use axum::extract::Multipart;
use cherrycore::{client::cherry::CherryClient, jwt::JwtClaims, types::{FileUploadRequest, FileUploadResponse, ResponseError}};
use chrono::{Duration, Utc};

use sha2::{Sha256, Digest};
use tokio::{fs::File, io::{AsyncWriteExt, BufWriter}, net::TcpListener};
use uuid::Uuid;
use crate::db::repo::Repo;

#[derive(Debug, Clone)]
pub struct FileServerConfig {
    pub listen_addr: String,
    pub cherry_url: String,
    pub db_url: String,
    pub uploads_directory: String,
}


#[derive(Clone)]
pub (crate) struct FileServer {
    inner: Arc<FileServerInner>,
    
}

impl std::ops::Deref for FileServer {
    type Target = FileServerInner;
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

#[derive(Clone)]
pub (crate) struct FileServerInner {
    db: Repo,
    config: FileServerConfig,
    cherry_client: CherryClient,
}




async fn create_file_upload_request(
    jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    req: Json<FileUploadRequest>,
) -> Result<Json<FileUploadResponse>, ResponseError> {

    let allowed = server.cherry_client.check_acl(jwt_claims.user_id, None, Some(req.conversation_id)).await?;
    if !allowed {
        log::error!("image_upload_request: user_id={} conversation_id={} access denied", jwt_claims.user_id, req.conversation_id);
        return Err(ResponseError::AccessDenied);
    }

    let file_id = Uuid::new_v4();
    server.db.create_file_upload_request(file_id, req.conversation_id, req.mime_type.clone(), req.size).await?;
    
    Ok(Json(FileUploadResponse {
        upload_url: format!("/api/v1/files/upload/{}/{}/", req.conversation_id, file_id),
        file_id,
        expires_at: Utc::now() + Duration::days(30),
    }))
}


async fn file_upload(
    jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    Path(conversation_id): Path<Uuid>,
    Path(file_id): Path<Uuid>,
    mut multipart: Multipart,
) -> Result<Json<()>, ResponseError> {

    let upload_file_req = server.db.get_file_upload_request(file_id).await?;
    if upload_file_req.conversation_id != conversation_id {
        log::error!("file_upload: user_id={} conversation_id={} file_id={} access denied", jwt_claims.user_id, conversation_id, file_id);
        return Err(ResponseError::AccessDenied);
    }

    let mut field = match multipart.next_field().await{
        Ok(Some(field)) => field,
        Ok(None) => {
            log::error!("file_upload: user_id={} conversation_id={} file_id={} no file data", jwt_claims.user_id, conversation_id, file_id);
            return Err(ResponseError::DataEmpty);
        }
        Err(e) => {
            log::error!("file_upload: user_id={} conversation_id={} file_id={} error={:?}", jwt_claims.user_id, conversation_id, file_id, e);
            return Err(ResponseError::InternalError(e.into()));
        }
    };
    let file_name = field.file_name().ok_or(ResponseError::DataEmpty)?.to_string();

    // Create the directory if it doesn't exist
    let dir_path = std::path::Path::new(&server.config.uploads_directory).join(conversation_id.to_string());
    tokio::fs::create_dir_all(&dir_path).await.map_err(|e| ResponseError::InternalError(e.into()))?;

    // Create the file
    let path = dir_path.join(file_id.to_string());
    let mut file = BufWriter::new(File::create(&path).await.map_err(|e| ResponseError::InternalError(e.into()))?);

    let mut total_size = 0;
    let mut hash = Sha256::new();


    // const arrayBuffer = await file.arrayBuffer();
    // const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    // const hashArray = Array.from(new Uint8Array(hashBuffer));
    // const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    while let Some(chunk) = field.chunk().await.map_err(|e| ResponseError::ClientConnectionError(e.into()))? {
        file.write_all(&chunk).await.map_err(|e| ResponseError::InternalError(e.into()))?;
        hash.update(&chunk);
        total_size += chunk.len();
    }

    if total_size != upload_file_req.size.unwrap_or(total_size as i64) as usize {
        log::error!("file_upload: user_id={} conversation_id={} file_id={} file_size={} expected={}", jwt_claims.user_id, conversation_id, file_id, total_size, upload_file_req.size.unwrap_or(0));
        return Err(ResponseError::DataInvalid);
    }

    let checksum = hash.finalize();
    let checksum = checksum.iter().map(|b| format!("{:02x}", b)).collect::<Vec<String>>().join("");

    server.db.update_file_upload_request(file_name.clone(),file_id, checksum, total_size as i64).await?;

    log::info!("file_upload: user_id={} conversation_id={} file_name={} path={:?}", jwt_claims.user_id, conversation_id, file_name, path);

    Ok(Json(()))
    
}

impl FileServer {
    pub async fn new(config: FileServerConfig) -> Self {
        let inner = FileServerInner {
            config: config.clone(),
            db: Repo::new(&config.db_url).await,
            cherry_client: CherryClient::new_with_base_url(config.cherry_url).unwrap(),
        };
        Self { inner: Arc::new(inner) }
    }

    pub(crate) async fn start(&self) {
        let app = Router::new()
            .route("/", get(|| async { "Hello, World!" }))
            .route("/api/v1/files/upload", post(create_file_upload_request))
            .route("/api/v1/files/upload/{conversation_id}/{file_id}", post(file_upload))
            .with_state(self.clone());
    
            let listener = TcpListener::bind(self.config.listen_addr.clone())
            .await
            .unwrap();
        axum::serve(listener, app).await.unwrap();
    }
}

