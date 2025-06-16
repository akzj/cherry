use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use crate::config::AppConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,    // Subject (user_id)
    pub username: String, // Username
    pub exp: usize,     // Expiration time (as UTC timestamp)
    pub iat: usize,     // Issued at (as UTC timestamp)
}

/// Create a JWT token for a user
pub fn create_jwt(user_id: i32, username: &str, config: &AppConfig) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let expiration = now + Duration::hours(config.jwt.expiration_hours);
    
    let claims = Claims {
        sub: user_id.to_string(),
        username: username.to_string(),
        exp: expiration.timestamp() as usize,
        iat: now.timestamp() as usize,
    };
    
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt.secret.as_ref()),
    )
}

/// Verify and decode a JWT token
pub fn verify_jwt(token: &str, config: &AppConfig) -> Result<Claims, jsonwebtoken::errors::Error> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.jwt.secret.as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
}

/// Extract user_id from JWT token
pub fn get_user_id_from_token(token: &str, config: &AppConfig) -> Result<i32, String> {
    match verify_jwt(token, config) {
        Ok(claims) => {
            claims.sub.parse::<i32>()
                .map_err(|_| "Invalid user ID in token".to_string())
        }
        Err(e) => Err(format!("Token verification failed: {}", e)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jwt_creation_and_verification() {
        use crate::config::AppConfig;
        
        let config = AppConfig::default();
        let user_id = 123;
        let username = "testuser";
        
        // Create token
        let token = create_jwt(user_id, username, &config).expect("Failed to create JWT");
        
        // Verify token
        let claims = verify_jwt(&token, &config).expect("Failed to verify JWT");
        
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.username, username);
        
        // Test user_id extraction
        let extracted_id = get_user_id_from_token(&token, &config).expect("Failed to extract user ID");
        assert_eq!(extracted_id, user_id);
    }
} 