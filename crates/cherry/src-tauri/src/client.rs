use std::time::Duration;

use anyhow::Result;
use reqwest::header::HeaderMap;
use reqwest::header::HeaderValue;
use serde::{Deserialize, Serialize};

use crate::{db::models::*, types::*, CherryClient, Options};

struct CherryClientImpl {
    options: CherryClientOptions,
    client: reqwest::Client,
    base_headers: HeaderMap,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CherryClientOptions {
    cherry_server: String,
    user_id: u64,
    jwt_token: String,
}

impl CherryClient for CherryClientImpl {
    async fn new(options: CherryClientOptions) -> Self {
        let mut headers = HeaderMap::new();
        headers.insert(
            "Authorization",
            HeaderValue::from_str(&format!("Bearer {}", options.jwt_token)).unwrap(),
        );
        Self {
            options,
            client: reqwest::Client::builder()
                .pool_idle_timeout(Duration::from_secs(10))
                .pool_max_idle_per_host(3)
                .connect_timeout(Duration::from_secs(10))
                .connection_verbose(true)
                .build()
                .unwrap(),
            base_headers: headers,
        }
    }

    async fn contact_list_all(&self) -> Result<Vec<Contact>> {
        let url = format!("{}/api/v1/contacts", self.options.cherry_server);

        let resp = self
            .client
            .get(url)
            .headers(self.base_headers.clone())
            .send()
            .await?;
        let body = resp.json::<Vec<Contact>>().await?;
        Ok(body)
    }

    async fn user_get_by_id(&self, id: u64) -> Result<User> {
        let url = format!("{}/api/v1/users/{}", self.options.cherry_server, id);
        let resp = self
            .client
            .get(url)
            .headers(self.base_headers.clone())
            .send()
            .await?;
        let body = resp.json::<User>().await?;
        Ok(body)
    }

    async fn conversation_list_all(&self) -> Result<Vec<Conversation>> {
        let url = format!("{}/api/v1/conversations", self.options.cherry_server);
        let resp = self
            .client
            .get(url)
            .headers(self.base_headers.clone())
            .send()
            .await?;
        let body = resp.json::<Vec<Conversation>>().await?;
        Ok(body)
    }

    async fn login_request(server_url: String, req: LoginReq) -> Result<LoginResp> {
        let url = format!("{}/api/v1/login", server_url);
        let resp = reqwest::Client::new().post(url).json(&req).send().await?;
        let body = resp.json::<LoginResp>().await?;
        Ok(body)
    }
}
