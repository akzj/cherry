use std::sync::Arc;
use std::time::Duration;

use anyhow::{Context, Result};
use reqwest::{
    Client, ClientBuilder,
    header::{AUTHORIZATION, CONTENT_TYPE, HeaderMap, HeaderValue},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::types::{
    Contact, Conversation, ListStreamRequest, ListStreamResponse, LoginRequest, LoginResponse,
    ResponseError, User,
};

/// Configuration for the Cherry client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CherryClientConfig {
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

impl Default for CherryClientConfig {
    fn default() -> Self {
        Self {
            base_url: "http://localhost:8180".to_string(),
            timeout: Duration::from_secs(30),
            max_idle_per_host: 10,
            pool_idle_timeout: Duration::from_secs(90),
            user_agent: "CherryClient/1.0".to_string(),
        }
    }
}

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

/// Professional Cherry client implementation
#[derive(Clone)]
pub struct CherryClient {
    inner: Arc<CherryClientInner>,
}

#[derive(Clone)]
pub struct CherryClientInner {
    config: CherryClientConfig,
    client: Client,
    auth: Option<AuthCredentials>,
}

impl std::ops::Deref for CherryClient {
    type Target = CherryClientInner;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl CherryClient {
    /// Create a new client with default configuration
    pub fn new() -> Result<Self> {
        Self::with_config(CherryClientConfig::default())
    }

    /// Create a new client with custom configuration
    pub fn with_config(config: CherryClientConfig) -> Result<Self> {
        let client = ClientBuilder::new()
            .timeout(config.timeout)
            .pool_idle_timeout(config.pool_idle_timeout)
            .pool_max_idle_per_host(config.max_idle_per_host)
            .user_agent(config.user_agent.clone())
            .no_proxy()
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self {
            inner: Arc::new(CherryClientInner {
                config,
                client,
                auth: None,
            }),
        })
    }

    /// Set authentication credentials
    pub fn with_auth(self, auth: AuthCredentials) -> Self {
        let inner = CherryClientInner {
            auth: Some(auth),
            client: self.inner.client.clone(),
            config: self.inner.config.clone(),
        };
        Self {
            inner: Arc::new(inner),
        }
    }

    /// Create authenticated headers
    fn create_headers(&self) -> Result<HeaderMap> {
        let mut headers = HeaderMap::new();

        // Set content type
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

        // Set authorization if available
        if let Some(auth) = &self.auth {
            let auth_value = HeaderValue::from_str(&format!("Bearer {}", auth.jwt_token))
                .context("Invalid JWT token format")?;
            headers.insert(AUTHORIZATION, auth_value);
        }

        Ok(headers)
    }

    /// Make an authenticated request
    async fn request<T>(&self, method: reqwest::Method, endpoint: &str) -> Result<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.config.base_url, endpoint);
        let headers = self.create_headers()?;

        log::info!("request: url={}, headers={:?}", url, headers); 

        let response = self
            .client
            .request(method, &url)
            .headers(headers)
            .send()
            .await
            .context("Request failed")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        response
            .json::<T>()
            .await
            .context("Failed to deserialize response")
    }

    /// Make a POST request with JSON body
    async fn request_with_body<T, U>(
        &self,
        method: reqwest::Method,
        endpoint: &str,
        body: &T,
    ) -> Result<U>
    where
        T: Serialize,
        U: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.config.base_url, endpoint);
        let headers = self.create_headers()?;

        log::info!("request: url={}, headers={:?}", url, headers); 

        let response = self
            .client
            .request(method, &url)
            .headers(headers)
            .json(body)
            .send()
            .await
            .context("Request failed")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        response
            .json::<U>()
            .await
            .context("Failed to deserialize response")
    }

    /// Login and get authentication credentials
    pub async fn login(&self, email: &str, password: &str) -> Result<LoginResponse> {
        let login_request = LoginRequest {
            email: Some(email.to_string()),
            password: Some(password.to_string()),
            type_: "email".to_string(),
        };

        let login_response = self
            .request_with_body::<LoginRequest, LoginResponse>(
                reqwest::Method::POST,
                "/api/v1/auth/login",
                &login_request,
            )
            .await?;

        Ok(login_response)
    }

    /// Get all contacts for the authenticated user
    pub async fn get_contacts(&self) -> Result<Vec<Contact>> {
        self.request::<Vec<Contact>>(reqwest::Method::GET, "/api/v1/contract/list")
            .await
    }

    /// Get user by ID
    pub async fn get_user(&self, user_id: Uuid) -> Result<User> {
        self.request::<User>(reqwest::Method::GET, &format!("/api/v1/users/{}", user_id))
            .await
    }

    /// Get all conversations for the authenticated user
    pub async fn get_conversations(&self) -> Result<Vec<Conversation>> {
        self.request::<Vec<Conversation>>(reqwest::Method::GET, "/api/v1/conversations/list")
            .await
    }

    /// Get all streams for a user
    pub async fn get_streams(&self, user_id: Uuid) -> Result<ListStreamResponse> {
        let request = ListStreamRequest { user_id };

        let url = format!("{}/api/v1/streams/list", self.config.base_url);
        let headers = self.create_headers()?;

        let response = self
            .client
            .get(&url)
            .headers(headers)
            .query(&request)
            .send()
            .await
            .context("Failed to get streams")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        response
            .json::<ListStreamResponse>()
            .await
            .context("Failed to deserialize streams response")
    }
}

/// Builder pattern for creating CherryClient instances
pub struct CherryClientBuilder {
    config: CherryClientConfig,
    auth: Option<AuthCredentials>,
}

impl CherryClientBuilder {
    pub fn new() -> Self {
        Self {
            config: CherryClientConfig::default(),
            auth: None,
        }
    }

    pub fn with_base_url(mut self, base_url: String) -> Self {
        self.config.base_url = base_url;
        self
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.config.timeout = timeout;
        self
    }

    pub fn with_auth(mut self, auth: AuthCredentials) -> Self {
        self.auth = Some(auth);
        self
    }

    pub fn with_user_agent(mut self, user_agent: String) -> Self {
        self.config.user_agent = user_agent;
        self
    }

    pub fn build(self) -> Result<CherryClient> {
        let mut client = CherryClient::with_config(self.config)?;
        if let Some(auth) = self.auth {
            client = client.with_auth(auth);
        }
        Ok(client)
    }
}

impl Default for CherryClientBuilder {
    fn default() -> Self {
        Self::new()
    }
}
