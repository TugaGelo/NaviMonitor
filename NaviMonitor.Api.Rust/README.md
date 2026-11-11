# NaviMonitor API (Rust)

Replacement for the .NET `NaviMonitor.Api`. It serves the same routes and JSON so
the mobile and web apps only change their base URL.

Stack: Axum + Tokio, PostgreSQL + SQLx (hand-written SQL, migrations run at
startup), Firebase ID-token auth with an email allowlist.

## Run locally

```bash
docker compose up -d           # Postgres on localhost:5433
cp env.example .env             # then put your Google email in ALLOWED_EMAILS
cargo run
curl localhost:8080/health     # {"status":"ok","database":"up"}
```

`GET /api/me` with `Authorization: Bearer <firebase id token>` returns your
user id and email. It's the quickest way to check sign-in from a client.

## Layout

Follows the Whisker Works layer contract, by file suffix:

| Path | Holds |
| --- | --- |
| `src/api/` | handlers: extract, validate, call one service, map errors to `ApiError` |
| `src/modules/<feature>/*_service.rs` | workflow and transactions; returns a `thiserror` enum |
| `src/modules/<feature>/*_policy.rs` | pure decisions (ownership etc.), no I/O |
| `src/modules/<feature>/*_repo.rs` | SQL only |
| `src/shared_kernel/` | shared contracts (`CurrentUser`, `TokenVerifier`), no I/O |
| `src/infrastructure/` | machinery behind contracts (Firebase key fetching) |
| `src/auth/` | bearer token → verified identity → allowlist → `CurrentUser` |

## Rules every endpoint follows

- Takes a `CurrentUser` argument, so it's authenticated and allowlisted.
- Reads and writes only rows where `user_id` = the caller. Another user's id
  returns 404, not 403, so ids can't be probed.

## Checks (same as CI)

```bash
cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test
```

Database tests (`db_tests` modules, using `#[sqlx::test]`) need Postgres running
(`docker compose up -d`) and `DATABASE_URL` set; each test gets a fresh database.
To run only the tests that don't need a database: `cargo test -- --skip db_tests`.
