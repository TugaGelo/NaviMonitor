use sqlx::PgPool;

use super::{
    settings_repo,
    user_settings::{SettingsInput, UserSettings},
};
use crate::shared_kernel::current_user::CurrentUser;

#[derive(Debug, thiserror::Error)]
pub enum SettingsError {
    #[error("You can only change your own settings.")]
    NotYours,
    #[error("{0}")]
    Invalid(String),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

/// Returns the user's settings, creating the defaults on first use.
pub async fn get(pool: &PgPool, user: &CurrentUser) -> Result<UserSettings, SettingsError> {
    settings_repo::ensure_exists(pool, &user.uid).await?;
    Ok(settings_repo::find(pool, &user.uid).await?)
}

pub async fn update(
    pool: &PgPool,
    user: &CurrentUser,
    input: SettingsInput,
) -> Result<UserSettings, SettingsError> {
    // The .NET API returned 403 when the body named another user; keep that.
    if input.user_id.as_deref().is_some_and(|id| id != user.uid) {
        return Err(SettingsError::NotYours);
    }
    let patch = input.validate().map_err(SettingsError::Invalid)?;
    settings_repo::ensure_exists(pool, &user.uid).await?;
    Ok(settings_repo::update(pool, &user.uid, &patch).await?)
}
