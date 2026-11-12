-- Expiry tracking only (no files). vehicle_id is NULL for personal documents like a driver's license,
-- so ownership lives on the row itself instead of going through the vehicle.
CREATE TABLE documents (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         TEXT NOT NULL,
    vehicle_id      INT REFERENCES vehicles (id),
    document_type   TEXT NOT NULL,
    document_number TEXT,
    issue_date      TIMESTAMPTZ,
    expiry_date     TIMESTAMPTZ NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX documents_user_id_idx ON documents (user_id) WHERE deleted_at IS NULL;
