use deadpool_postgres::{Config, ManagerConfig, Pool, RecyclingMethod};
use log::info;
use crate::config::AppConfig;

// Application state
#[derive(Clone)]
pub struct AppState {
    pub db_pool: Pool,
    pub config: AppConfig,
}



pub async fn create_db_pool(app_config: &AppConfig) -> Result<Pool, Box<dyn std::error::Error>> {
    info!("Creating database connection pool...");
    
    let mut cfg = Config::new();
    cfg.url = Some(app_config.database.url.clone());
    cfg.manager = Some(ManagerConfig { 
        recycling_method: RecyclingMethod::Fast 
    });
    
    let pool = cfg.create_pool(None, tokio_postgres::NoTls)?;
    
    info!("Database connection pool created successfully with {} max connections", 
          app_config.database.max_connections);
    Ok(pool)
} 