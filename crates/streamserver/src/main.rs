use std::{
    collections::HashMap,
    net::SocketAddr,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use anyhow::Result;
use axum::{
    Router,
    routing::{get, post},
};
use cherrycore::types::ResponseError;
use clap::Parser;
use serde::Deserialize;
use tokio::{net::TcpListener, sync::watch};

use streamstore::{StreamId, store::Store};
mod acl_checker;
mod stream;

#[derive(Clone, Deserialize)]
struct StreamServerConfig {
    pub server_port: u16,
    pub cherry_server_url: String,
    pub disable_acl_check: bool,
    pub jwt_secret: Option<String>,
    pub stream_storage_path: String,
}

impl StreamServerConfig {
    pub async fn load(filename: PathBuf) -> Result<Self> {
        let content = tokio::fs::read_to_string(filename).await?;
        let config = serde_yaml::from_str(&content)?;
        Ok(config)
    }
}

#[derive(Clone)]
struct StreamServer {
    inner: Arc<StreamServerInner>,
}

struct StreamServerInner {
    config: StreamServerConfig,
    store: streamstore::store::Store,
    watchers: Arc<Mutex<HashMap<StreamId, (watch::Sender<u64>, watch::Receiver<u64>)>>>,
}

impl std::ops::Deref for StreamServer {
    type Target = StreamServerInner;
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl StreamServer {
    pub fn new(config: StreamServerConfig, store: streamstore::store::Store) -> Self {
        let watchers = Arc::new(Mutex::new(HashMap::new()));
        Self {
            inner: Arc::new(StreamServerInner {
                config,
                store,
                watchers,
            }),
        }
    }

    async fn append_stream(
        &self,
        stream_id: StreamId,
        data: Vec<u8>,
    ) -> Result<u64, ResponseError> {
        if data.is_empty() {
            return Err(ResponseError::DataEmpty);
        }
        let offset = self.store.append_async(stream_id, data).await?;
        // notify watchers to read the stream data
        let watchers = self.watchers.lock().unwrap();
        if let Some((tx, _rx)) = watchers.get(&stream_id) {
            let _ = tx.send_replace(offset);
        }
        Ok(offset)
    }
}

#[derive(Parser, Debug)]
struct Cli {
    #[clap(short, long, default_value = "config.yaml")]
    config: PathBuf,
}

#[tokio::main(flavor = "multi_thread", worker_threads = 10)]
async fn main() {
    let cli = Cli::parse();
    let config = StreamServerConfig::load(cli.config).await.unwrap();

    env_logger::init_from_env(env_logger::Env::default().default_filter_or("debug"));

    if let Some(jwt_secret) = config.jwt_secret.as_deref() {
        // set jwt secret to env
        unsafe { std::env::set_var("JWT_SECRET", jwt_secret) };
    } else if std::env::var("JWT_SECRET").is_err() {
        panic!("JWT_SECRET is not set");
    }

    let store = streamstore::options::Options::default()
        .wal_path(&config.stream_storage_path)
        .open_store()
        .unwrap();

    let server = StreamServer::new(config.clone(), store);

    let app = Router::new()
        .merge(stream::init_routes())
        .with_state(server);
    let listener = TcpListener::bind(format!("0.0.0.0:{}", config.server_port))
        .await
        .unwrap();
    let addr = listener.local_addr().unwrap();
    println!("Listening on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
