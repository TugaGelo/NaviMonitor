use std::{future::Future, pin::Pin};

/// Identity claims taken from a verified ID token.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VerifiedIdentity {
    pub uid: String,
    pub email: Option<String>,
    pub email_verified: bool,
}

#[derive(Debug, thiserror::Error)]
pub enum TokenError {
    #[error("token is malformed or its signature/claims are invalid: {0}")]
    Invalid(String),
    #[error("could not fetch signing keys: {0}")]
    KeysUnavailable(String),
}

pub type VerifyFuture<'a> =
    Pin<Box<dyn Future<Output = Result<VerifiedIdentity, TokenError>> + Send + 'a>>;

/// Checks an ID token. Firebase implements it in production; tests use a fake.
pub trait TokenVerifier: Send + Sync {
    fn verify<'a>(&'a self, token: &'a str) -> VerifyFuture<'a>;
}
