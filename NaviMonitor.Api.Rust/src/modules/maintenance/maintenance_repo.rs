//! SQL for maintenance logs. Ownership goes through the parent vehicle's `user_id`.

use sqlx::{PgExecutor, PgPool};

use super::maintenance_log::{MaintenanceFields, MaintenanceLog};

pub async fn list_for_user(pool: &PgPool, user_id: &str) -> sqlx::Result<Vec<MaintenanceLog>> {
    sqlx::query_as(
        "SELECT m.* FROM maintenance_logs m
         JOIN vehicles v ON v.id = m.vehicle_id
         WHERE v.user_id = $1 AND v.deleted_at IS NULL AND m.deleted_at IS NULL
         ORDER BY m.date DESC, m.id DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

pub async fn list_for_vehicle(
    pool: &PgPool,
    user_id: &str,
    vehicle_id: i32,
) -> sqlx::Result<Vec<MaintenanceLog>> {
    sqlx::query_as(
        "SELECT m.* FROM maintenance_logs m
         JOIN vehicles v ON v.id = m.vehicle_id
         WHERE v.user_id = $1 AND v.id = $2 AND v.deleted_at IS NULL AND m.deleted_at IS NULL
         ORDER BY m.date DESC, m.id DESC",
    )
    .bind(user_id)
    .bind(vehicle_id)
    .fetch_all(pool)
    .await
}

pub async fn find(pool: &PgPool, user_id: &str, id: i32) -> sqlx::Result<Option<MaintenanceLog>> {
    sqlx::query_as(
        "SELECT m.* FROM maintenance_logs m
         JOIN vehicles v ON v.id = m.vehicle_id
         WHERE m.id = $1 AND v.user_id = $2 AND v.deleted_at IS NULL AND m.deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .fetch_optional(pool)
    .await
}

/// Call only after checking the caller owns `f.vehicle_id`.
pub async fn insert(pool: &PgPool, f: &MaintenanceFields) -> sqlx::Result<MaintenanceLog> {
    sqlx::query_as(
        "INSERT INTO maintenance_logs (vehicle_id, log_type, service_category, date, odometer,
             service_type, price, is_diy, shop_name, mechanic_name, contact_number, notes,
             next_service_odometer, next_service_date, tire_position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *",
    )
    .bind(f.vehicle_id)
    .bind(&f.log_type)
    .bind(&f.service_category)
    .bind(f.date)
    .bind(f.odometer)
    .bind(&f.service_type)
    .bind(f.price)
    .bind(f.is_diy)
    .bind(&f.shop_name)
    .bind(&f.mechanic_name)
    .bind(&f.contact_number)
    .bind(&f.notes)
    .bind(f.next_service_odometer)
    .bind(f.next_service_date)
    .bind(&f.tire_position)
    .fetch_one(pool)
    .await
}

/// Returns false when the log doesn't exist for this user. Call only after
/// checking the caller owns `f.vehicle_id` (the log may move to another vehicle).
pub async fn update(
    pool: &PgPool,
    user_id: &str,
    id: i32,
    f: &MaintenanceFields,
) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE maintenance_logs m SET vehicle_id = $3, log_type = $4, service_category = $5,
             date = $6, odometer = $7, service_type = $8, price = $9, is_diy = $10,
             shop_name = $11, mechanic_name = $12, contact_number = $13, notes = $14,
             next_service_odometer = $15, next_service_date = $16, tire_position = $17,
             updated_at = now()
         FROM vehicles v
         WHERE m.id = $1 AND m.deleted_at IS NULL
           AND v.id = m.vehicle_id AND v.user_id = $2 AND v.deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .bind(f.vehicle_id)
    .bind(&f.log_type)
    .bind(&f.service_category)
    .bind(f.date)
    .bind(f.odometer)
    .bind(&f.service_type)
    .bind(f.price)
    .bind(f.is_diy)
    .bind(&f.shop_name)
    .bind(&f.mechanic_name)
    .bind(&f.contact_number)
    .bind(&f.notes)
    .bind(f.next_service_odometer)
    .bind(f.next_service_date)
    .bind(&f.tire_position)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Returns false when the log doesn't exist for this user.
pub async fn soft_delete(pool: &PgPool, user_id: &str, id: i32) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE maintenance_logs m SET deleted_at = now(), updated_at = now()
         FROM vehicles v
         WHERE m.id = $1 AND m.deleted_at IS NULL
           AND v.id = m.vehicle_id AND v.user_id = $2 AND v.deleted_at IS NULL",
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
        "UPDATE maintenance_logs SET deleted_at = now(), updated_at = now()
         WHERE vehicle_id = $1 AND deleted_at IS NULL",
    )
    .bind(vehicle_id)
    .execute(conn)
    .await?;
    Ok(())
}
