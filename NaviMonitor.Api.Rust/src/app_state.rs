use std::sync::Arc;

use sqlx::PgPool;

use crate::{
    config::Config,
    shared_kernel::{manual_analyzer::ManualAnalyzer, token_verifier::TokenVerifier},
};

/// Shared by every request. Cloning is cheap (pool and Arcs).
#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Arc<Config>,
    pub token_verifier: Arc<dyn TokenVerifier>,
    /// None when GEMINI_API_KEY isn't set; `/analyze` then answers 503.
    pub manual_analyzer: Option<Arc<dyn ManualAnalyzer>>,
}
