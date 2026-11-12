# Build stage: compile a release binary. Migrations are embedded by sqlx::migrate!.
FROM rust:1.99-slim-trixie AS build
WORKDIR /app
COPY . .
# shortcut: rebuilds every dependency on each deploy (~5 min on Render); add cargo-chef if that gets annoying.
RUN cargo build --release --locked

# Runtime stage: just the binary and the CA certificates reqwest uses to reach Google.
FROM debian:trixie-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/target/release/navimonitor_api /usr/local/bin/navimonitor_api
# Render sets PORT; Config reads it.
USER nobody
CMD ["navimonitor_api"]
