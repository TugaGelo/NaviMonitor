//! `/api/settings` — same contract as the .NET SettingsController.

use axum::{Json, extract::State};

use crate::{
    api::{error::ApiError, json::AppJson},
    app_state::AppState,
    modules::settings::{
        settings_service::{self, SettingsError},
        user_settings::{SettingsInput, UserSettings},
    },
    shared_kernel::current_user::CurrentUser,
};

fn map_service_error(e: SettingsError) -> ApiError {
    match e {
        SettingsError::NotYours => ApiError::Forbidden(e.to_string()),
        SettingsError::Invalid(msg) => ApiError::BadRequest(msg),
        SettingsError::Database(e) => e.into(),
    }
}

pub async fn get(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<UserSettings>, ApiError> {
    settings_service::get(&state.pool, &user)
        .await
        .map(Json)
        .map_err(map_service_error)
}

pub async fn update(
    State(state): State<AppState>,
    user: CurrentUser,
    AppJson(input): AppJson<SettingsInput>,
) -> Result<Json<UserSettings>, ApiError> {
    settings_service::update(&state.pool, &user, input)
        .await
        .map(Json)
        .map_err(map_service_error)
}

#[cfg(test)]
mod db_tests {
    use axum::http::{Method, StatusCode};
    use serde_json::json;
    use sqlx::PgPool;

    use crate::test_support::{ME, OTHER, TestApp};

    #[sqlx::test]
    async fn first_get_creates_defaults(pool: PgPool) {
        let app = TestApp::new(pool);
        let (status, settings) = app.call(Method::GET, "/api/Settings", ME, None).await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(settings["userId"], "uid-me@gmail.com");
        assert_eq!(settings["distanceUnit"], "km");
        assert_eq!(settings["currency"], "PHP");
        assert_eq!(
            settings["fuelTypesJson"],
            "[\"Unleaded\",\"Premium\",\"Diesel\"]"
        );
    }

    #[sqlx::test]
    async fn put_changes_only_what_is_sent_and_only_for_me(pool: PgPool) {
        let app = TestApp::new(pool);
        let (status, updated) = app
            .call(
                Method::PUT,
                "/api/settings",
                ME,
                Some(json!({ "userId": "uid-me@gmail.com", "distanceUnit": "mi" })),
            )
            .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(updated["distanceUnit"], "mi");
        assert_eq!(updated["currency"], "PHP");

        let (_, theirs) = app.call(Method::GET, "/api/settings", OTHER, None).await;
        assert_eq!(theirs["distanceUnit"], "km");
    }

    #[sqlx::test]
    async fn put_naming_another_user_is_403(pool: PgPool) {
        let app = TestApp::new(pool);
        let body = json!({ "userId": "uid-friend@gmail.com", "currency": "USD" });
        let (status, _) = app.call(Method::PUT, "/api/settings", ME, Some(body)).await;
        assert_eq!(status, StatusCode::FORBIDDEN);
    }

    #[sqlx::test]
    async fn put_with_bad_list_is_400(pool: PgPool) {
        let app = TestApp::new(pool);
        let body = json!({ "fuelTypesJson": "not json" });
        let (status, _) = app.call(Method::PUT, "/api/settings", ME, Some(body)).await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }
}
