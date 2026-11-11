//! Vehicle use cases. Knows nothing about HTTP.

use sqlx::PgPool;

use super::{
    vehicle::{Vehicle, VehicleInput},
    vehicle_repo,
};
use crate::shared_kernel::current_user::CurrentUser;

#[derive(Debug, thiserror::Error)]
pub enum VehicleError {
    #[error("Vehicle not found.")]
    NotFound,
    #[error("{0}")]
    Invalid(String),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

pub async fn list(pool: &PgPool, user: &CurrentUser) -> Result<Vec<Vehicle>, VehicleError> {
    Ok(vehicle_repo::list(pool, &user.uid).await?)
}

pub async fn get(pool: &PgPool, user: &CurrentUser, id: i32) -> Result<Vehicle, VehicleError> {
    vehicle_repo::find(pool, &user.uid, id)
        .await?
        .ok_or(VehicleError::NotFound)
}

pub async fn create(
    pool: &PgPool,
    user: &CurrentUser,
    input: VehicleInput,
) -> Result<Vehicle, VehicleError> {
    // The client's `id` is its local SQLite id here; the server assigns the real one.
    let fields = input.validate().map_err(VehicleError::Invalid)?;
    Ok(vehicle_repo::insert(pool, &user.uid, &fields).await?)
}

pub async fn update(
    pool: &PgPool,
    user: &CurrentUser,
    id: i32,
    input: VehicleInput,
) -> Result<(), VehicleError> {
    if input.id.is_some_and(|body_id| body_id != i64::from(id)) {
        return Err(VehicleError::Invalid(
            "The ID in the URL must match the ID in the data.".into(),
        ));
    }
    let fields = input.validate().map_err(VehicleError::Invalid)?;
    if vehicle_repo::update(pool, &user.uid, id, &fields).await? {
        Ok(())
    } else {
        Err(VehicleError::NotFound)
    }
}

pub async fn delete(pool: &PgPool, user: &CurrentUser, id: i32) -> Result<(), VehicleError> {
    // TODO(step 4/5): soft-delete the vehicle's refuel and maintenance logs in the same transaction.
    if vehicle_repo::soft_delete(pool, &user.uid, id).await? {
        Ok(())
    } else {
        Err(VehicleError::NotFound)
    }
}
