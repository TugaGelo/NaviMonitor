//! SQL for vehicles. Every query is scoped to `user_id`, which is how
//! ownership is enforced: another user's row simply isn't found.

// shortcut: runtime-checked queries (sqlx::query_as), because there's no DB at
// build time yet; switch to query_as! + `cargo sqlx prepare` once one is handy.

use sqlx::{PgExecutor, PgPool};

use super::vehicle::{Vehicle, VehicleFields};

pub async fn list(pool: &PgPool, user_id: &str) -> sqlx::Result<Vec<Vehicle>> {
    sqlx::query_as("SELECT * FROM vehicles WHERE user_id = $1 AND deleted_at IS NULL ORDER BY id")
        .bind(user_id)
        .fetch_all(pool)
        .await
}

pub async fn find(pool: &PgPool, user_id: &str, id: i32) -> sqlx::Result<Option<Vehicle>> {
    sqlx::query_as("SELECT * FROM vehicles WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL")
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
}

pub async fn insert(pool: &PgPool, user_id: &str, v: &VehicleFields) -> sqlx::Result<Vehicle> {
    sqlx::query_as(
        "INSERT INTO vehicles (user_id, vehicle_type, nickname, make, model, year, color,
             license_plate, engine_size_cc, starting_odometer, registration_expiry,
             insurance_expiry, has_synced_manual, maintenance_matrix_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, FALSE), $14)
         RETURNING *",
    )
    .bind(user_id)
    .bind(&v.vehicle_type)
    .bind(&v.nickname)
    .bind(&v.make)
    .bind(&v.model)
    .bind(v.year)
    .bind(&v.color)
    .bind(&v.license_plate)
    .bind(v.engine_size_cc)
    .bind(v.starting_odometer)
    .bind(v.registration_expiry)
    .bind(v.insurance_expiry)
    .bind(v.has_synced_manual)
    .bind(&v.maintenance_matrix_json)
    .fetch_one(pool)
    .await
}

/// Returns false when the vehicle doesn't exist for this user.
pub async fn update(
    pool: &PgPool,
    user_id: &str,
    id: i32,
    v: &VehicleFields,
) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE vehicles SET vehicle_type = $3, nickname = $4, make = $5, model = $6, year = $7,
             color = $8, license_plate = $9, engine_size_cc = $10, starting_odometer = $11,
             registration_expiry = $12, insurance_expiry = $13,
             has_synced_manual = COALESCE($14, has_synced_manual),
             maintenance_matrix_json = COALESCE($15, maintenance_matrix_json),
             updated_at = now()
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .bind(&v.vehicle_type)
    .bind(&v.nickname)
    .bind(&v.make)
    .bind(&v.model)
    .bind(v.year)
    .bind(&v.color)
    .bind(&v.license_plate)
    .bind(v.engine_size_cc)
    .bind(v.starting_odometer)
    .bind(v.registration_expiry)
    .bind(v.insurance_expiry)
    .bind(v.has_synced_manual)
    .bind(&v.maintenance_matrix_json)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Returns false when the vehicle doesn't exist for this user.
pub async fn soft_delete(conn: impl PgExecutor<'_>, user_id: &str, id: i32) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE vehicles SET deleted_at = now(), updated_at = now()
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .execute(conn)
    .await?;
    Ok(result.rows_affected() == 1)
}
