use std::path::PathBuf;
use std::{string, sync::Arc};

use axum::extract::Multipart;
use axum::{
    BoxError, Json, Router,
    body::{self, Body, Bytes},
    extract::{Path, State},
    http::{Response, StatusCode, header},
    routing::{get, post},
};
use cherrycore::types::FileUploadCompleteResponse;
use cherrycore::{
    client::cherry::CherryClient,
    jwt::JwtClaims,
    types::{
        FileUploadCompleteRequest, FileUploadCreateRequest, FileUploadCreateResponse, ResponseError,
    },
};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};

use crate::db::repo::Repo;
use sha2::{Digest, Sha256};
use tokio::{
    fs::File,
    io::{AsyncWriteExt, BufWriter},
    net::TcpListener,
};
use tokio_util::io::ReaderStream;
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FileServerConfig {
    pub listen_addr: String,
    pub cherry_url: String,
    pub db_url: String,
    pub uploads_directory: String,
    pub thumbnail_size: u32,
    pub disable_acl: bool, // for testing
    pub jwt_secret: Option<String>,
}

impl FileServerConfig {
    pub async fn load(config_file: PathBuf) -> Result<Self, Box<dyn std::error::Error>> {
        let config = serde_yaml::from_reader(std::fs::File::open(config_file)?)?;
        Ok(config)
    }
}

#[derive(Clone)]
pub(crate) struct FileServer {
    inner: Arc<FileServerInner>,
}

