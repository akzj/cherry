use config::{Config, ConfigError, Environment, File};
use serde::{Deserialize, Serialize};
use std::path::Path;
use log::{info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub jwt: JwtConfig,
    pub logging: LoggingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtConfig {
    pub secret: String,
    pub expiration_hours: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                host: "0.0.0.0".to_string(),
                port: 3000,
            },
            database: DatabaseConfig {
                url: "postgresql://postgres:password@localhost/mydb".to_string(),
                max_connections: 10,
                min_connections: 1,
            },
            jwt: JwtConfig {
                secret: "your-secret-key-change-this-in-production".to_string(),
                expiration_hours: 24,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
            },
        }
    }
}

impl AppConfig {
    /// Load configuration from multiple sources in priority order:
    /// 1. Default values
    /// 2. Configuration file (config.yaml, config.json, etc.)
    /// 3. Environment variables (with CHERRYSERVER_ prefix)
    pub fn load() -> Result<Self, ConfigError> {
        let mut config_builder = Config::builder()
            // Start with default values
            .add_source(config::Config::try_from(&AppConfig::default())?);

        // Try to load from configuration files
        let config_files = vec![
            "config.yaml",
            "config.yml", 
            "config.json",
            "config.toml",
        ];

        for file_path in config_files {
            if Path::new(file_path).exists() {
                info!("Loading configuration from: {}", file_path);
                config_builder = config_builder.add_source(File::with_name(file_path));
                break;
            }
        }

        // Override with environment variables
        config_builder = config_builder.add_source(
            Environment::with_prefix("CHERRYSERVER")
                .prefix_separator("_")
                .separator("__")
        );

        let config = config_builder.build()?;
        let app_config: AppConfig = config.try_deserialize()?;
        
        info!("Configuration loaded successfully");
        
        // Validate configuration
        app_config.validate()?;
        
        Ok(app_config)
    }

    /// Load configuration from a specific file
    pub fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Self, ConfigError> {
        let path = path.as_ref();
        info!("Loading configuration from file: {}", path.display());
        
        let config = Config::builder()
            .add_source(config::Config::try_from(&AppConfig::default())?)
            .add_source(File::from(path))
            .add_source(
                Environment::with_prefix("CHERRYSERVER")
                    .prefix_separator("_")
                    .separator("__")
            )
            .build()?;

        let app_config: AppConfig = config.try_deserialize()?;
        app_config.validate()?;
        
        Ok(app_config)
    }

    /// Validate configuration values
    fn validate(&self) -> Result<(), ConfigError> {
        // Validate server configuration
        if self.server.port == 0 {
            return Err(ConfigError::Message("Server port cannot be 0".to_string()));
        }

        // Validate database configuration
        if self.database.url.is_empty() {
            return Err(ConfigError::Message("Database URL cannot be empty".to_string()));
        }

        if self.database.max_connections < self.database.min_connections {
            return Err(ConfigError::Message(
                "Database max_connections must be >= min_connections".to_string()
            ));
        }

        // Validate JWT configuration
        if self.jwt.secret.is_empty() {
            return Err(ConfigError::Message("JWT secret cannot be empty".to_string()));
        }

        if self.jwt.secret == "your-secret-key-change-this-in-production" {
            warn!("Using default JWT secret! Please change this in production!");
        }

        if self.jwt.expiration_hours <= 0 {
            return Err(ConfigError::Message("JWT expiration hours must be positive".to_string()));
        }

        Ok(())
    }

    /// Get server bind address
    pub fn server_address(&self) -> String {
        format!("{}:{}", self.server.host, self.server.port)
    }

    /// Save current configuration to a file
    pub fn save_to_file<P: AsRef<Path>>(&self, path: P, format: ConfigFormat) -> std::io::Result<()> {
        let path = path.as_ref();
        let content = match format {
            ConfigFormat::Yaml => serde_yaml::to_string(self)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?,
            ConfigFormat::Json => serde_json::to_string_pretty(self)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?,
        };
        
        std::fs::write(path, content)?;
        info!("Configuration saved to: {}", path.display());
        Ok(())
    }
}

pub enum ConfigFormat {
    Yaml,
    Json,
} 