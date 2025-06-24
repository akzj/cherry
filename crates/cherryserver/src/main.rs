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

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    let config_file = cli.config;

    let config = ServerConfig::load(config_file).await.unwrap();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("debug"));

    if let Some(jwt_secret) = config.jwt_secret.as_deref() {
        // set jwt secret to env
        unsafe {std::env::set_var("JWT_SECRET", jwt_secret)};
    }else if std::env::var("JWT_SECRET").is_err() {
        panic!("JWT_SECRET is not set");
    }

    let server = server::CherryServer::new(config).await;
    server::start(server).await;
}
