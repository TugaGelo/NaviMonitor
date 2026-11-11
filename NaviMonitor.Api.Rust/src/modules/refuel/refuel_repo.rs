//! SQL for fill-ups. Ownership goes through the parent vehicle's `user_id`.

use sqlx::{PgExecutor, PgPool};

use super::refuel_log::{RefuelFields, RefuelLog};

pub async fn list_for_user(pool: &PgPool, user_id: &str) -> sqlx::Result<Vec<RefuelLog>> {
    sqlx::query_as(
        "SELECT r.* FROM refuel_logs r
         JOIN vehicles v ON v.id = r.vehicle_id
         WHERE v.user_id = $1 AND v.deleted_at IS NULL AND r.deleted_at IS NULL
         ORDER BY r.date DESC, r.id DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

pub async fn list_for_vehicle(
    pool: &PgPool,
    user_id: &str,
    vehicle_id: i32,
) -> sqlx::Result<Vec<RefuelLog>> {
    sqlx::query_as(
        "SELECT r.* FROM refuel_logs r
         JOIN vehicles v ON v.id = r.vehicle_id
         WHERE v.user_id = $1 AND v.id = $2 AND v.deleted_at IS NULL AND r.deleted_at IS NULL
         ORDER BY r.date DESC, r.id DESC",
    )
    .bind(user_id)
    .bind(vehicle_id)
    .fetch_all(pool)
    .await
}

/// Call only after checking the caller owns `vehicle_id`.
pub async fn max_odometer(pool: &PgPool, vehicle_id: i32) -> sqlx::Result<Option<i32>> {
    sqlx::query_scalar(
        "SELECT MAX(odometer) FROM refuel_logs WHERE vehicle_id = $1 AND deleted_at IS NULL",
    )
    .bind(vehicle_id)
    .fetch_one(pool)
    .await
}

/// Call only after checking the caller owns `f.vehicle_id`.
pub async fn insert(pool: &PgPool, f: &RefuelFields) -> sqlx::Result<RefuelLog> {
    sqlx::query_as(
        "INSERT INTO refuel_logs (vehicle_id, date, odometer, volume, total_cost, fuel_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *",
    )
    .bind(f.vehicle_id)
    .bind(f.date)
    .bind(f.odometer)
    .bind(f.volume)
    .bind(f.total_cost)
    .bind(&f.fuel_type)
    .fetch_one(pool)
    .await
}

/// Returns false when the log doesn't exist for this user. Call only after
/// checking the caller owns `f.vehicle_id` (the log may move to another vehicle).
pub async fn update(pool: &PgPool, user_id: &str, id: i32, f: &RefuelFields) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE refuel_logs r SET vehicle_id = $3, date = $4, odometer = $5, volume = $6,
             total_cost = $7, fuel_type = $8, updated_at = now()
         FROM vehicles v
         WHERE r.id = $1 AND r.deleted_at IS NULL
           AND v.id = r.vehicle_id AND v.user_id = $2 AND v.deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .bind(f.vehicle_id)
    .bind(f.date)
    .bind(f.odometer)
    .bind(f.volume)
    .bind(f.total_cost)
    .bind(&f.fuel_type)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Returns false when the log doesn't exist for this user.
pub async fn soft_delete(pool: &PgPool, user_id: &str, id: i32) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE refuel_logs r SET deleted_at = now(), updated_at = now()
         FROM vehicles v
         WHERE r.id = $1 AND r.deleted_at IS NULL
           AND v.id = r.vehicle_id AND v.user_id = $2 AND v.deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Used when a vehicle is deleted, inside the same transaction.
pub async fn soft_delete_for_vehicle(
    conn: impl PgExecutor<'_>,
    vehicle_id: i32,
) -> sqlx::Result<()> {
    sqlx::query(
        "UPDATE refuel_logs SET deleted_at = now(), updated_at = now()
         WHERE vehicle_id = $1 AND deleted_at IS NULL",
    )
    .bind(vehicle_id)
    .execute(conn)
    .await?;
    Ok(())
}
