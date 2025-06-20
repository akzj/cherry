mod db;
mod server;

use clap::Parser;
use std::path::PathBuf;

use crate::server::ServerConfig;

#[derive(Parser, Debug)]
struct Cli {
    #[clap(short, long, default_value = "config.yaml")]
    config: PathBuf,
}

#[tokio::main(flavor = "multi_thread", worker_threads = 10)]
async fn main() {
    let cli = Cli::parse();
    let config_file = cli.config;

    let config = ServerConfig::load(config_file).await.unwrap();
    let server = server::CherryServer::new(config).await;
    server::start(server).await;
}
