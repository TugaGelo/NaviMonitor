-- One row per user, created with these defaults on first GET /api/settings.
CREATE TABLE user_settings (
    user_id            TEXT PRIMARY KEY,
    distance_unit      TEXT NOT NULL DEFAULT 'km',
    volume_unit        TEXT NOT NULL DEFAULT 'L',
    currency           TEXT NOT NULL DEFAULT 'PHP',
    -- JSON arrays of strings, stored as text because the clients send and parse them that way.
    fuel_types_json    TEXT NOT NULL DEFAULT '["Unleaded","Premium","Diesel"]',
    service_types_json TEXT NOT NULL DEFAULT '["Oil Change","Tire Rotation","Brake Inspection","Battery Replacement"]',
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
