use log::info;
use postgres::{Client, NoTls};
use refinery::Migration;
use crate::config::AppConfig;

// Re-export the embedded migrations
pub use crate::migrations;

pub async fn run_migrations(app_config: &AppConfig) -> Result<(), Box<dyn std::error::Error>> {
    info!("Running database migrations...");
    
    // Run migrations in a blocking task to avoid runtime conflict
    let database_url = app_config.database.url.clone();
    tokio::task::spawn_blocking(move || {
        // Use sync postgres client for migrations (required by refinery)
        let mut client = Client::connect(&database_url, NoTls).expect("Failed to connect to database");

        let use_iteration = std::env::args().any(|a| a.to_lowercase().eq("--iterate"));

        if use_iteration {
            // create an iterator over migrations as they run
            for migration in migrations::runner().run_iter(&mut client) {
                process_migration(migration.expect("Migration failed!"));
            }
        } else {
            // or run all migrations in one go
            migrations::runner().run(&mut client).expect("Failed to run migrations");
        }
    }).await.expect("Migration task failed");

    info!("Database migrations completed");
    Ok(())
}

fn process_migration(migration: Migration) {
    #[cfg(not(feature = "enums"))]
    {
        // run something after each migration
        info!("Post-processing a migration: {}", migration)
    }

    #[cfg(feature = "enums")]
    {
        // or with the `enums` feature enabled, match against migrations to run specific post-migration steps
        use migrations::EmbeddedMigration;
        match migration.into() {
            EmbeddedMigration::Initial(m) => info!("V{}: Initialized the database!", m.version()),
            m => info!("Got a migration: {:?}", m),
        }
    }
} 