use std::{sync::Arc, time::Duration};

use anyhow::Context;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::EnvFilter;

use navimonitor_api::{
    app_state::AppState,
    config::Config,
    infrastructure::{firebase_auth::FirebaseTokenVerifier, gemini::GeminiAnalyzer},
    router::build_router,
    shared_kernel::manual_analyzer::ManualAnalyzer,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let _ = dotenvy::dotenv();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "navimonitor_api=info,tower_http=info".into()),
        )
        .init();

    // reqwest is built without a bundled crypto provider; use ring (same as sqlx).
    rustls::crypto::ring::default_provider()
        .install_default()
        .map_err(|_| anyhow::anyhow!("a rustls crypto provider was already installed"))?;

    let config = Config::from_env()?;
    if config.allowed_emails.is_empty() {
        tracing::warn!("ALLOWED_EMAILS is empty: every request will get 403");
    }

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(10))
        .connect(&config.database_url)
        .await
        .context("connecting to Postgres")?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .context("running migrations")?;

    let http = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;
    let verifier = FirebaseTokenVerifier::new(&config.firebase_project_id, http);

    let manual_analyzer = match &config.gemini_api_key {
        Some(key) => {
            // Several manual pages can take Gemini well over the default 30 s.
            let http = reqwest::Client::builder()
                .timeout(Duration::from_secs(120))
                .build()?;
            Some(Arc::new(GeminiAnalyzer::new(http, key.clone())) as Arc<dyn ManualAnalyzer>)
        }
        None => {
            tracing::warn!("GEMINI_API_KEY is not set: /api/maintenance/analyze will answer 503");
            None
        }
    };

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], config.port));
    let state = AppState {
        pool,
        config: Arc::new(config),
        token_verifier: Arc::new(verifier),
        manual_analyzer,
    };

    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!(%addr, "NaviMonitor API listening");
    axum::serve(listener, build_router(state))
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        let _ = tokio::signal::ctrl_c().await;
    };
    #[cfg(unix)]
    let terminate = async {
        if let Ok(mut sig) =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        {
            sig.recv().await;
        }
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {},
        () = terminate => {},
    }
}
