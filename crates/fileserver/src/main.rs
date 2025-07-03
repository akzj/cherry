mod db;
mod fileserver;

use std::{env, path::PathBuf};

use clap::Parser;

use fileserver::{FileServer, FileServerConfig};

#[derive(Parser, Debug)]
struct Cli {
    #[clap(short, long, default_value = "config.yaml")]
    config: PathBuf,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    let config_file = cli.config;

    // set rust_log to use the environment variable RUST_LOG
    let log_level = "RUST_LOG";
    let env = env::var(log_level).unwrap_or_else(|_| "debug".to_string());
    unsafe {
        env::set_var(log_level, env);
    }

    let config = FileServerConfig::load(config_file).await.unwrap();
    use std::io::Write;
    env_logger::Builder::from_default_env()
        .format(|buf, record| {
            writeln!(
                buf,
                "{}:{} level:{} {}",
                record.file().unwrap(),
                record.line().unwrap(),
                record.level(),
                record.args()
            )
        })
        .init();

    if let Some(jwt_secret) = config.jwt_secret.as_deref() {
        // set jwt secret to env
        log::info!("Setting JWT_SECRET from config file");
        unsafe { std::env::set_var("JWT_SECRET", jwt_secret) };
    } else if std::env::var("JWT_SECRET").is_err() {
        log::error!("JWT_SECRET is not set");
        panic!("JWT_SECRET is not set");
    }

    let file_server = FileServer::new(config).await;
    file_server.start().await;
}
