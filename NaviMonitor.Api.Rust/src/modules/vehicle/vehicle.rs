//! Vehicle domain types: the stored row, the request body, and its validation.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::helpers::flexible_datetime;

/// A stored vehicle, serialized with the same camelCase keys the .NET API used.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Vehicle {
    pub id: i32,
    pub user_id: String,
    pub vehicle_type: String,
    pub nickname: String,
    pub make: String,
    pub model: String,
    pub year: i32,
    pub color: String,
    pub license_plate: String,
    #[serde(rename = "engineSizeCC")]
    pub engine_size_cc: i32,
    pub starting_odometer: i32,
    pub registration_expiry: Option<DateTime<Utc>>,
    pub insurance_expiry: Option<DateTime<Utc>>,
    pub has_synced_manual: bool,
    pub maintenance_matrix_json: Option<String>,
    pub updated_at: DateTime<Utc>,
}

/// Request body for create and update. Everything is optional here so a
/// missing field becomes a readable 400 from `validate`, not a serde error.
/// Unknown fields (the mobile app sends `serverId`, `is_synced`, `userId`) are ignored.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct VehicleInput {
    pub id: Option<i64>,
    pub vehicle_type: Option<String>,
    pub nickname: Option<String>,
    pub make: Option<String>,
    pub model: Option<String>,
    pub year: Option<i32>,
    pub color: Option<String>,
    pub license_plate: Option<String>,
    #[serde(rename = "engineSizeCC")]
    pub engine_size_cc: Option<i32>,
    pub starting_odometer: Option<i32>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub registration_expiry: Option<DateTime<Utc>>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub insurance_expiry: Option<DateTime<Utc>>,
    pub has_synced_manual: Option<bool>,
    pub maintenance_matrix_json: Option<String>,
}

/// A validated vehicle, ready to store.
#[derive(Debug, Clone, PartialEq)]
pub struct VehicleFields {
    pub vehicle_type: String,
    pub nickname: String,
    pub make: String,
    pub model: String,
    pub year: i32,
    pub color: String,
    pub license_plate: String,
    pub engine_size_cc: i32,
    pub starting_odometer: i32,
    pub registration_expiry: Option<DateTime<Utc>>,
    pub insurance_expiry: Option<DateTime<Utc>>,
    /// `None` on update keeps the stored value, so editing a vehicle from a
    /// form that doesn't know about the matrix can't wipe it.
    pub has_synced_manual: Option<bool>,
    pub maintenance_matrix_json: Option<String>,
}

impl VehicleInput {
    /// Same rules as the .NET model's data annotations. Returns every problem at once.
    pub fn validate(self) -> Result<VehicleFields, String> {
        let mut errors = Vec::new();

        let mut required = |value: Option<String>, label: &str| {
            let value = value.unwrap_or_default().trim().to_string();
            if value.is_empty() {
                errors.push(format!("{label} is required."));
            }
            value
        };
        let vehicle_type = required(self.vehicle_type, "Vehicle type");
        let nickname = required(self.nickname, "Nickname");
        let make = required(self.make, "Make");
        let model = required(self.model, "Model");

        let nickname_len = nickname.chars().count();
        if nickname_len > 0 && !(2..=50).contains(&nickname_len) {
            errors.push("Nickname must be 2 to 50 characters.".into());
        }

        let mut in_range =
            |value: Option<i32>, range: std::ops::RangeInclusive<i32>, label: &str| {
                let value = value.unwrap_or(0);
                if !range.contains(&value) {
                    errors.push(format!(
                        "{label} must be between {} and {}.",
                        range.start(),
                        range.end()
                    ));
                }
                value
            };
        let year = in_range(self.year, 1900..=2100, "Year");
        let engine_size_cc = in_range(self.engine_size_cc, 1..=20_000, "Engine size (cc)");
        let starting_odometer =
            in_range(self.starting_odometer, 0..=1_000_000, "Starting odometer");

        if !errors.is_empty() {
            return Err(errors.join(" "));
        }

        Ok(VehicleFields {
            vehicle_type,
            nickname,
            make,
            model,
            year,
            color: self.color.unwrap_or_default().trim().to_string(),
            license_plate: self.license_plate.unwrap_or_default().trim().to_string(),
            engine_size_cc,
            starting_odometer,
            registration_expiry: self.registration_expiry,
            insurance_expiry: self.insurance_expiry,
            has_synced_manual: self.has_synced_manual,
            maintenance_matrix_json: self.maintenance_matrix_json,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid() -> VehicleInput {
        serde_json::from_value(serde_json::json!({
            "vehicleType": "Motorcycle",
            "nickname": "Navi",
            "make": "Honda",
            "model": "Click 125i",
            "year": 2022,
            "engineSizeCC": 125,
            "startingOdometer": 1200,
            "registrationExpiry": "2026-05-01T00:00:00",
            "serverId": 7,
            "is_synced": 0
        }))
        .unwrap()
    }

    #[test]
    fn valid_input_passes_and_ignores_client_only_fields() {
        let fields = valid().validate().unwrap();
        assert_eq!(fields.nickname, "Navi");
        assert_eq!(fields.engine_size_cc, 125);
        assert_eq!(fields.color, "");
        assert!(fields.registration_expiry.is_some());
        assert_eq!(fields.has_synced_manual, None);
    }

    #[test]
    fn empty_body_lists_every_problem() {
        let err = VehicleInput::default().validate().unwrap_err();
        for expected in [
            "Vehicle type",
            "Nickname",
            "Make",
            "Model",
            "Year",
            "Engine size",
        ] {
            assert!(err.contains(expected), "missing {expected:?} in {err:?}");
        }
    }

    #[test]
    fn blank_strings_count_as_missing() {
        let input = VehicleInput {
            make: Some("   ".into()),
            ..valid()
        };
        assert!(input.validate().unwrap_err().contains("Make is required"));
    }

    #[test]
    fn nickname_length_is_enforced() {
        let short = VehicleInput {
            nickname: Some("N".into()),
            ..valid()
        };
        assert!(short.validate().unwrap_err().contains("2 to 50"));
    }

    #[test]
    fn ranges_are_enforced() {
        let input = VehicleInput {
            year: Some(1800),
            starting_odometer: Some(-1),
            ..valid()
        };
        let err = input.validate().unwrap_err();
        assert!(err.contains("Year") && err.contains("Starting odometer"));
    }

    #[test]
    fn serializes_with_dotnet_key_names() {
        let vehicle = Vehicle {
            id: 1,
            user_id: "u".into(),
            vehicle_type: "Motorcycle".into(),
            nickname: "Navi".into(),
            make: "Honda".into(),
            model: "Click".into(),
            year: 2022,
            color: String::new(),
            license_plate: String::new(),
            engine_size_cc: 125,
            starting_odometer: 0,
            registration_expiry: None,
            insurance_expiry: None,
            has_synced_manual: false,
            maintenance_matrix_json: None,
            updated_at: Utc::now(),
        };
        let json = serde_json::to_value(&vehicle).unwrap();
        for key in [
            "engineSizeCC",
            "startingOdometer",
            "licensePlate",
            "maintenanceMatrixJson",
            "userId",
        ] {
            assert!(json.get(key).is_some(), "missing key {key}");
        }
    }
}
