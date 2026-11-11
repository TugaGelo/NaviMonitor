//! Shared test helpers: a fake token verifier and a request helper.

use std::sync::Arc;

use axum::{
    Router,
    body::{Body, to_bytes},
    http::{Method, Request, StatusCode, header},
};
use serde_json::Value;
use sqlx::PgPool;
use tower::ServiceExt;

use crate::{
    app_state::AppState,
    config::Config,
    router::build_router,
    shared_kernel::token_verifier::{TokenError, TokenVerifier, VerifiedIdentity, VerifyFuture},
};

/// Allowlisted test users. Pass as the `token` argument of [`TestApp::call`].
pub const ME: Option<&str> = Some("good:me@gmail.com");
pub const OTHER: Option<&str> = Some("good:friend@gmail.com");

/// Accepts the token "good:<email>" (uid = "uid-<email>") and rejects anything else.
pub struct FakeVerifier;

impl TokenVerifier for FakeVerifier {
    fn verify<'a>(&'a self, token: &'a str) -> VerifyFuture<'a> {
        Box::pin(async move {
            let email = token
                .strip_prefix("good:")
                .ok_or_else(|| TokenError::Invalid("bad".into()))?;
            Ok(VerifiedIdentity {
                uid: format!("uid-{email}"),
                email: Some(email.into()),
                email_verified: true,
            })
        })
    }
}

pub struct TestApp(Router);

impl TestApp {
    pub fn new(pool: PgPool) -> Self {
        let config = Config::from_lookup(|key| match key {
            "DATABASE_URL" => Some("postgres://unused@localhost/unused".into()),
            "FIREBASE_PROJECT_ID" => Some("test".into()),
            "ALLOWED_EMAILS" => Some("me@gmail.com,friend@gmail.com".into()),
            _ => None,
        })
        .unwrap();
        Self(build_router(AppState {
            pool,
            config: Arc::new(config),
            token_verifier: Arc::new(FakeVerifier),
        }))
    }

    /// A pool that never connects, for tests that don't touch the database.
    pub fn without_db() -> Self {
        Self::new(PgPool::connect_lazy("postgres://unused@localhost/unused").unwrap())
    }

    /// `token` is sent as a bearer token. Returns the status and JSON body (Null if empty).
    pub async fn call(
        &self,
        method: Method,
        uri: &str,
        token: Option<&str>,
        body: Option<Value>,
    ) -> (StatusCode, Value) {
        let mut req = Request::builder().method(method).uri(uri);
        if let Some(token) = token {
            req = req.header(header::AUTHORIZATION, format!("Bearer {token}"));
        }
        let req = match body {
            Some(json) => req
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(json.to_string())),
            None => req.body(Body::empty()),
        }
        .unwrap();

        let res = self.0.clone().oneshot(req).await.unwrap();
        let status = res.status();
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let json = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
        (status, json)
    }
}
