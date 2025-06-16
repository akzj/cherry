
use log::info;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

// Configuration module
mod config;
use config::AppConfig;

// Database modules
mod db;
use db::{AppState, create_db_pool, run_migrations};

// Authentication modules
mod auth;

// API modules
mod api;
use api::create_api_routes;

refinery::embed_migrations!("migrations");

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    // Load configuration
    let config = AppConfig::load().map_err(|e| {
        eprintln!("Failed to load configuration: {}", e);
        std::process::exit(1);
    })?;

    info!("Starting CherryServer with configuration loaded");

    // Run database migrations first
    run_migrations(&config).await?;

    // Create database connection pool
    let pool = create_db_pool(&config).await?;
    
    // Create application state with configuration
    let app_state = AppState { 
        db_pool: pool,
        config: config.clone(),
    };

    // Build our application with routes
    let app = create_api_routes()
        .with_state(app_state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let server_address = config.server_address();
    let listener = tokio::net::TcpListener::bind(&server_address).await?;
    info!("Server started on http://{}", server_address);
    
    axum::serve(listener, app).await?;

    Ok(())
}