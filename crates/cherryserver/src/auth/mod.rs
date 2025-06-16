pub mod jwt;
pub mod middleware;
pub mod extractors;

// Re-export commonly used functions
pub use jwt::create_jwt;
pub use middleware::jwt_auth;
pub use extractors::AuthenticatedUser; 