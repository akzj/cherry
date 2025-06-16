use axum::{
    middleware::{self},
    routing::{get, post},
    Router,
};

use crate::db::AppState;
use crate::api::{login, change_password_handler, get_friend_list, get_group_list};
use crate::auth::jwt_auth;

pub fn create_api_routes() -> Router<AppState> {
    // Public routes (no authentication required)
    let public_routes = Router::new()
        .route("/api/v1/login", post(login));

    // Protected routes (JWT authentication required)  
    let protected_routes = Router::new()
        .route("/api/v1/change-password", post(change_password_handler))
        .route("/api/v1/friend/list", get(get_friend_list))
        .route("/api/v1/group/list", get(get_group_list))
        .layer(middleware::from_fn(jwt_auth));

    // Combine routes
    public_routes.merge(protected_routes)
} 