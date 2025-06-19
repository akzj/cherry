use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginReq {
    #[serde(rename = "type")]
    pub type_: String, // username_password, github_oauth
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResp {
    pub jwt_token: String,
}
