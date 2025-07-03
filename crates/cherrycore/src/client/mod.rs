pub mod cherry;
pub mod stream;
pub mod file;

use std::time::Duration;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Authentication credentials
#[derive(Debug, Clone)]
pub struct AuthCredentials {
    pub user_id: Uuid,
    pub jwt_token: String,
}

impl AuthCredentials {
    pub fn new(user_id: Uuid, jwt_token: String) -> Self {
        Self { user_id, jwt_token }
    }
}

impl From<(&Uuid, &String)> for AuthCredentials {
    fn from((user_id, jwt_token): (&Uuid, &String)) -> Self {
        Self {
            user_id: user_id.clone(),
            jwt_token: jwt_token.clone(),
        }
    }
}


/// Configuration for the Cherry client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientConfig {
    /// Base URL of the Cherry server
    pub base_url: String,
    /// Default timeout for requests
    pub timeout: Duration,
    /// Maximum idle connections per host
    pub max_idle_per_host: usize,
    /// Connection pool timeout
    pub pool_idle_timeout: Duration,
    /// User agent string
    pub user_agent: String,
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self::default_cherry()
    }
}

impl From<&str> for ClientConfig {
    fn from(value: &str) -> Self {
        Self {
            base_url: value.to_string(),
            ..Default::default()
        }
    }
}

impl From<&String> for ClientConfig {
    fn from(value: &String) -> Self {
        value.as_str().into()
    }
}

impl ClientConfig {
    pub fn default_cherry() -> Self {
        Self {
            max_idle_per_host: 10,
            base_url: "http://localhost:8180".to_string(),
            timeout: Duration::from_secs(30),
            pool_idle_timeout: Duration::from_secs(90),
            user_agent: "CherryClient/1.0".to_string(),
        }
    }

    pub fn default_stream() -> Self {
        Self {
            max_idle_per_host: 10,
            base_url: "http://localhost:8080".to_string(),
            timeout: Duration::from_secs(30),
            pool_idle_timeout: Duration::from_secs(90),
            user_agent: "StreamClient/1.0".to_string(),
        }
    }

    pub fn default_file() -> Self {
        Self {
            max_idle_per_host: 10,
            base_url: "http://localhost:8280".to_string(),
            timeout: Duration::from_secs(30),
            pool_idle_timeout: Duration::from_secs(90),
            user_agent: "FileClient/1.0".to_string(),
        }
    }
}
