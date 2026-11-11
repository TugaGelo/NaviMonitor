//! Vehicle use cases. Knows nothing about HTTP.

use sqlx::PgPool;

use super::{
    vehicle::{Vehicle, VehicleInput},
    vehicle_repo,
};
use crate::{modules::refuel::refuel_repo, shared_kernel::current_user::CurrentUser};

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
    // One transaction: the vehicle and its logs disappear together or not at all.
    // Returning early drops `tx`, which rolls it back.
    let mut tx = pool.begin().await?;
    if !vehicle_repo::soft_delete(&mut *tx, &user.uid, id).await? {
        return Err(VehicleError::NotFound);
    }
    refuel_repo::soft_delete_for_vehicle(&mut *tx, id).await?;
    // TODO(step 5): maintenance logs too.
    tx.commit().await?;
    Ok(())
}
