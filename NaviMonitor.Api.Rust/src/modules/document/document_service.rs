use sqlx::PgPool;

use super::{
    document::{Document, DocumentInput},
    document_repo,
};
use crate::{modules::vehicle::vehicle_repo, shared_kernel::current_user::CurrentUser};

#[derive(Debug, thiserror::Error)]
pub enum DocumentError {
    #[error("Document not found.")]
    NotFound,
    #[error("Vehicle not found.")]
    VehicleNotFound,
    #[error("{0}")]
    Invalid(String),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

pub async fn list(pool: &PgPool, user: &CurrentUser) -> Result<Vec<Document>, DocumentError> {
    Ok(document_repo::list_for_user(pool, &user.uid).await?)
}

/// Another user's vehicle gives an empty list, like a vehicle with no documents.
pub async fn list_for_vehicle(
    pool: &PgPool,
    user: &CurrentUser,
    vehicle_id: i32,
) -> Result<Vec<Document>, DocumentError> {
    Ok(document_repo::list_for_vehicle(pool, &user.uid, vehicle_id).await?)
}

pub async fn get(pool: &PgPool, user: &CurrentUser, id: i32) -> Result<Document, DocumentError> {
    document_repo::find(pool, &user.uid, id)
        .await?
        .ok_or(DocumentError::NotFound)
}

/// Personal documents (no vehicle) need no check.
async fn ensure_vehicle_owned(
    pool: &PgPool,
    user: &CurrentUser,
    vehicle_id: Option<i32>,
) -> Result<(), DocumentError> {
    let Some(vehicle_id) = vehicle_id else {
        return Ok(());
    };
    match vehicle_repo::find(pool, &user.uid, vehicle_id).await? {
        Some(_) => Ok(()),
        None => Err(DocumentError::VehicleNotFound),
    }
}

pub async fn create(
    pool: &PgPool,
    user: &CurrentUser,
    input: DocumentInput,
) -> Result<Document, DocumentError> {
    let fields = input.validate().map_err(DocumentError::Invalid)?;
    ensure_vehicle_owned(pool, user, fields.vehicle_id).await?;
    Ok(document_repo::insert(pool, &user.uid, &fields).await?)
}

pub async fn update(
    pool: &PgPool,
    user: &CurrentUser,
    id: i32,
    input: DocumentInput,
) -> Result<(), DocumentError> {
    if input.id.is_some_and(|body_id| body_id != i64::from(id)) {
        return Err(DocumentError::Invalid(
            "The ID in the URL must match the ID in the data.".into(),
        ));
    }
    let fields = input.validate().map_err(DocumentError::Invalid)?;
    ensure_vehicle_owned(pool, user, fields.vehicle_id).await?;

    if document_repo::update(pool, &user.uid, id, &fields).await? {
        Ok(())
    } else {
        Err(DocumentError::NotFound)
    }
}

pub async fn delete(pool: &PgPool, user: &CurrentUser, id: i32) -> Result<(), DocumentError> {
    if document_repo::soft_delete(pool, &user.uid, id).await? {
        Ok(())
    } else {
        Err(DocumentError::NotFound)
    }
}
