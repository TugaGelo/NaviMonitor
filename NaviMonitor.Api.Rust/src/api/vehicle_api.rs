//! `/api/vehicle` — same routes and status codes as the .NET VehicleController.

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    api::{error::ApiError, json::AppJson},
    app_state::AppState,
    modules::vehicle::{
        vehicle::{Vehicle, VehicleInput},
        vehicle_service::{self, VehicleError},
    },
    shared_kernel::current_user::CurrentUser,
};

pub(crate) fn map_service_error(e: VehicleError) -> ApiError {
    match e {
        VehicleError::NotFound => ApiError::NotFound,
        VehicleError::Invalid(msg) => ApiError::BadRequest(msg),
        VehicleError::Database(e) => e.into(),
    }
}

pub async fn list(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<Vec<Vehicle>>, ApiError> {
    vehicle_service::list(&state.pool, &user)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn get(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<Json<Vehicle>, ApiError> {
    vehicle_service::get(&state.pool, &user, id)
        .await
        .map(Json)
        .map_err(map_service_error)
}

/// 201 with the stored vehicle; the mobile sync reads `id` from it as its `serverId`.
pub async fn create(
    State(state): State<AppState>,
    user: CurrentUser,
    AppJson(input): AppJson<VehicleInput>,
) -> Result<(StatusCode, Json<Vehicle>), ApiError> {
    vehicle_service::create(&state.pool, &user, input)
        .await
        .map(|v| (StatusCode::CREATED, Json(v)))
        .map_err(map_service_error)
}

pub async fn update(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
    AppJson(input): AppJson<VehicleInput>,
) -> Result<StatusCode, ApiError> {
    vehicle_service::update(&state.pool, &user, id, input)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
}

pub async fn delete(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    vehicle_service::delete(&state.pool, &user, id)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
}

/// Run against a real Postgres: `#[sqlx::test]` creates a fresh database per
/// test from DATABASE_URL and applies the migrations.
#[cfg(test)]
mod db_tests {
    use axum::http::{Method, StatusCode};
    use serde_json::{Value, json};
    use sqlx::PgPool;

    use crate::test_support::{ME, OTHER, TestApp};

    fn body() -> Value {
        json!({
            "id": 99, // a local SQLite id; the server must ignore it on create
            "vehicleType": "Motorcycle",
            "nickname": "Navi",
            "make": "Honda",
            "model": "Click 125i",
            "year": 2022,
            "engineSizeCC": 125,
            "startingOdometer": 1200,
            "registrationExpiry": "2026-05-01T00:00:00"
        })
    }

    #[sqlx::test]
    async fn crud_round_trip(pool: PgPool) {
        let app = TestApp::new(pool);

        let (status, created) = app
            .call(Method::POST, "/api/Vehicle", ME, Some(body()))
            .await;
        assert_eq!(status, StatusCode::CREATED);
        let id = created["id"].as_i64().unwrap();
        assert_ne!(id, 99);
        assert_eq!(created["engineSizeCC"], 125);
        assert_eq!(created["registrationExpiry"], "2026-05-01T00:00:00Z");

        let mut edited = body();
        edited["id"] = json!(id);
        edited["nickname"] = json!("Navi 2");
        let (status, _) = app
            .call(Method::PUT, &format!("/api/vehicle/{id}"), ME, Some(edited))
            .await;
        assert_eq!(status, StatusCode::NO_CONTENT);

        let (status, fetched) = app
            .call(Method::GET, &format!("/api/vehicle/{id}"), ME, None)
            .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(fetched["nickname"], "Navi 2");

        let (status, _) = app
            .call(Method::DELETE, &format!("/api/vehicle/{id}"), ME, None)
            .await;
        assert_eq!(status, StatusCode::NO_CONTENT);

        let (_, list) = app.call(Method::GET, "/api/vehicle", ME, None).await;
        assert_eq!(list, json!([]));
        let (status, _) = app
            .call(Method::GET, &format!("/api/vehicle/{id}"), ME, None)
            .await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }

    #[sqlx::test]
    async fn other_users_cannot_see_or_touch_my_vehicle(pool: PgPool) {
        let app = TestApp::new(pool);
        let (_, created) = app
            .call(Method::POST, "/api/vehicle", ME, Some(body()))
            .await;
        let id = created["id"].as_i64().unwrap();
        let url = format!("/api/vehicle/{id}");

        let (_, list) = app.call(Method::GET, "/api/vehicle", OTHER, None).await;
        assert_eq!(list, json!([]));
        assert_eq!(
            app.call(Method::GET, &url, OTHER, None).await.0,
            StatusCode::NOT_FOUND
        );
        let mut edit = body();
        edit["id"] = json!(id);
        assert_eq!(
            app.call(Method::PUT, &url, OTHER, Some(edit)).await.0,
            StatusCode::NOT_FOUND
        );
        assert_eq!(
            app.call(Method::DELETE, &url, OTHER, None).await.0,
            StatusCode::NOT_FOUND
        );

        // Still there for me.
        assert_eq!(
            app.call(Method::GET, &url, ME, None).await.0,
            StatusCode::OK
        );
    }

    #[sqlx::test]
    async fn update_without_matrix_keeps_the_matrix(pool: PgPool) {
        let app = TestApp::new(pool);
        let mut with_matrix = body();
        with_matrix["hasSyncedManual"] = json!(true);
        with_matrix["maintenanceMatrixJson"] = json!("[{\"item\":\"Oil\"}]");
        let (_, created) = app
            .call(Method::POST, "/api/vehicle", ME, Some(with_matrix))
            .await;
        let id = created["id"].as_i64().unwrap();

        let mut edit = body();
        edit["id"] = json!(id);
        app.call(Method::PUT, &format!("/api/vehicle/{id}"), ME, Some(edit))
            .await;

        let (_, fetched) = app
            .call(Method::GET, &format!("/api/vehicle/{id}"), ME, None)
            .await;
        assert_eq!(fetched["hasSyncedManual"], true);
        assert_eq!(fetched["maintenanceMatrixJson"], "[{\"item\":\"Oil\"}]");
    }

    #[sqlx::test]
    async fn bad_input_is_400(pool: PgPool) {
        let app = TestApp::new(pool);
        let (status, err) = app
            .call(Method::POST, "/api/vehicle", ME, Some(json!({})))
            .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(
            err["message"]
                .as_str()
                .unwrap()
                .contains("Nickname is required")
        );

        let mut mismatched = body();
        mismatched["id"] = json!(5);
        let (status, _) = app
            .call(Method::PUT, "/api/vehicle/6", ME, Some(mismatched))
            .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }
}
