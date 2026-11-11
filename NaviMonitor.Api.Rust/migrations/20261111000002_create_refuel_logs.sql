CREATE TABLE refuel_logs (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id  INT NOT NULL REFERENCES vehicles (id),
    date        TIMESTAMPTZ NOT NULL,
    odometer    INT NOT NULL,
    volume      DOUBLE PRECISION NOT NULL,
    total_cost  DOUBLE PRECISION NOT NULL,
    fuel_type   TEXT NOT NULL DEFAULT 'Unleaded',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX refuel_logs_vehicle_id_idx ON refuel_logs (vehicle_id) WHERE deleted_at IS NULL;
