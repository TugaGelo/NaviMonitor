use std::sync::Arc;

use sqlx::PgPool;

use crate::{config::Config, shared_kernel::token_verifier::TokenVerifier};

/// Shared by every request. Cloning is cheap (pool and Arcs).
#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Arc<Config>,
    pub token_verifier: Arc<dyn TokenVerifier>,
}