impl std::ops::Deref for FileServer {
    type Target = FileServerInner;
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

#[derive(Clone)]
pub(crate) struct FileServerInner {
    db: Repo,
    config: FileServerConfig,
    cherry_client: CherryClient,
}

impl FileServerInner {
    pub async fn check_acl(
        &self,
        jwt_claims: &JwtClaims,
        conversation_id: Uuid,
    ) -> Result<bool, ResponseError> {
        if self.config.disable_acl {
            return Ok(true);
        }

        match self
            .cherry_client
            .check_acl(jwt_claims.user_id, None, Some(conversation_id))
            .await
        {
            Ok(allowed) => Ok(allowed),
            Err(e) => {
                log::error!(
                    "check_acl: user_id={} conversation_id={} error={:?}",
                    jwt_claims.user_id,
                    conversation_id,
                    e
                );
                Err(ResponseError::InternalError(e.into()))
            }
        }
    }
}

async fn create_file_upload_request(
    jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    req: Json<FileUploadCreateRequest>,
) -> Result<Json<FileUploadCreateResponse>, ResponseError> {
    let allowed = server.check_acl(&jwt_claims, req.conversation_id).await?;
    if !allowed {
        log::error!(
            "image_upload_request: user_id={} conversation_id={} access denied",
            jwt_claims.user_id,
            req.conversation_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let file_id = Uuid::new_v4();
    server
        .db
        .create_file_upload_request(
            jwt_claims.user_id,
            file_id,
            req.file_name.clone(),
            req.conversation_id,
            req.mime_type.clone(),
            req.size,
        )
        .await?;

    Ok(Json(FileUploadCreateResponse {
        upload_url: format!("/api/v1/files/upload/{}/{}", req.conversation_id, file_id),
        file_id,
        expires_at: Utc::now() + Duration::days(30),
    }))
}

async fn file_upload(
    jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    Path((conversation_id, file_id)): Path<(Uuid, Uuid)>,
    mut multipart: Multipart,
) -> Result<Json<()>, ResponseError> {
    log::info!(
        "file_upload: user_id={} conversation_id={} file_id={}",
        jwt_claims.user_id,
        conversation_id,
        file_id
    );

    let allowed = server.check_acl(&jwt_claims, conversation_id).await?;
    if !allowed {
        log::error!(
            "file_upload: user_id={} conversation_id={} file_id={} access denied",
            jwt_claims.user_id,
            conversation_id,
            file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let upload_file_req = server.db.get_file_upload_request(file_id).await?;
    if upload_file_req.conversation_id != conversation_id {
        log::error!(
            "file_upload: user_id={} conversation_id={} file_id={} conversation_id_mismatch",
            jwt_claims.user_id,
            conversation_id,
            file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let mut field = match multipart.next_field().await {
        Ok(Some(field)) => field,
        Ok(None) => {
            log::error!(
                "file_upload: user_id={} conversation_id={} file_id={} no file data",
                jwt_claims.user_id,
                conversation_id,
                file_id
            );
            return Err(ResponseError::DataEmpty);
        }
        Err(e) => {
            log::error!(
                "file_upload: user_id={} conversation_id={} file_id={} error={:?}",
                jwt_claims.user_id,
                conversation_id,
                file_id,
                e
            );
            return Err(ResponseError::InternalError(e.into()));
        }
    };

    // Create the directory if it doesn't exist
    let dir_path =
        std::path::Path::new(&server.config.uploads_directory).join(conversation_id.to_string());
    tokio::fs::create_dir_all(&dir_path).await.map_err(|e| {
        log::error!(
            "file_upload: user_id={} conversation_id={} file_id={} create_dir_all error={:?}",
            jwt_claims.user_id,
            conversation_id,
            file_id,
            e
        );
        ResponseError::InternalError(e.into())
    })?;
    log::info!(
        "file_upload: user_id={} conversation_id={} file_id={} create_dir_all success",
        jwt_claims.user_id,
        conversation_id,
        file_id
    );

    // Create the file
    let file_path = dir_path.join(file_id.to_string());
    let mut file = BufWriter::new(File::create(&file_path).await.map_err(|e| {
        log::error!(
            "file_upload: user_id={} conversation_id={} file_id={} create_file error={:?}",
            jwt_claims.user_id,
            conversation_id,
            file_id,
            e
        );
        ResponseError::InternalError(e.into())
    })?);

    let mut total_size = 0;
    let mut hash = Sha256::new();

    while let Some(chunk) = field.chunk().await.map_err(|e| {
        log::error!(
            "file_upload: user_id={} conversation_id={} file_id={} chunk error={:?}",
            jwt_claims.user_id,
            conversation_id,
            file_id,
            e
        );
        ResponseError::ClientConnectionError(e.into())
    })? {
        file.write_all(&chunk).await.map_err(|e| {
            log::error!(
                "file_upload: user_id={} conversation_id={} file_id={} write_all error={:?}",
                jwt_claims.user_id,
                conversation_id,
                file_id,
                e
            );
            ResponseError::InternalError(e.into())
        })?;

        file.flush().await.map_err(|e| {
            log::error!(
                "file_upload: user_id={} conversation_id={} file_id={} flush error={:?}",
                jwt_claims.user_id,
                conversation_id,
                file_id,
                e
            );
            ResponseError::InternalError(e.into())
        })?;

        hash.update(&chunk);
        total_size += chunk.len();
    }

    log::info!(
        "file_upload: user_id={} conversation_id={} file_id={} total_size={}",
        jwt_claims.user_id,
        conversation_id,
        file_id,
        total_size
    );

    if total_size != upload_file_req.size.unwrap_or(total_size as i64) as usize {
        log::error!(
            "file_upload: user_id={} conversation_id={} file_id={} file_size={} expected={}",
            jwt_claims.user_id,
            conversation_id,
            file_id,
            total_size,
            upload_file_req.size.unwrap_or(0)
        );
        return Err(ResponseError::DataInvalid);
    }

    let checksum = hash.finalize();
    let checksum = checksum
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect::<Vec<String>>()
        .join("");

    server
        .db
        .update_file_upload_request(file_id, checksum, total_size as i64)
        .await
        .map_err(|e| {
            log::error!(
                "file_upload: user_id={} conversation_id={} file_id={} update_file_upload_request error={:?}",
                jwt_claims.user_id,
                conversation_id,
                file_id,
                e
            );
            ResponseError::InternalError(e.into())
        })?;

    log::info!(
        "file_upload: user_id={} conversation_id={} file_id={} path={:?}",
        jwt_claims.user_id,
        conversation_id,
        file_id,
        file_path.to_str().unwrap()
    );

    Ok(Json(()))
}

async fn file_upload_complete(
    jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    Json(request): Json<FileUploadCompleteRequest>,
) -> Result<Json<FileUploadCompleteResponse>, ResponseError> {
    // check acl
    let allowed = server
        .check_acl(&jwt_claims, request.conversation_id)
        .await?;
    if !allowed {
        log::error!(
            "file_upload_complete: user_id={} conversation_id={} file_id={} access denied",
            jwt_claims.user_id,
            request.conversation_id,
            request.file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let upload_file = server.db.get_file_upload_request(request.file_id).await?;
    if upload_file.conversation_id != request.conversation_id {
        log::error!(
            "file_upload_complete: user_id={} conversation_id={} file_id={} conversation_id_mismatch",
            jwt_claims.user_id,
            request.conversation_id,
            request.file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    if upload_file.checksum.as_ref().unwrap_or(&request.checksum) != &request.checksum {
        log::error!(
            "file_upload_complete: user_id={} conversation_id={} file_id={} checksum mismatch",
            jwt_claims.user_id,
            request.conversation_id,
            request.file_id
        );
        return Err(ResponseError::DataInvalid);
    }

    server
        .db
        .upload_file_complete(request.file_id, request.metadata.clone())
        .await?;

    // check file type, if image, create thumbnail
    if upload_file.is_image() {
        let file_path = std::path::Path::new(&server.config.uploads_directory)
            .join(request.conversation_id.to_string())
            .join(request.file_id.to_string());
        let thumbnail_path = file_path.with_extension("thumbnail");
        let thumbnail_file = File::create(thumbnail_path)
            .await
            .map_err(|e| ResponseError::InternalError(e.into()))?;
        let mut thumbnail_file = BufWriter::new(thumbnail_file);

        // generate thumbnail_data from image file
        let image_data = tokio::fs::read(file_path)
            .await
            .map_err(|e| ResponseError::InternalError(e.into()))?;
        let image = image::load_from_memory(&image_data)
            .map_err(|e| {
                log::error!(
                    "file_upload_complete: user_id={} conversation_id={} file_id={} load_from_memory error={:?}",
                    jwt_claims.user_id,
                    request.conversation_id,
                    request.file_id,
                    e
                );
                ResponseError::InternalError(e.into())
            })?;
        let thumbnail_img =
            image.thumbnail(server.config.thumbnail_size, server.config.thumbnail_size);

        let mut thumbnail_data = Vec::new();
        thumbnail_img
            .write_to(
                &mut std::io::Cursor::new(&mut thumbnail_data),
                image::ImageFormat::Png,
            )
            .map_err(|e| ResponseError::InternalError(e.into()))?;
        thumbnail_file
            .write_all(&thumbnail_data)
            .await
            .map_err(|e| ResponseError::InternalError(e.into()))?;
    }

    Ok(Json(FileUploadCompleteResponse {
        file_id: request.file_id,
        file_name: upload_file.filename,
        file_url: format!(
            "/api/v1/files/download/{}/{}",
            request.conversation_id, request.file_id
        ),
        file_thumbnail_url: format!(
            "/api/v1/files/download/{}/{}.thumbnail",
            request.conversation_id, request.file_id
        ),
        file_metadata: request.metadata,
    }))
}

// get file
async fn get_file(
    //jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    Path((conversation_id, file_id)): Path<(Uuid, Uuid)>,
) -> Result<Response<Body>, ResponseError> {
    // let allowed = server.check_acl(&jwt_claims, conversation_id).await?;
    // if !allowed {
    //     log::error!(
    //         "get_file: user_id={} conversation_id={} file_id={} access denied",
    //         jwt_claims.user_id,
    //         conversation_id,
    //         file_id
    //     );
    //     return Err(ResponseError::AccessDenied);
    // }

    let upload_file = server.db.get_file_upload_request(file_id).await?;
    if upload_file.conversation_id != conversation_id {
        log::error!(
            "get_file:  conversation_id={} file_id={} conversation_id_mismatch",
            //jwt_claims.user_id,
            conversation_id,
            file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let file_path = std::path::Path::new(&server.config.uploads_directory)
        .join(conversation_id.to_string())
        .join(file_id.to_string());
    let file = File::open(file_path)
        .await
        .map_err(|e| ResponseError::InternalError(e.into()))?;

    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(
            header::CONTENT_TYPE,
            upload_file
                .mime_type
                .as_ref()
                .unwrap_or(&"application/octet-stream".to_string()),
        )
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{:?}\"", upload_file.filename),
        )
        .body(body)
        .unwrap())
}

async fn get_thumbnail(
    jwt_claims: JwtClaims,
    State(server): State<FileServer>,
    Path(conversation_id): Path<Uuid>,
    Path(file_id): Path<Uuid>,
) -> Result<Response<Body>, ResponseError> {
    let allowed = server.check_acl(&jwt_claims, conversation_id).await?;
    if !allowed {
        log::error!(
            "get_thumbnail: user_id={} conversation_id={} file_id={} access denied",
            jwt_claims.user_id,
            conversation_id,
            file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let upload_file = server.db.get_file_upload_request(file_id).await?;
    if upload_file.conversation_id != conversation_id {
        log::error!(
            "get_thumbnail: user_id={} conversation_id={} file_id={} conversation_id_mismatch",
            jwt_claims.user_id,
            conversation_id,
            file_id
        );
        return Err(ResponseError::AccessDenied);
    }

    let thumbnail_path = std::path::Path::new(&server.config.uploads_directory)
        .join(conversation_id.to_string())
        .join(file_id.to_string())
        .with_extension("thumbnail");
    let file = File::open(thumbnail_path)
        .await
        .map_err(|e| ResponseError::InternalError(e.into()))?;

    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "image/png")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{:?}\"", upload_file.filename),
        )
        .body(body)
        .unwrap())
}

impl FileServer {
    pub async fn new(config: FileServerConfig) -> Self {
        let inner = FileServerInner {
            config: config.clone(),
            db: Repo::new(&config.db_url).await,
            cherry_client: CherryClient::new_with_base_url(config.cherry_url).unwrap(),
        };
        Self {
            inner: Arc::new(inner),
        }
    }

    pub(crate) async fn start(&self) {
        let app = Router::new()
            .route("/", get(|| async { "Hello, World!" }))
            .route(
                "/api/v1/files/upload/create",
                post(create_file_upload_request),
            )
            .route(
                "/api/v1/files/upload/{conversation_id}/{file_id}",
                post(file_upload),
            )
            .route("/api/v1/files/upload/complete", post(file_upload_complete))
            .route(
                "/api/v1/files/download/{conversation_id}/{file_id}",
                get(get_file),
            )
            .route(
                "/api/v1/files/download/{conversation_id}/{file_id}/thumbnail",
                get(get_thumbnail),
            )
            .with_state(self.clone());

        let listener = TcpListener::bind(self.config.listen_addr.clone())
            .await
            .unwrap();
        axum::serve(listener, app).await.unwrap();
    }
}
