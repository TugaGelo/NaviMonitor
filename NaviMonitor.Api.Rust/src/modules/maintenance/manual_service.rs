//! Reads a maintenance schedule out of manual photos, within the daily limit.

use serde_json::Value;
use sqlx::PgPool;

use super::{manual_policy, manual_usage_repo};
use crate::shared_kernel::{
    current_user::CurrentUser,
    manual_analyzer::{ManualAnalyzer, ManualImage},
};

#[derive(Debug, thiserror::Error)]
pub enum ManualError {
    #[error("{0}")]
    Invalid(String),
    #[error("Manual analysis isn't set up on this server.")]
    NotConfigured,
    #[error(
        "You've used all {} manual analyses for today. Try again tomorrow.",
        manual_policy::DAILY_LIMIT
    )]
    LimitReached,
    #[error("The AI couldn't read these pages. Try again with clearer photos.")]
    Failed(#[source] anyhow::Error),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

pub async fn analyze(
    pool: &PgPool,
    analyzer: Option<&dyn ManualAnalyzer>,
    user: &CurrentUser,
    images: &[ManualImage],
) -> Result<Value, ManualError> {
    manual_policy::check_images(images).map_err(ManualError::Invalid)?;
    let analyzer = analyzer.ok_or(ManualError::NotConfigured)?;

    if !manual_usage_repo::try_take(pool, &user.uid, manual_policy::DAILY_LIMIT).await? {
        return Err(ManualError::LimitReached);
    }
    match analyzer.analyze(images).await {
        Ok(matrix) => Ok(matrix),
        Err(e) => {
            manual_usage_repo::give_back(pool, &user.uid).await?;
            Err(ManualError::Failed(e))
        }
    }
}
