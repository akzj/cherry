use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};

use crate::auth::jwt::Claims;

/// Extractor for JWT Claims
/// This allows handlers to directly extract user information from JWT tokens
#[derive(Debug)]
pub struct AuthenticatedUser(pub Claims);

#[async_trait]
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<Claims>()
            .cloned()
            .map(AuthenticatedUser)
            .ok_or(StatusCode::UNAUTHORIZED)
    }
}

impl AuthenticatedUser {
    /// Get user ID as i32
    pub fn user_id(&self) -> Result<i32, String> {
        self.0.sub.parse::<i32>()
            .map_err(|_| "Invalid user ID in token".to_string())
    }
    
    /// Get username
    pub fn username(&self) -> &str {
        &self.0.username
    }
    
    /// Get the full claims
    pub fn claims(&self) -> &Claims {
        &self.0
    }
} 