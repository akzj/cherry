use dotenvy::dotenv_override;
use std::env;

fn main() {
    dotenv_override().ok();
    
    // Tell cargo to rerun if .env changes
    println!("cargo:rerun-if-changed=.env");
    
    // Use cargo warning to make output visible
    if let Ok(db_url) = env::var("DATABASE_URL") {
        println!("cargo:warning=DATABASE_URL loaded: {}", db_url);
    } else {
        println!("cargo:warning=DATABASE_URL not found in environment");
    }
    
    tauri_build::build()
}
