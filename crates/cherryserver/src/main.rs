mod db;
mod jwt;
mod server;
use std::path::PathBuf;

use crate::server::ServerConfig;

#[tokio::main(flavor = "multi_thread", worker_threads = 10)]
async fn main() {
    let args = std::env::args().collect::<Vec<String>>();
    if args.len() != 2 {
        eprintln!("Usage: {} <config_file>", args[0]);
        std::process::exit(1);
    }
    let config_file = PathBuf::from(args[1].clone());

    let config = ServerConfig::load(config_file).await.unwrap();
    let server = server::CherryServer::new(config).await;
    server::start(server).await;
}
