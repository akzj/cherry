pub mod pool;
pub mod user;
pub mod friend;
pub mod group;
pub mod migration;

// Re-export commonly used types and functions
pub use pool::{create_db_pool, AppState};
pub use user::{authenticate_user, change_password};
#[allow(unused_imports)] // Available for future use (user registration, password changes, etc.)
pub use user::hash_password;
pub use friend::{get_user_friends, Friend};
pub use group::{get_user_groups, Group};
pub use migration::run_migrations; 