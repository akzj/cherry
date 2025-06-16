use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::Json as ResponseJson,
};
use log::{error, info};

use crate::db::{authenticate_user, change_password, AppState};
use crate::api::types::{LoginRequest, LoginResponse, ChangePasswordRequest, ChangePasswordResponse};
use crate::auth::{create_jwt, AuthenticatedUser};

pub async fn login(
    State(app_state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<ResponseJson<LoginResponse>, StatusCode> {
    info!("Login attempt for user: {}", payload.username);
    
    match authenticate_user(&app_state.db_pool, &payload.username, &payload.password).await {
        Ok(Some(user_id)) => {
            info!("User {} authenticated successfully", payload.username);
            
            // Create JWT token using configuration
            match create_jwt(user_id, &payload.username, &app_state.config) {
                Ok(token) => {
                    info!("JWT token created for user: {}", payload.username);
                    Ok(ResponseJson(LoginResponse {
                        success: true,
                        message: "Login successful".to_string(),
                        token: Some(token),
                    }))
                }
                Err(e) => {
                    error!("Failed to create JWT token for user {}: {}", payload.username, e);
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
        Ok(None) => {
            info!("Authentication failed for user: {}", payload.username);
            Ok(ResponseJson(LoginResponse {
                success: false,
                message: "Invalid username or password".to_string(),
                token: None,
            }))
        }
        Err(e) => {
            error!("Database error during authentication: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn change_password_handler(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<ResponseJson<ChangePasswordResponse>, StatusCode> {
    info!("Password change request received for user: {}", user.username());
    
    let user_id = match user.user_id() {
        Ok(id) => id,
        Err(e) => {
            error!("Invalid user ID in token: {}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };
    
    // Get username from JWT token (already authenticated)
    let username = user.username();
    
    // Verify current password
    match authenticate_user(&app_state.db_pool, &username, &payload.current_password).await {
        Ok(Some(_)) => {
            info!("Current password verified for user: {}", username);
            
            // Current password is correct, proceed with password change
            match change_password(&app_state.db_pool, user_id, &payload.new_password).await {
                Ok(()) => {
                    info!("Password changed successfully for user: {}", username);
                    Ok(ResponseJson(ChangePasswordResponse {
                        success: true,
                        message: "Password changed successfully".to_string(),
                    }))
                }
                Err(e) => {
                    error!("Failed to change password for user {}: {}", username, e);
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
        Ok(None) => {
            info!("Current password verification failed for user: {}", username);
            Ok(ResponseJson(ChangePasswordResponse {
                success: false,
                message: "Current password is incorrect".to_string(),
            }))
        }
        Err(e) => {
            error!("Error verifying current password for user {}: {}", username, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
} 