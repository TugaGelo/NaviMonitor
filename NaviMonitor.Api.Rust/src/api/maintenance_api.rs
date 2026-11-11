//! `/api/maintenance` — same routes and status codes as the .NET MaintenanceController.
//! `/analyze` (Gemini) comes in step 6.

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::Deserialize;
use serde_json::{Value, json};

use crate::{
    api::{error::ApiError, json::AppJson, vehicle_api},
    app_state::AppState,
    modules::{
        maintenance::{
            maintenance_log::{MaintenanceInput, MaintenanceLog},
            maintenance_service::{self, MaintenanceError},
        },
        vehicle::vehicle_service,
    },
    shared_kernel::current_user::CurrentUser,
};

fn map_service_error(e: MaintenanceError) -> ApiError {
    match e {
        MaintenanceError::NotFound | MaintenanceError::VehicleNotFound => ApiError::NotFound,
        MaintenanceError::Invalid(msg) => ApiError::BadRequest(msg),
        MaintenanceError::Database(e) => e.into(),
    }
}

pub async fn list(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<Vec<MaintenanceLog>>, ApiError> {
    maintenance_service::list(&state.pool, &user)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn list_for_vehicle(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(vehicle_id): Path<i32>,
) -> Result<Json<Vec<MaintenanceLog>>, ApiError> {
    maintenance_service::list_for_vehicle(&state.pool, &user, vehicle_id)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn get(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<Json<MaintenanceLog>, ApiError> {
    maintenance_service::get(&state.pool, &user, id)
        .await
        .map(Json)
        .map_err(map_service_error)
}

/// 201 with the stored log; the mobile sync reads its `id`.
pub async fn create(
    State(state): State<AppState>,
    user: CurrentUser,
    AppJson(input): AppJson<MaintenanceInput>,
) -> Result<(StatusCode, Json<MaintenanceLog>), ApiError> {
    maintenance_service::create(&state.pool, &user, input)
        .await
        .map(|log| (StatusCode::CREATED, Json(log)))
        .map_err(map_service_error)
}

pub async fn update(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
    AppJson(input): AppJson<MaintenanceInput>,
) -> Result<StatusCode, ApiError> {
    maintenance_service::update(&state.pool, &user, id, input)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
}

pub async fn delete(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    maintenance_service::delete(&state.pool, &user, id)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveMatrixRequest {
    #[serde(default)]
    matrix_data: Option<Value>,
}

/// `POST /api/maintenance/vehicle/{vehicleId}/matrix` — saves the schedule onto the vehicle.
pub async fn save_matrix(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(vehicle_id): Path<i32>,
    AppJson(body): AppJson<SaveMatrixRequest>,
) -> Result<Json<Value>, ApiError> {
    vehicle_service::save_matrix(&state.pool, &user, vehicle_id, body.matrix_data)
        .await
        .map_err(vehicle_api::map_service_error)?;
    Ok(Json(
        json!({ "message": "Maintenance schedule saved successfully!" }),
    ))
}

#[cfg(test)]
mod db_tests {
    use axum::http::{Method, StatusCode};
    use serde_json::{Value, json};
    use sqlx::PgPool;

    use crate::test_support::{ME, OTHER, TestApp};

    async fn my_vehicle(app: &TestApp) -> i64 {
        let body = json!({
            "vehicleType": "Motorcycle", "nickname": "Navi", "make": "Honda",
            "model": "Click", "year": 2022, "engineSizeCC": 125, "startingOdometer": 0
        });
        let (_, v) = app.call(Method::POST, "/api/vehicle", ME, Some(body)).await;
        v["id"].as_i64().unwrap()
    }

    fn oil_change(vehicle_id: i64) -> Value {
        json!({
            "vehicleId": vehicle_id, "logType": "Maintenance",
            "date": "2026-11-01T00:00:00.000Z", "odometer": 15000,
            "serviceType": "Oil Change", "price": 450, "isDIY": true,
            "shopName": "", "nextServiceOdometer": 17000
        })
    }

    #[sqlx::test]
    async fn create_get_update_delete(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;

        let (status, log) = app
            .call(Method::POST, "/api/Maintenance", ME, Some(oil_change(vid)))
            .await;
        assert_eq!(status, StatusCode::CREATED);
        let id = log["id"].as_i64().unwrap();
        assert_eq!(log["isDIY"], true);
        assert_eq!(log["shopName"], Value::Null);

        let url = format!("/api/maintenance/{id}");
        let (status, fetched) = app.call(Method::GET, &url, ME, None).await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(fetched["serviceType"], "Oil Change");

        let mut edit = oil_change(vid);
        edit["id"] = json!(id);
        edit["price"] = json!(500);
        let (status, _) = app.call(Method::PUT, &url, ME, Some(edit)).await;
        assert_eq!(status, StatusCode::NO_CONTENT);

        let (_, list) = app
            .call(
                Method::GET,
                &format!("/api/maintenance/vehicle/{vid}"),
                ME,
                None,
            )
            .await;
        assert_eq!(list[0]["price"], 500.0);

        let (status, _) = app.call(Method::DELETE, &url, ME, None).await;
        assert_eq!(status, StatusCode::NO_CONTENT);
        assert_eq!(
            app.call(Method::GET, &url, ME, None).await.0,
            StatusCode::NOT_FOUND
        );
    }

    #[sqlx::test]
    async fn other_users_cannot_log_to_or_read_my_vehicle(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        let (_, log) = app
            .call(Method::POST, "/api/maintenance", ME, Some(oil_change(vid)))
            .await;
        let url = format!("/api/maintenance/{}", log["id"]);

        let (status, _) = app
            .call(
                Method::POST,
                "/api/maintenance",
                OTHER,
                Some(oil_change(vid)),
            )
            .await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(
            app.call(Method::GET, &url, OTHER, None).await.0,
            StatusCode::NOT_FOUND
        );
        let (_, theirs) = app.call(Method::GET, "/api/maintenance", OTHER, None).await;
        assert_eq!(theirs, json!([]));
    }

    #[sqlx::test]
    async fn deleting_the_vehicle_hides_its_logs(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        app.call(Method::POST, "/api/maintenance", ME, Some(oil_change(vid)))
            .await;
        app.call(Method::DELETE, &format!("/api/vehicle/{vid}"), ME, None)
            .await;
        let (_, list) = app.call(Method::GET, "/api/maintenance", ME, None).await;
        assert_eq!(list, json!([]));
    }

    #[sqlx::test]
    async fn save_matrix_stores_it_on_the_vehicle(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        let url = format!("/api/maintenance/vehicle/{vid}/matrix");
        let body =
            json!({ "matrixData": { "matrix": [{ "item": "Engine Oil", "interval": 2000 }] } });

        let (status, res) = app.call(Method::POST, &url, ME, Some(body.clone())).await;
        assert_eq!(status, StatusCode::OK);
        assert!(res["message"].as_str().unwrap().contains("saved"));

        let (_, vehicle) = app
            .call(Method::GET, &format!("/api/vehicle/{vid}"), ME, None)
            .await;
        assert_eq!(vehicle["hasSyncedManual"], true);
        let stored: Value =
            serde_json::from_str(vehicle["maintenanceMatrixJson"].as_str().unwrap()).unwrap();
        assert_eq!(stored, body["matrixData"]);

        assert_eq!(
            app.call(Method::POST, &url, OTHER, Some(body)).await.0,
            StatusCode::NOT_FOUND
        );
        let (status, _) = app.call(Method::POST, &url, ME, Some(json!({}))).await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }
}
