use axum::{
    extract::State,
    http::StatusCode,
    response::Json as ResponseJson,
};
use log::{error, info};

use crate::db::{get_user_friends, AppState};
use crate::api::types::FriendListResponse;
use crate::auth::AuthenticatedUser;

pub async fn get_friend_list(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<ResponseJson<FriendListResponse>, StatusCode> {
    info!("Fetching friend list for user: {}", user.username());
    
    let user_id = match user.user_id() {
        Ok(id) => id,
        Err(e) => {
            error!("Invalid user ID in token: {}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };
    
    match get_user_friends(&app_state.db_pool, user_id).await {
        Ok(friends) => Ok(ResponseJson(FriendListResponse {
            success: true,
            friends,
        })),
        Err(e) => {
            error!("Database error fetching friends: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
} 