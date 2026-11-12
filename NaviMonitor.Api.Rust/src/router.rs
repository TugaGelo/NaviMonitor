use axum::{
    Router,
    extract::{DefaultBodyLimit, Request},
    http::{HeaderValue, Method, Uri, header},
    routing::get,
};
use tower::Layer;
use tower::util::MapRequestLayer;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::{
    api::{document_api, health_api, maintenance_api, refuel_api, settings_api, vehicle_api},
    app_state::AppState,
    modules::maintenance::manual_policy,
};

pub fn build_router(state: AppState) -> Router {
    let cors = cors_layer(&state.config.cors_origins);

    let routes = Router::new()
        .route("/health", get(health_api::health))
        .route("/api/me", get(health_api::me))
        .route(
            "/api/settings",
            get(settings_api::get).put(settings_api::update),
        )
        .route(
            "/api/vehicle",
            get(vehicle_api::list).post(vehicle_api::create),
        )
        .route(
            "/api/vehicle/{id}",
            get(vehicle_api::get)
                .put(vehicle_api::update)
                .delete(vehicle_api::delete),
        )
        .route(
            "/api/refuel",
            get(refuel_api::list).post(refuel_api::create),
        )
        .route(
            "/api/refuel/{id}",
            axum::routing::put(refuel_api::update).delete(refuel_api::delete),
        )
        .route(
            "/api/refuel/vehicle/{vehicle_id}",
            get(refuel_api::list_for_vehicle),
        )
        .route(
            "/api/maintenance",
            get(maintenance_api::list).post(maintenance_api::create),
        )
        .route(
            "/api/maintenance/{id}",
            get(maintenance_api::get)
                .put(maintenance_api::update)
                .delete(maintenance_api::delete),
        )
        .route(
            "/api/maintenance/vehicle/{vehicle_id}",
            get(maintenance_api::list_for_vehicle),
        )
        .route(
            "/api/maintenance/analyze",
            // Photos need more than the default 2 MB body limit; 1 MB covers the multipart framing.
            axum::routing::post(maintenance_api::analyze).layer(DefaultBodyLimit::max(
                manual_policy::MAX_TOTAL_BYTES + 1024 * 1024,
            )),
        )
        .route(
            "/api/maintenance/vehicle/{vehicle_id}/matrix",
            axum::routing::post(maintenance_api::save_matrix),
        )
        .route(
            "/api/document",
            get(document_api::list).post(document_api::create),
        )
        .route(
            "/api/document/{id}",
            get(document_api::get)
                .put(document_api::update)
                .delete(document_api::delete),
        )
        .route(
            "/api/document/vehicle/{vehicle_id}",
            get(document_api::list_for_vehicle),
        )
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    // Router layers run after routing, so the path rewrite wraps the whole router instead.
    Router::new().fallback_service(MapRequestLayer::new(lowercase_path).layer(routes))
}

/// ASP.NET routes were case-insensitive and the mobile app calls `/api/Vehicle`,
/// while the web app calls `/api/vehicle`. Lowercase the path so both match.
fn lowercase_path(mut req: Request) -> Request {
    let uri = req.uri();
    if !uri.path().bytes().any(|b| b.is_ascii_uppercase()) {
        return req;
    }
    let path = uri.path().to_ascii_lowercase();
    let path_and_query = match uri.query() {
        Some(q) => format!("{path}?{q}"),
        None => path,
    };
    let mut parts = uri.clone().into_parts();
    // Lowercasing ASCII letters can't make a valid path invalid.
    parts.path_and_query = path_and_query.parse().ok();
    if let Ok(uri) = Uri::from_parts(parts) {
        *req.uri_mut() = uri;
    }
    req
}

/// Only the listed browser origins may call the API. Native apps send no
/// Origin header, so CORS doesn't affect them.
fn cors_layer(origins: &[String]) -> CorsLayer {
    let origins: Vec<HeaderValue> = origins
        .iter()
        .filter_map(|o| match o.parse() {
            Ok(v) => Some(v),
            Err(_) => {
                tracing::warn!(origin = %o, "ignoring invalid CORS origin");
                None
            }
        })
        .collect();

    CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
}

#[cfg(test)]
mod tests {
    use axum::http::{Method, StatusCode};

    use crate::test_support::{ME, TestApp};

    async fn get_me(token: Option<&str>) -> (StatusCode, serde_json::Value) {
        TestApp::without_db()
            .call(Method::GET, "/api/me", token, None)
            .await
    }

    #[tokio::test]
    async fn missing_token_is_401() {
        assert_eq!(get_me(None).await.0, StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn invalid_token_is_401() {
        assert_eq!(get_me(Some("nope")).await.0, StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn valid_token_not_on_allowlist_is_403() {
        let (status, _) = get_me(Some("good:stranger@gmail.com")).await;
        assert_eq!(status, StatusCode::FORBIDDEN);
    }

    #[tokio::test]
    async fn allowlisted_user_gets_their_identity() {
        let (status, json) = get_me(ME).await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(json["userId"], "uid-me@gmail.com");
        assert_eq!(json["email"], "me@gmail.com");
    }

    #[tokio::test]
    async fn routes_are_case_insensitive_like_aspnet() {
        let (status, _) = TestApp::without_db()
            .call(Method::GET, "/API/Me?x=1", ME, None)
            .await;
        assert_eq!(status, StatusCode::OK);
    }

    #[tokio::test]
    async fn malformed_json_is_a_400_with_our_error_shape() {
        let app = TestApp::without_db();
        // Auth runs before the body is read, and the body fails before any DB call.
        let (status, json) = app
            .call(
                Method::POST,
                "/api/vehicle",
                ME,
                Some(serde_json::json!({"year": "old"})),
            )
            .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(json["message"].is_string());
    }
}
