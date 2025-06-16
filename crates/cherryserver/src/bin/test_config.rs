use std::env;
use cherryserver::config::AppConfig;

// Simple test program to verify configuration loading works
fn main() {
    println!("=== CherryServer Configuration Test ===\n");

    // Set some environment variables to test override
    unsafe {
        env::set_var("CHERRYSERVER_SERVER__PORT", "8080");
        env::set_var("CHERRYSERVER_JWT__SECRET", "test-env-secret");
        env::set_var("CHERRYSERVER_LOGGING__LEVEL", "debug");
    }

    // Test 1: Load default configuration
    println!("1. Testing default configuration...");
    let config = AppConfig::default();
    println!("✓ Default config loaded successfully");
    println!("  Server: {}:{}", config.server.host, config.server.port);
    println!("  Database URL: {}", config.database.url);
    println!("  JWT expiration: {} hours", config.jwt.expiration_hours);
    println!("  Log level: {}", config.logging.level);

    println!();

    // Test 2: Load configuration with environment variables
    println!("2. Testing configuration with environment variables...");
    match AppConfig::load() {
        Ok(config) => {
            println!("✓ Configuration loaded successfully");
            println!("  Server: {}:{}", config.server.host, config.server.port);
            println!("  Database URL: {}", config.database.url);
            println!("  JWT expiration: {} hours", config.jwt.expiration_hours);
            println!("  JWT secret: {}", if config.jwt.secret.len() > 10 { 
                format!("{}...", &config.jwt.secret[..10]) 
            } else { 
                config.jwt.secret.clone() 
            });
            println!("  Log level: {}", config.logging.level);
        }
        Err(e) => {
            println!("✗ Failed to load configuration: {}", e);
        }
    }

    println!();

    // Test 3: Check if config file exists
    println!("3. Checking for configuration files...");
    let config_files = vec!["config.yaml", "config.yml", "config.json", "config.toml"];
    for file in config_files {
        if std::path::Path::new(file).exists() {
            println!("  ✓ Found: {}", file);
        } else {
            println!("  - Not found: {}", file);
        }
    }

    println!("\n=== Configuration Test Complete ===");
} 