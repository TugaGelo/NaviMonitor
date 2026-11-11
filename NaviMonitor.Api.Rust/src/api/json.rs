use axum::{extract::FromRequest, extract::rejection::JsonRejection};

use super::error::ApiError;

/// `axum::Json`, but a bad body becomes our `{"message": ...}` 400 instead of axum's plain-text 422.
#[derive(FromRequest)]
#[from_request(via(axum::Json), rejection(ApiError))]
pub struct AppJson<T>(pub T);

impl From<JsonRejection> for ApiError {
    fn from(rejection: JsonRejection) -> Self {
        Self::BadRequest(rejection.body_text())
    }
}
