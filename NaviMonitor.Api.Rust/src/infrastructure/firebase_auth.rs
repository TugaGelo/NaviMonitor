//! Verifies Firebase ID tokens against Google's published signing keys.
//!
//! See https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library

use std::time::{Duration, Instant};

use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode, decode_header, jwk::JwkSet};
use serde::Deserialize;
use tokio::sync::RwLock;

use crate::shared_kernel::token_verifier::{
    TokenError, TokenVerifier, VerifiedIdentity, VerifyFuture,
};

const JWKS_URL: &str =
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const DEFAULT_KEY_TTL: Duration = Duration::from_secs(60 * 60);
/// Minimum gap between refetches triggered by an unknown `kid`.
const MIN_REFRESH_GAP: Duration = Duration::from_secs(60);

#[derive(Debug, Deserialize)]
struct FirebaseClaims {
    sub: String,
    email: Option<String>,
    #[serde(default)]
    email_verified: bool,
}

struct CachedKeys {
    keys: JwkSet,
    fetched_at: Instant,
    expires_at: Instant,
}

pub struct FirebaseTokenVerifier {
    http: reqwest::Client,
    validation: Validation,
    cache: RwLock<Option<CachedKeys>>,
}

impl FirebaseTokenVerifier {
    pub fn new(project_id: &str, http: reqwest::Client) -> Self {
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_audience(&[project_id]);
        validation.set_issuer(&[format!("https://securetoken.google.com/{project_id}")]);
        validation.set_required_spec_claims(&["exp", "iat", "aud", "iss", "sub"]);

        Self {
            http,
            validation,
            cache: RwLock::new(None),
        }
    }

    async fn verify_token(&self, token: &str) -> Result<VerifiedIdentity, TokenError> {
        let header = decode_header(token).map_err(|e| TokenError::Invalid(e.to_string()))?;
        if header.alg != Algorithm::RS256 {
            return Err(TokenError::Invalid(format!(
                "unexpected alg {:?}",
                header.alg
            )));
        }
        let kid = header
            .kid
            .ok_or_else(|| TokenError::Invalid("token has no kid".into()))?;

        let key = self.decoding_key(&kid).await?;
        let data = decode::<FirebaseClaims>(token, &key, &self.validation)
            .map_err(|e| TokenError::Invalid(e.to_string()))?;

        if data.claims.sub.is_empty() {
            return Err(TokenError::Invalid("empty sub".into()));
        }

        Ok(VerifiedIdentity {
            uid: data.claims.sub,
            email: data.claims.email,
            email_verified: data.claims.email_verified,
        })
    }

    async fn decoding_key(&self, kid: &str) -> Result<DecodingKey, TokenError> {
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.as_ref() {
                let fresh = Instant::now() < cached.expires_at;
                let recently_fetched = cached.fetched_at.elapsed() < MIN_REFRESH_GAP;
                if let Some(jwk) = cached.keys.find(kid) {
                    if fresh {
                        return DecodingKey::from_jwk(jwk)
                            .map_err(|e| TokenError::Invalid(e.to_string()));
                    }
                } else if fresh && recently_fetched {
                    // Unknown kid and we just refreshed: don't hammer Google.
                    return Err(TokenError::Invalid(format!("unknown kid {kid}")));
                }
            }
        }

        let refreshed = self.fetch_keys().await?;
        let key = refreshed
            .keys
            .find(kid)
            .ok_or_else(|| TokenError::Invalid(format!("unknown kid {kid}")))
            .and_then(|jwk| {
                DecodingKey::from_jwk(jwk).map_err(|e| TokenError::Invalid(e.to_string()))
            });
        *self.cache.write().await = Some(refreshed);
        key
    }

    async fn fetch_keys(&self) -> Result<CachedKeys, TokenError> {
        let unavailable = |e: reqwest::Error| TokenError::KeysUnavailable(e.to_string());
        let response = self
            .http
            .get(JWKS_URL)
            .send()
            .await
            .and_then(reqwest::Response::error_for_status)
            .map_err(unavailable)?;

        let ttl = response
            .headers()
            .get(reqwest::header::CACHE_CONTROL)
            .and_then(|v| v.to_str().ok())
            .and_then(parse_max_age)
            .unwrap_or(DEFAULT_KEY_TTL);

        let keys: JwkSet = response.json().await.map_err(unavailable)?;
        let now = Instant::now();
        Ok(CachedKeys {
            keys,
            fetched_at: now,
            expires_at: now + ttl,
        })
    }
}

impl TokenVerifier for FirebaseTokenVerifier {
    fn verify<'a>(&'a self, token: &'a str) -> VerifyFuture<'a> {
        Box::pin(self.verify_token(token))
    }
}

/// Extracts `max-age` from a Cache-Control header value.
fn parse_max_age(header: &str) -> Option<Duration> {
    header.split(',').find_map(|directive| {
        let (name, value) = directive.trim().split_once('=')?;
        name.eq_ignore_ascii_case("max-age")
            .then(|| value.trim().parse().ok())
            .flatten()
            .map(Duration::from_secs)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_max_age_from_google_style_header() {
        let header = "public, max-age=19302, must-revalidate, no-transform";
        assert_eq!(parse_max_age(header), Some(Duration::from_secs(19302)));
    }

    #[test]
    fn missing_or_bad_max_age_is_none() {
        assert_eq!(parse_max_age("no-cache"), None);
        assert_eq!(parse_max_age("max-age=soon"), None);
    }

    #[tokio::test]
    async fn rejects_garbage_token_without_network() {
        let _ = rustls::crypto::ring::default_provider().install_default();
        let verifier = FirebaseTokenVerifier::new("navi-monitor", reqwest::Client::new());
        let err = verifier.verify("not-a-jwt").await.unwrap_err();
        assert!(matches!(err, TokenError::Invalid(_)));
    }
}
