use dotenvy::dotenv_override;
use std::env;

fn main() {
    dotenv_override().ok();
    println!("Build script executed - dotenv variables loaded");
    println!("Your environment variable in env: {}", env::var("DATABASE_URL").unwrap());
}
