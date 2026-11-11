use sqlx::PgPool;

use super::{
    maintenance_log::{MaintenanceInput, MaintenanceLog},
    maintenance_repo,
};
use crate::{modules::vehicle::vehicle_repo, shared_kernel::current_user::CurrentUser};

#[derive(Debug, thiserror::Error)]
pub enum MaintenanceError {
    #[error("Maintenance log not found.")]
    NotFound,
    #[error("Vehicle not found.")]
    VehicleNotFound,
    #[error("{0}")]
    Invalid(String),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

pub async fn list(
    pool: &PgPool,
    user: &CurrentUser,
) -> Result<Vec<MaintenanceLog>, MaintenanceError> {
    Ok(maintenance_repo::list_for_user(pool, &user.uid).await?)
}

/// Another user's vehicle gives an empty list, like a vehicle with no logs.
pub async fn list_for_vehicle(
    pool: &PgPool,
    user: &CurrentUser,
    vehicle_id: i32,
) -> Result<Vec<MaintenanceLog>, MaintenanceError> {
    Ok(maintenance_repo::list_for_vehicle(pool, &user.uid, vehicle_id).await?)
}

pub async fn get(
    pool: &PgPool,
    user: &CurrentUser,
    id: i32,
) -> Result<MaintenanceLog, MaintenanceError> {
    maintenance_repo::find(pool, &user.uid, id)
        .await?
        .ok_or(MaintenanceError::NotFound)
}

async fn ensure_vehicle_owned(
    pool: &PgPool,
    user: &CurrentUser,
    vehicle_id: i32,
) -> Result<(), MaintenanceError> {
    match vehicle_repo::find(pool, &user.uid, vehicle_id).await? {
        Some(_) => Ok(()),
        None => Err(MaintenanceError::VehicleNotFound),
    }
}

pub async fn create(
    pool: &PgPool,
    user: &CurrentUser,
    input: MaintenanceInput,
) -> Result<MaintenanceLog, MaintenanceError> {
    let fields = input.validate().map_err(MaintenanceError::Invalid)?;
    ensure_vehicle_owned(pool, user, fields.vehicle_id).await?;
    Ok(maintenance_repo::insert(pool, &fields).await?)
}

pub async fn update(
    pool: &PgPool,
    user: &CurrentUser,
    id: i32,
    input: MaintenanceInput,
) -> Result<(), MaintenanceError> {
    if input.id.is_some_and(|body_id| body_id != i64::from(id)) {
        return Err(MaintenanceError::Invalid(
            "The ID in the URL must match the ID in the data.".into(),
        ));
    }
    let fields = input.validate().map_err(MaintenanceError::Invalid)?;
    ensure_vehicle_owned(pool, user, fields.vehicle_id).await?;

    if maintenance_repo::update(pool, &user.uid, id, &fields).await? {
        Ok(())
    } else {
        Err(MaintenanceError::NotFound)
    }
}

pub async fn delete(pool: &PgPool, user: &CurrentUser, id: i32) -> Result<(), MaintenanceError> {
    if maintenance_repo::soft_delete(pool, &user.uid, id).await? {
        Ok(())
    } else {
        Err(MaintenanceError::NotFound)
    }
}
