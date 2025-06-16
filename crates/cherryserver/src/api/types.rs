use serde::{Deserialize, Serialize};
use crate::db::{Friend, Group};

// Login API types
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub success: bool,
    pub message: String,
    pub token: Option<String>,
}

// Friend API types
#[derive(Debug, Serialize)]
pub struct FriendListResponse {
    pub success: bool,
    pub friends: Vec<Friend>,
}

// Group API types
#[derive(Debug, Serialize)]
pub struct GroupListResponse {
    pub success: bool,
    pub groups: Vec<Group>,
}

// Change Password API types
#[derive(Debug, Serialize, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Serialize)]
pub struct ChangePasswordResponse {
    pub success: bool,
    pub message: String,
} 