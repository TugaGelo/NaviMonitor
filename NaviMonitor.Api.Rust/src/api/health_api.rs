use axum::{Json, extract::State};
use serde::Serialize;

use crate::{api::error::ApiError, app_state::AppState, shared_kernel::current_user::CurrentUser};

#[derive(Serialize)]
pub struct Health {
    status: &'static str,
    database: &'static str,
}

/// `GET /health` — public. Render uses it as the health check.
pub async fn health(State(state): State<AppState>) -> Json<Health> {
    let database = match sqlx::query("SELECT 1").execute(&state.pool).await {
        Ok(_) => "up",
        Err(e) => {
            tracing::warn!(error = %e, "health check: database down");
            "down"
        }
    };
    Json(Health {
        status: "ok",
        database,
    })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Me {
    user_id: String,
    email: String,
}

/// `GET /api/me` — who the API thinks you are. Handy for testing sign-in.
pub async fn me(user: CurrentUser) -> Result<Json<Me>, ApiError> {
    Ok(Json(Me {
        user_id: user.uid,
        email: user.email,
    }))
}
