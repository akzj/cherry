use anyhow::Result;
use axum::{
    RequestPartsExt,
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
    response::{IntoResponse, Response},
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use std::sync::LazyLock;
use uuid::Uuid;

use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};

use crate::types::ResponseError;

#[derive(Clone)]
pub struct JwtConfig {
    pub secret: String,
    pub expire_time: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub user_id: Uuid, // 用户ID
    pub exp: u64,      // 过期时间
    pub iat: u64,      // 创建时间
}

struct Keys {
    encoding: EncodingKey,
    decoding: DecodingKey,
}

impl Keys {
    fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

static KEYS: LazyLock<Keys> = LazyLock::new(|| {
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    Keys::new(secret.as_bytes())
});

#[derive(Debug)]
pub enum AuthError {
    WrongCredentials,
    MissingCredentials,
    TokenCreation,
    InvalidToken,
}

impl std::fmt::Display for AuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::WrongCredentials => write!(f, "Wrong credentials"),
            AuthError::MissingCredentials => write!(f, "Missing credentials"),
            AuthError::TokenCreation => write!(f, "Token creation error"),
            AuthError::InvalidToken => write!(f, "Invalid token"),
        }
    }
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let status = match self {
            AuthError::WrongCredentials => StatusCode::UNAUTHORIZED,
            AuthError::MissingCredentials => StatusCode::BAD_REQUEST,
            AuthError::TokenCreation => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::InvalidToken => StatusCode::BAD_REQUEST,
        };
        (status, self.to_string()).into_response()
    }
}

impl<S> FromRequestParts<S> for JwtClaims
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Extract the token from the authorization header
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| AuthError::InvalidToken)?;
        // Decode the user data
        let token_data =
            decode::<JwtClaims>(bearer.token(), &KEYS.decoding, &Validation::default())
                .map_err(|_| AuthError::InvalidToken)?;

        Ok(token_data.claims)
    }
}

impl JwtClaims {
    pub fn new(user_id: Uuid, expire_seconds: u64) -> Self {
        Self {
            user_id,
            exp: chrono::Utc::now().timestamp() as u64 + expire_seconds,
            iat: chrono::Utc::now().timestamp() as u64,
        }
    }

    pub fn from_token(token: &str) -> Result<Self, AuthError> {
        let token_data = decode::<JwtClaims>(token, &KEYS.decoding, &Validation::default())
            .map_err(|_| AuthError::InvalidToken)?;
        Ok(token_data.claims)
    }

    pub fn to_token(&self) -> Result<String, AuthError> {
        let token = encode::<JwtClaims>(&Header::default(), self, &KEYS.encoding)
            .map_err(|_| AuthError::TokenCreation)?;
        Ok(token)
    }
}

impl From<AuthError> for ResponseError {
    fn from(error: AuthError) -> Self {
        Self::AuthError(error)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use axum::http::{HeaderMap, HeaderValue};
    use axum_extra::headers::authorization::Bearer;

    fn setup_test_env() {
        unsafe {
            env::set_var("JWT_SECRET", "test_secret_key_for_testing");
        }
    }

    #[test]
    fn test_jwt_config() {
        let config = JwtConfig {
            secret: "test_secret".to_string(),
            expire_time: 3600,
        };
        assert_eq!(config.secret, "test_secret");
        assert_eq!(config.expire_time, 3600);
    }

    #[test]
    fn test_jwt_claims_new() {
        let user_id = Uuid::new_v4();
        let expire_time = 3600;
        let claims = JwtClaims::new(user_id, expire_time);
        
        assert_eq!(claims.user_id, user_id);
        assert!(claims.exp > claims.iat);
        assert_eq!(claims.exp - claims.iat, expire_time);
    }

    #[test]
    fn test_jwt_claims_to_token_and_from_token() {
        setup_test_env();
        
        let user_id = Uuid::new_v4();
        let claims = JwtClaims::new(user_id, 3600);
        
        // Test token creation
        let token = claims.to_token().unwrap();
        assert!(!token.is_empty());
        
        // Test token parsing
        let parsed_claims = JwtClaims::from_token(&token).unwrap();
        assert_eq!(parsed_claims.user_id, user_id);
        assert_eq!(parsed_claims.exp, claims.exp);
        assert_eq!(parsed_claims.iat, claims.iat);
    }

    #[test]
    fn test_jwt_claims_from_invalid_token() {
        setup_test_env();
        
        let result = JwtClaims::from_token("invalid_token");
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AuthError::InvalidToken));
    }

    #[test]
    fn test_auth_error_display() {
        assert_eq!(AuthError::WrongCredentials.to_string(), "Wrong credentials");
        assert_eq!(AuthError::MissingCredentials.to_string(), "Missing credentials");
        assert_eq!(AuthError::TokenCreation.to_string(), "Token creation error");
        assert_eq!(AuthError::InvalidToken.to_string(), "Invalid token");
    }

    #[test]
    fn test_auth_error_into_response() {
        use axum::response::IntoResponse;
        
        let response = AuthError::WrongCredentials.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
        
        let response = AuthError::MissingCredentials.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_REQUEST);
        
        let response = AuthError::TokenCreation.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        
        let response = AuthError::InvalidToken.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_REQUEST);
    }

    #[test]
    fn test_auth_error_debug() {
        let error = AuthError::InvalidToken;
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("InvalidToken"));
    }

    #[test]
    fn test_keys_new() {
        let secret = b"test_secret";
        let keys = Keys::new(secret);
        // We can't directly test the keys, but we can test that they work together
        let test_claims = JwtClaims {
            user_id: Uuid::new_v4(),
            exp: chrono::Utc::now().timestamp() as u64 + 3600,
            iat: chrono::Utc::now().timestamp() as u64,
        };
        
        let token = encode(&Header::default(), &test_claims, &keys.encoding).unwrap();
        let decoded = decode::<JwtClaims>(&token, &keys.decoding, &Validation::default()).unwrap();
        assert_eq!(decoded.claims.user_id, test_claims.user_id);
    }

    #[test]
    fn test_jwt_claims_serialization() {
        let user_id = Uuid::new_v4();
        let claims = JwtClaims {
            user_id,
            exp: 1234567890,
            iat: 1234567800,
        };
        
        let json = serde_json::to_string(&claims).unwrap();
        let deserialized: JwtClaims = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.user_id, user_id);
        assert_eq!(deserialized.exp, 1234567890);
        assert_eq!(deserialized.iat, 1234567800);
    }

    #[test]
    fn test_jwt_claims_debug() {
        let user_id = Uuid::new_v4();
        let claims = JwtClaims {
            user_id,
            exp: 1234567890,
            iat: 1234567800,
        };
        
        let debug_str = format!("{:?}", claims);
        assert!(debug_str.contains("user_id"));
        assert!(debug_str.contains("exp"));
        assert!(debug_str.contains("iat"));
    }

    // Note: Testing FromRequestParts requires complex setup with axum internals
    // These tests would be better suited for integration tests

    #[test]
    fn test_auth_error_from_to_response_error() {
        let auth_error = AuthError::InvalidToken;
        let response_error: ResponseError = auth_error.into();
        
        match response_error {
            ResponseError::AuthError(AuthError::InvalidToken) => {},
            _ => panic!("Expected AuthError::InvalidToken"),
        }
    }
}
