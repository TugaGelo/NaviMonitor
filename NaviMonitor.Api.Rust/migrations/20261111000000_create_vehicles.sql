CREATE TABLE vehicles (
    id                      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 TEXT NOT NULL,
    vehicle_type            TEXT NOT NULL,
    nickname                TEXT NOT NULL,
    make                    TEXT NOT NULL,
    model                   TEXT NOT NULL,
    year                    INT NOT NULL,
    color                   TEXT NOT NULL DEFAULT '',
    license_plate           TEXT NOT NULL DEFAULT '',
    engine_size_cc          INT NOT NULL,
    starting_odometer       INT NOT NULL,
    registration_expiry     TIMESTAMPTZ,
    insurance_expiry        TIMESTAMPTZ,
    has_synced_manual       BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_matrix_json TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Soft delete, so offline clients can learn about deletions when syncing down.
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX vehicles_user_id_idx ON vehicles (user_id) WHERE deleted_at IS NULL;
