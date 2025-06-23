use std::time;
use anyhow::Result;
use cherrycore::types;
use crate::StreamServer;


pub struct AclChecker<'a> {
    user_id: uuid::Uuid,
    stream_id: u64,
    server: &'a StreamServer,
    check_ts: time::Instant,
}

impl<'a> AclChecker<'a> {
    pub fn new(user_id: uuid::Uuid, stream_id: u64, server: &'a StreamServer) -> Self {
        Self {
            user_id,
            stream_id,
            server,
            check_ts: time::Instant::now()
                .checked_sub(time::Duration::from_secs(5))
                .unwrap(),
        }
    }

    pub async fn check_acl(&mut self) -> Result<bool> {
        if self.check_ts < time::Instant::now() {
            let allowed = self.check_acl_from_cherry_server().await?;
            self.check_ts = time::Instant::now() + time::Duration::from_secs(5);
            Ok(allowed)
        } else {
            Ok(true)
        }
    }

    pub async fn check_acl_from_cherry_server(&self) -> Result<bool> {
        let url = format!("{}/api/v1/acl/check", self.server.config.cherry_server_url);
        let client = reqwest::Client::new();
        let response = client
            .get(url)
            .query(&[("user_id", self.user_id.to_string()), ("stream_id", self.stream_id.to_string())])
            .send()
            .await?;
        let body = response.text().await?;
        let response: types::CheckAclResponse = serde_json::from_str(&body)?;
        Ok(response.allowed)
    }
}

