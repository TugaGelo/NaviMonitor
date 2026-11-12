//! `/api/document` — new in the Rust API; status codes follow the other controllers
//! (create 201 with the row, update and delete 204).

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    api::{error::ApiError, json::AppJson},
    app_state::AppState,
    modules::document::{
        document::{Document, DocumentInput},
        document_service::{self, DocumentError},
    },
    shared_kernel::current_user::CurrentUser,
};

fn map_service_error(e: DocumentError) -> ApiError {
    match e {
        DocumentError::NotFound | DocumentError::VehicleNotFound => ApiError::NotFound,
        DocumentError::Invalid(msg) => ApiError::BadRequest(msg),
        DocumentError::Database(e) => e.into(),
    }
}

pub async fn list(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<Vec<Document>>, ApiError> {
    document_service::list(&state.pool, &user)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn list_for_vehicle(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(vehicle_id): Path<i32>,
) -> Result<Json<Vec<Document>>, ApiError> {
    document_service::list_for_vehicle(&state.pool, &user, vehicle_id)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn get(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<Json<Document>, ApiError> {
    document_service::get(&state.pool, &user, id)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn create(
    State(state): State<AppState>,
    user: CurrentUser,
    AppJson(input): AppJson<DocumentInput>,
) -> Result<(StatusCode, Json<Document>), ApiError> {
    document_service::create(&state.pool, &user, input)
        .await
        .map(|doc| (StatusCode::CREATED, Json(doc)))
        .map_err(map_service_error)
}

pub async fn update(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
    AppJson(input): AppJson<DocumentInput>,
) -> Result<StatusCode, ApiError> {
    document_service::update(&state.pool, &user, id, input)
        .await
        .map(|()| StatusCode::NO_CONTENT)
        .map_err(map_service_error)
}

pub async fn delete(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, ApiError> {
    document_service::delete(&state.pool, &user, id)
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

    fn registration(vehicle_id: Value) -> Value {
        json!({
            "vehicleId": vehicle_id, "documentType": "Registration",
            "documentNumber": "ABC 1234", "expiryDate": "2027-03-01"
        })
    }

    #[sqlx::test]
    async fn create_get_update_delete(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;

        let (status, doc) = app
            .call(
                Method::POST,
                "/api/Document",
                ME,
                Some(registration(json!(vid))),
            )
            .await;
        assert_eq!(status, StatusCode::CREATED);
        let url = format!("/api/document/{}", doc["id"]);
        assert_eq!(doc["vehicleId"], vid);

        let mut edit = registration(json!(vid));
        edit["expiryDate"] = json!("2028-03-01");
        let (status, _) = app.call(Method::PUT, &url, ME, Some(edit)).await;
        assert_eq!(status, StatusCode::NO_CONTENT);
        let (_, fetched) = app.call(Method::GET, &url, ME, None).await;
        assert!(fetched["expiryDate"].as_str().unwrap().starts_with("2028"));

        let (status, _) = app.call(Method::DELETE, &url, ME, None).await;
        assert_eq!(status, StatusCode::NO_CONTENT);
        assert_eq!(
            app.call(Method::GET, &url, ME, None).await.0,
            StatusCode::NOT_FOUND
        );
    }

    #[sqlx::test]
    async fn license_survives_vehicle_delete_but_registration_does_not(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        let license = json!({ "documentType": "Driver's License", "expiryDate": "2026-12-01" });
        app.call(Method::POST, "/api/document", ME, Some(license))
            .await;
        app.call(
            Method::POST,
            "/api/document",
            ME,
            Some(registration(json!(vid))),
        )
        .await;

        app.call(Method::DELETE, &format!("/api/vehicle/{vid}"), ME, None)
            .await;
        let (_, docs) = app.call(Method::GET, "/api/document", ME, None).await;
        assert_eq!(docs.as_array().unwrap().len(), 1);
        assert_eq!(docs[0]["documentType"], "Driver's License");
        assert_eq!(docs[0]["vehicleId"], Value::Null);
    }

    #[sqlx::test]
    async fn other_users_cannot_see_mine_or_attach_to_my_vehicle(pool: PgPool) {
        let app = TestApp::new(pool);
        let vid = my_vehicle(&app).await;
        let (_, doc) = app
            .call(
                Method::POST,
                "/api/document",
                ME,
                Some(registration(json!(vid))),
            )
            .await;
        let url = format!("/api/document/{}", doc["id"]);

        let (status, _) = app
            .call(
                Method::POST,
                "/api/document",
                OTHER,
                Some(registration(json!(vid))),
            )
            .await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        for method in [Method::GET, Method::DELETE] {
            assert_eq!(
                app.call(method, &url, OTHER, None).await.0,
                StatusCode::NOT_FOUND
            );
        }
        let (_, theirs) = app.call(Method::GET, "/api/document", OTHER, None).await;
        assert_eq!(theirs, json!([]));
    }

    #[sqlx::test]
    async fn list_is_soonest_expiry_first(pool: PgPool) {
        let app = TestApp::new(pool);
        for date in ["2028-01-01", "2026-12-01", "2027-06-01"] {
            let body = json!({ "documentType": "Insurance", "expiryDate": date });
            app.call(Method::POST, "/api/document", ME, Some(body))
                .await;
        }
        let (_, docs) = app.call(Method::GET, "/api/document", ME, None).await;
        let years: Vec<&str> = docs
            .as_array()
            .unwrap()
            .iter()
            .map(|d| &d["expiryDate"].as_str().unwrap()[..7])
            .collect();
        assert_eq!(years, ["2026-12", "2027-06", "2028-01"]);
    }
}
