use axum::{
    extract::State,
    http::StatusCode,
    response::Json as ResponseJson,
};
use log::{error, info};

use crate::db::{get_user_groups, AppState};
use crate::api::types::GroupListResponse;
use crate::auth::AuthenticatedUser;

pub async fn get_group_list(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<ResponseJson<GroupListResponse>, StatusCode> {
    info!("Fetching group list for user: {}", user.username());
    
    let user_id = match user.user_id() {
        Ok(id) => id,
        Err(e) => {
            error!("Invalid user ID in token: {}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };
    
    match get_user_groups(&app_state.db_pool, user_id).await {
        Ok(groups) => Ok(ResponseJson(GroupListResponse {
            success: true,
            groups,
        })),
        Err(e) => {
            error!("Database error fetching groups: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
} 