//! SQL for documents. Ownership is the row's own `user_id`, since `vehicle_id` can be NULL.

use sqlx::{PgExecutor, PgPool};

use super::document::{Document, DocumentFields};

/// Soonest expiry first: that's the order a reminder list wants.
pub async fn list_for_user(pool: &PgPool, user_id: &str) -> sqlx::Result<Vec<Document>> {
    sqlx::query_as(
        "SELECT * FROM documents WHERE user_id = $1 AND deleted_at IS NULL
         ORDER BY expiry_date, id",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

pub async fn list_for_vehicle(
    pool: &PgPool,
    user_id: &str,
    vehicle_id: i32,
) -> sqlx::Result<Vec<Document>> {
    sqlx::query_as(
        "SELECT * FROM documents WHERE user_id = $1 AND vehicle_id = $2 AND deleted_at IS NULL
         ORDER BY expiry_date, id",
    )
    .bind(user_id)
    .bind(vehicle_id)
    .fetch_all(pool)
    .await
}

pub async fn find(pool: &PgPool, user_id: &str, id: i32) -> sqlx::Result<Option<Document>> {
    sqlx::query_as("SELECT * FROM documents WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL")
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
}

/// Call only after checking the caller owns `f.vehicle_id` (when set).
pub async fn insert(pool: &PgPool, user_id: &str, f: &DocumentFields) -> sqlx::Result<Document> {
    sqlx::query_as(
        "INSERT INTO documents (user_id, vehicle_id, document_type, document_number,
             issue_date, expiry_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *",
    )
    .bind(user_id)
    .bind(f.vehicle_id)
    .bind(&f.document_type)
    .bind(&f.document_number)
    .bind(f.issue_date)
    .bind(f.expiry_date)
    .bind(&f.notes)
    .fetch_one(pool)
    .await
}

/// Returns false when the document doesn't exist for this user.
/// Call only after checking the caller owns `f.vehicle_id` (when set).
pub async fn update(
    pool: &PgPool,
    user_id: &str,
    id: i32,
    f: &DocumentFields,
) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE documents SET vehicle_id = $3, document_type = $4, document_number = $5,
             issue_date = $6, expiry_date = $7, notes = $8, updated_at = now()
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
    )
    .bind(id)
    .bind(user_id)
    .bind(f.vehicle_id)
    .bind(&f.document_type)
    .bind(&f.document_number)
    .bind(f.issue_date)
    .bind(f.expiry_date)
    .bind(&f.notes)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Returns false when the document doesn't exist for this user.
pub async fn soft_delete(pool: &PgPool, user_id: &str, id: i32) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE documents SET deleted_at = now(), updated_at = now()
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
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
        "UPDATE documents SET deleted_at = now(), updated_at = now()
         WHERE vehicle_id = $1 AND deleted_at IS NULL",
    )
    .bind(vehicle_id)
    .execute(conn)
    .await?;
    Ok(())
}
