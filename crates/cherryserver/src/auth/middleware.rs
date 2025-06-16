use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use log::{info, warn};

use crate::auth::jwt::{verify_jwt, Claims};
use crate::db::AppState;

/// JWT Authentication middleware that gets config from app state
pub async fn jwt_auth(
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get the app state from request extensions (available after .with_state())
    let app_state = request.extensions()
        .get::<AppState>()
        .ok_or_else(|| {
            warn!("AppState not found in request extensions");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Extract Authorization header
    let auth_header = request.headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(header) => {
            if header.starts_with("Bearer ") {
                &header[7..] // Remove "Bearer " prefix
            } else {
                warn!("Invalid Authorization header format");
                return Err(StatusCode::UNAUTHORIZED);
            }
        }
        None => {
            warn!("Missing Authorization header");
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    // Verify JWT token using configuration
    match verify_jwt(token, &app_state.config) {
        Ok(claims) => {
            info!("JWT authentication successful for user: {}", claims.username);
            
            // Add claims to request extensions for handlers to use
            request.extensions_mut().insert(claims);
            
            Ok(next.run(request).await)
        }
        Err(e) => {
            warn!("JWT authentication failed: {}", e);
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

/// Extract claims from request extensions
/// This is a helper function for handlers to get user info from JWT
pub fn extract_claims_from_request(request: &Request) -> Option<&Claims> {
    request.extensions().get::<Claims>()
} 