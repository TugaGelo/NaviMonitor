use axum::{
    Router,
    http::{HeaderValue, Method, header},
    routing::get,
};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::{api::health_api, app_state::AppState};

pub fn build_router(state: AppState) -> Router {
    let cors = cors_layer(&state.config.cors_origins);

    Router::new()
        .route("/health", get(health_api::health))
        .route("/api/me", get(health_api::me))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state)
}

/// Only the listed browser origins may call the API. Native apps send no
/// Origin header, so CORS doesn't affect them.
fn cors_layer(origins: &[String]) -> CorsLayer {
    let origins: Vec<HeaderValue> = origins
        .iter()
        .filter_map(|o| match o.parse() {
            Ok(v) => Some(v),
            Err(_) => {
                tracing::warn!(origin = %o, "ignoring invalid CORS origin");
                None
            }
        })
        .collect();

    CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use axum::{
        body::{Body, to_bytes},
        http::{Request, StatusCode},
    };
    use sqlx::postgres::PgPoolOptions;
    use tower::ServiceExt;

    use super::*;
    use crate::{
        config::Config,
        shared_kernel::token_verifier::{
            TokenError, TokenVerifier, VerifiedIdentity, VerifyFuture,
        },
    };

    /// Accepts the token "good:<email>" and rejects anything else.
    struct FakeVerifier;

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

    fn app() -> Router {
        let config = Config::from_lookup(|key| match key {
            "DATABASE_URL" => Some("postgres://unused@localhost/unused".into()),
            "FIREBASE_PROJECT_ID" => Some("test".into()),
            "ALLOWED_EMAILS" => Some("me@gmail.com".into()),
            _ => None,
        })
        .unwrap();
        // Lazy pool: these tests never touch the database.
        let pool = PgPoolOptions::new()
            .connect_lazy(&config.database_url)
            .unwrap();
        build_router(AppState {
            pool,
            config: Arc::new(config),
            token_verifier: Arc::new(FakeVerifier),
        })
    }

    async fn get_me(auth: Option<&str>) -> (StatusCode, String) {
        let mut req = Request::get("/api/me");
        if let Some(auth) = auth {
            req = req.header(header::AUTHORIZATION, auth);
        }
        let res = app()
            .oneshot(req.body(Body::empty()).unwrap())
            .await
            .unwrap();
        let status = res.status();
        let body = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        (status, String::from_utf8(body.to_vec()).unwrap())
    }

    #[tokio::test]
    async fn missing_token_is_401() {
        assert_eq!(get_me(None).await.0, StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn non_bearer_scheme_is_401() {
        assert_eq!(get_me(Some("Basic abc")).await.0, StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn invalid_token_is_401() {
        assert_eq!(
            get_me(Some("Bearer nope")).await.0,
            StatusCode::UNAUTHORIZED
        );
    }

    #[tokio::test]
    async fn valid_token_not_on_allowlist_is_403() {
        let (status, _) = get_me(Some("Bearer good:stranger@gmail.com")).await;
        assert_eq!(status, StatusCode::FORBIDDEN);
    }

    #[tokio::test]
    async fn allowlisted_user_gets_their_identity() {
        let (status, body) = get_me(Some("Bearer good:me@gmail.com")).await;
        assert_eq!(status, StatusCode::OK);
        let json: serde_json::Value = serde_json::from_str(&body).unwrap();
        assert_eq!(json["userId"], "uid-me@gmail.com");
        assert_eq!(json["email"], "me@gmail.com");
    }
}
