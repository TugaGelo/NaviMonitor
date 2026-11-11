//! `/api/refuel` — same routes and status codes as the .NET RefuelController
//! (minus `/stats/{vehicleId}`, which no client calls).

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    api::{error::ApiError, json::AppJson},
    app_state::AppState,
    modules::refuel::{
        refuel_log::{RefuelInput, RefuelLog},
        refuel_service::{self, RefuelError},
    },
    shared_kernel::current_user::CurrentUser,
};

fn map_service_error(e: RefuelError) -> ApiError {
    match e {
        RefuelError::NotFound | RefuelError::VehicleNotFound => ApiError::NotFound,
        RefuelError::Invalid(msg) => ApiError::BadRequest(msg),
        RefuelError::Database(e) => e.into(),
    }
}

pub async fn list(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<Vec<RefuelLog>>, ApiError> {
    refuel_service::list(&state.pool, &user)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn list_for_vehicle(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(vehicle_id): Path<i32>,
) -> Result<Json<Vec<RefuelLog>>, ApiError> {
    refuel_service::list_for_vehicle(&state.pool, &user, vehicle_id)
        .await
        .map(Json)
        .map_err(map_service_error)
}

/// 200 (not 201) with the stored log, as .NET did; the mobile sync reads its `id`.
pub async fn create(
    State(state): State<AppState>,
    user: CurrentUser,
    AppJson(input): AppJson<RefuelInput>,
) -> Result<Json<RefuelLog>, ApiError> {
    refuel_service::create(&state.pool, &user, input)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn update(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
    AppJson(input): AppJson<RefuelInput>,
) -> Result<StatusCode, ApiError> {
    refuel_service::update(&state.pool, &user, id, input)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
}

pub async fn delete(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    refuel_service::delete(&state.pool, &user, id)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
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

    fn fill_up(vehicle_id: i64, odometer: i32) -> Value {
        json!({
            "vehicleId": vehicle_id, "date": "2026-11-10T08:30:00.000Z",
            "odometer": odometer, "volume": 4.2, "totalCost": 285.6
        })
    }

    #[sqlx::test]
    async fn create_list_update_delete(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;

        let (status, log) = app
            .call(Method::POST, "/api/Refuel", ME, Some(fill_up(vid, 100)))
            .await;
        assert_eq!(status, StatusCode::OK);
        let id = log["id"].as_i64().unwrap();
        assert_eq!(log["fuelType"], "Unleaded");
        assert_eq!(log["totalCost"], 285.6);

        let (_, list) = app
            .call(Method::GET, &format!("/api/refuel/vehicle/{vid}"), ME, None)
            .await;
        assert_eq!(list.as_array().unwrap().len(), 1);

        let mut edit = fill_up(vid, 150);
        edit["id"] = json!(id);
        let (status, _) = app
            .call(Method::PUT, &format!("/api/refuel/{id}"), ME, Some(edit))
            .await;
        assert_eq!(status, StatusCode::NO_CONTENT);

        let (status, _) = app
            .call(Method::DELETE, &format!("/api/refuel/{id}"), ME, None)
            .await;
        assert_eq!(status, StatusCode::NO_CONTENT);
        let (_, list) = app.call(Method::GET, "/api/refuel", ME, None).await;
        assert_eq!(list, json!([]));
    }

    #[sqlx::test]
    async fn odometer_must_go_up(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        app.call(Method::POST, "/api/refuel", ME, Some(fill_up(vid, 500)))
            .await;

        let (status, err) = app
            .call(Method::POST, "/api/refuel", ME, Some(fill_up(vid, 500)))
            .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(err["error"].as_str().unwrap().contains("(500)"));
    }

    #[sqlx::test]
    async fn cannot_log_to_or_touch_another_users_vehicle(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        let (_, log) = app
            .call(Method::POST, "/api/refuel", ME, Some(fill_up(vid, 100)))
            .await;
        let id = log["id"].as_i64().unwrap();

        let (status, _) = app
            .call(Method::POST, "/api/refuel", OTHER, Some(fill_up(vid, 200)))
            .await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        let (_, theirs) = app
            .call(
                Method::GET,
                &format!("/api/refuel/vehicle/{vid}"),
                OTHER,
                None,
            )
            .await;
        assert_eq!(theirs, json!([]));
        let url = format!("/api/refuel/{id}");
        assert_eq!(
            app.call(Method::DELETE, &url, OTHER, None).await.0,
            StatusCode::NOT_FOUND
        );
    }

    #[sqlx::test]
    async fn deleting_the_vehicle_hides_its_fill_ups(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        app.call(Method::POST, "/api/refuel", ME, Some(fill_up(vid, 100)))
            .await;

        app.call(Method::DELETE, &format!("/api/vehicle/{vid}"), ME, None)
            .await;
        let (_, list) = app.call(Method::GET, "/api/refuel", ME, None).await;
        assert_eq!(list, json!([]));
    }
}
