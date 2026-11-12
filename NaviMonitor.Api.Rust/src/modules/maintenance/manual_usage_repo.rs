//! Per-user daily count of manual analyses. "Today" is the database's date (UTC on Neon).

use sqlx::PgPool;

/// Counts one use if the user is under `limit` today. Returns false when they're at the limit.
/// One statement, so two parallel requests can't both take the last slot.
pub async fn try_take(pool: &PgPool, user_id: &str, limit: i32) -> sqlx::Result<bool> {
    let row: Option<(i32,)> = sqlx::query_as(
        "INSERT INTO manual_analysis_usage (user_id, day, count) VALUES ($1, CURRENT_DATE, 1)
         ON CONFLICT (user_id, day) DO UPDATE SET count = manual_analysis_usage.count + 1
         WHERE manual_analysis_usage.count < $2
         RETURNING count",
    )
    .bind(user_id)
    .bind(limit)
    .fetch_optional(pool)
    .await?;
    Ok(row.is_some())
}

/// Undoes `try_take` when Gemini failed, so a failure doesn't cost the user a try.
pub async fn give_back(pool: &PgPool, user_id: &str) -> sqlx::Result<()> {
    sqlx::query(
        "UPDATE manual_analysis_usage SET count = count - 1
         WHERE user_id = $1 AND day = CURRENT_DATE AND count > 0",
    )
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(())
}
