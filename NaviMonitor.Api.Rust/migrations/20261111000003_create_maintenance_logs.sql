CREATE TABLE maintenance_logs (
    id                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id            INT NOT NULL REFERENCES vehicles (id),
    log_type              TEXT NOT NULL DEFAULT 'Maintenance', -- 'Maintenance' or 'Modification'
    service_category      TEXT,
    date                  TIMESTAMPTZ NOT NULL,
    odometer              INT NOT NULL,
    service_type          TEXT NOT NULL,
    price                 DOUBLE PRECISION NOT NULL,
    is_diy                BOOLEAN NOT NULL DEFAULT FALSE,
    shop_name             TEXT,
    mechanic_name         TEXT,
    contact_number        TEXT,
    notes                 TEXT,
    next_service_odometer INT,
    next_service_date     TIMESTAMPTZ,
    tire_position         TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at            TIMESTAMPTZ
);

CREATE INDEX maintenance_logs_vehicle_id_idx ON maintenance_logs (vehicle_id) WHERE deleted_at IS NULL;
