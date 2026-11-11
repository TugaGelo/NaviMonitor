use sqlx::PgPool;

use super::user_settings::{SettingsPatch, UserSettings};

/// Inserts the default row if the user has none yet. Safe to call concurrently.
pub async fn ensure_exists(pool: &PgPool, user_id: &str) -> sqlx::Result<()> {
    sqlx::query("INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING")
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn find(pool: &PgPool, user_id: &str) -> sqlx::Result<UserSettings> {
    sqlx::query_as("SELECT * FROM user_settings WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await
}

pub async fn update(pool: &PgPool, user_id: &str, p: &SettingsPatch) -> sqlx::Result<UserSettings> {
    sqlx::query_as(
        "UPDATE user_settings SET
             distance_unit = COALESCE($2, distance_unit),
             volume_unit = COALESCE($3, volume_unit),
             currency = COALESCE($4, currency),
             fuel_types_json = COALESCE($5, fuel_types_json),
             service_types_json = COALESCE($6, service_types_json),
             updated_at = now()
         WHERE user_id = $1
         RETURNING *",
    )
    .bind(user_id)
    .bind(&p.distance_unit)
    .bind(&p.volume_unit)
    .bind(&p.currency)
    .bind(&p.fuel_types_json)
    .bind(&p.service_types_json)
    .fetch_one(pool)
    .await
}
