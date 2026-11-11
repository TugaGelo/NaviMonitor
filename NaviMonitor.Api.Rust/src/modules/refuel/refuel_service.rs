use sqlx::PgPool;

use super::{
    refuel_log::{RefuelInput, RefuelLog},
    refuel_policy, refuel_repo,
};
use crate::{modules::vehicle::vehicle_repo, shared_kernel::current_user::CurrentUser};

#[derive(Debug, thiserror::Error)]
pub enum RefuelError {
    #[error("Gas receipt not found.")]
    NotFound,
    #[error("Vehicle not found.")]
    VehicleNotFound,
    #[error("{0}")]
    Invalid(String),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

pub async fn list(pool: &PgPool, user: &CurrentUser) -> Result<Vec<RefuelLog>, RefuelError> {
    Ok(refuel_repo::list_for_user(pool, &user.uid).await?)
}

/// Another user's vehicle gives an empty list, like a vehicle with no fill-ups.
pub async fn list_for_vehicle(
    pool: &PgPool,
    user: &CurrentUser,
    vehicle_id: i32,
) -> Result<Vec<RefuelLog>, RefuelError> {
    Ok(refuel_repo::list_for_vehicle(pool, &user.uid, vehicle_id).await?)
}

async fn ensure_vehicle_owned(
    pool: &PgPool,
    user: &CurrentUser,
    vehicle_id: i32,
) -> Result<(), RefuelError> {
    match vehicle_repo::find(pool, &user.uid, vehicle_id).await? {
        Some(_) => Ok(()),
        None => Err(RefuelError::VehicleNotFound),
    }
}

pub async fn create(
    pool: &PgPool,
    user: &CurrentUser,
    input: RefuelInput,
) -> Result<RefuelLog, RefuelError> {
    let fields = input.validate().map_err(RefuelError::Invalid)?;
    ensure_vehicle_owned(pool, user, fields.vehicle_id).await?;

    let highest = refuel_repo::max_odometer(pool, fields.vehicle_id).await?;
    refuel_policy::check_new_odometer(fields.odometer, highest).map_err(RefuelError::Invalid)?;

    Ok(refuel_repo::insert(pool, &fields).await?)
}

pub async fn update(
    pool: &PgPool,
    user: &CurrentUser,
    id: i32,
    input: RefuelInput,
) -> Result<(), RefuelError> {
    if input.id.is_some_and(|body_id| body_id != i64::from(id)) {
        return Err(RefuelError::Invalid(
            "The ID in the URL must match the ID in the data.".into(),
        ));
    }
    let fields = input.validate().map_err(RefuelError::Invalid)?;
    ensure_vehicle_owned(pool, user, fields.vehicle_id).await?;

    if refuel_repo::update(pool, &user.uid, id, &fields).await? {
        Ok(())
    } else {
        Err(RefuelError::NotFound)
    }
}

pub async fn delete(pool: &PgPool, user: &CurrentUser, id: i32) -> Result<(), RefuelError> {
    if refuel_repo::soft_delete(pool, &user.uid, id).await? {
        Ok(())
    } else {
        Err(RefuelError::NotFound)
    }
}
