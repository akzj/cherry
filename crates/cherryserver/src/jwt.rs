use anyhow::Result;
use cherrycore::types::JwtClaims;
use jsonwebtoken::Header;

#[derive(Clone)]
pub(crate) struct JwtConfig {
    pub(crate) secret: String,
    pub(crate) expire_time: u64,
}

#[derive(Clone)]
pub(crate) struct Jwt {
    config: JwtConfig,
}

impl Jwt {
    pub(crate) fn new(config: JwtConfig) -> Self {
        Self { config }
    }

    pub(crate) fn generate_token(&self, claims: JwtClaims) -> Result<String> {
        let claims = {
            let now = chrono::Utc::now().timestamp() as u64;
            if claims.exp > now {
                claims
            } else {
                JwtClaims {
                    exp: now + self.config.expire_time,
                    iat: now,
                    user_id: claims.user_id,
                }
            }
        };
        let token = jsonwebtoken::encode(
            &Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(self.config.secret.as_bytes()),
        )?;
        Ok(token)
    }

    pub(crate) fn verify_token(&self, token: &str) -> Result<JwtClaims> {
        let token = jsonwebtoken::decode::<JwtClaims>(
            token,
            &jsonwebtoken::DecodingKey::from_secret(self.config.secret.as_bytes()),
            &jsonwebtoken::Validation::default(),
        )?;

        if token.claims.exp < chrono::Utc::now().timestamp() as u64 {
            return Err(anyhow::anyhow!("Token expired"));
        }

        Ok(token.claims)
    }
}
