//! Turns a request's bearer token into a [`CurrentUser`].

pub mod allowlist_policy;

use axum::{extract::FromRequestParts, http::request::Parts};

use crate::{
    api::error::ApiError, app_state::AppState, shared_kernel::current_user::CurrentUser,
    shared_kernel::token_verifier::TokenError,
};
use allowlist_policy::{AllowlistDecision, check_allowlist};

impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, ApiError> {
        let token = bearer_token(parts).ok_or(ApiError::Unauthorized)?;

        let identity = state
            .token_verifier
            .verify(token)
            .await
            .map_err(|e| match e {
                TokenError::Invalid(reason) => {
                    tracing::debug!(%reason, "rejected id token");
                    ApiError::Unauthorized
                }
                TokenError::KeysUnavailable(reason) => {
                    ApiError::Internal(anyhow::anyhow!("firebase keys unavailable: {reason}"))
                }
            })?;

        match check_allowlist(&identity, &state.config.allowed_emails) {
            AllowlistDecision::Allowed { email } => Ok(CurrentUser {
                uid: identity.uid,
                email,
            }),
            AllowlistDecision::Denied => {
                tracing::info!(uid = %identity.uid, email = ?identity.email, "not on allowlist");
                Err(ApiError::Forbidden(
                    "You are not allowed to use this app.".into(),
                ))
            }
        }
    }
}

fn bearer_token(parts: &Parts) -> Option<&str> {
    let value = parts
        .headers
        .get(axum::http::header::AUTHORIZATION)?
        .to_str()
        .ok()?;
    let (scheme, token) = value.split_once(' ')?;
    let token = token.trim();
    (scheme.eq_ignore_ascii_case("bearer") && !token.is_empty()).then_some(token)
}
