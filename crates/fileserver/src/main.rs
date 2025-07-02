mod fileserver;
mod db;

use fileserver::{FileServer, FileServerConfig};

#[tokio::main]
async fn main() {
    let config = FileServerConfig {
        uploads_directory: "uploads".to_string(),
        listen_addr: "127.0.0.1:8080".to_string(),
        cherry_url: "http://localhost:8081".to_string(),
        db_url: "postgres://postgres:postgres123@localhost:5434/fileserver".to_string(),
    };
    let file_server = FileServer::new(config).await;
    file_server.start().await;
}
