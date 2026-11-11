//! A fill-up: when, at what odometer reading, how much fuel, and what it cost.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::helpers::flexible_datetime;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct RefuelLog {
    pub id: i32,
    pub vehicle_id: i32,
    pub date: DateTime<Utc>,
    pub odometer: i32,
    pub volume: f64,
    pub total_cost: f64,
    pub fuel_type: String,
    pub updated_at: DateTime<Utc>,
}

/// Request body for create and update. Unknown client fields are ignored.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct RefuelInput {
    pub id: Option<i64>,
    pub vehicle_id: Option<i32>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub date: Option<DateTime<Utc>>,
    pub odometer: Option<i32>,
    pub volume: Option<f64>,
    pub total_cost: Option<f64>,
    pub fuel_type: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct RefuelFields {
    pub vehicle_id: i32,
    pub date: DateTime<Utc>,
    pub odometer: i32,
    pub volume: f64,
    pub total_cost: f64,
    pub fuel_type: String,
}

impl RefuelInput {
    pub fn validate(self) -> Result<RefuelFields, String> {
        let mut errors = Vec::new();

        let vehicle_id = self.vehicle_id.filter(|id| *id > 0);
        if vehicle_id.is_none() {
            errors.push("Vehicle is required.");
        }
        if self.date.is_none() {
            errors.push("Date is required.");
        }
        let odometer = self.odometer.filter(|o| *o >= 0);
        if odometer.is_none() {
            errors.push("Odometer is required and cannot be negative.");
        }
        let volume = self.volume.filter(|v| v.is_finite() && *v > 0.0);
        if volume.is_none() {
            errors.push("Volume must be greater than zero.");
        }
        let total_cost = self.total_cost.filter(|c| c.is_finite() && *c >= 0.0);
        if total_cost.is_none() {
            errors.push("Total cost is required and cannot be negative.");
        }

        match (vehicle_id, self.date, odometer, volume, total_cost) {
            (Some(vehicle_id), Some(date), Some(odometer), Some(volume), Some(total_cost)) => {
                let fuel_type = self
                    .fuel_type
                    .map(|f| f.trim().to_string())
                    .filter(|f| !f.is_empty())
                    .unwrap_or_else(|| "Unleaded".into());
                Ok(RefuelFields {
                    vehicle_id,
                    date,
                    odometer,
                    volume,
                    total_cost,
                    fuel_type,
                })
            }
            _ => Err(errors.join(" ")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid() -> RefuelInput {
        serde_json::from_value(serde_json::json!({
            "id": 3, "serverId": null, "is_synced": 0,
            "vehicleId": 7,
            "date": "2026-11-10T08:30:00.000Z",
            "odometer": 15230,
            "volume": 4.2,
            "totalCost": 285.6
        }))
        .unwrap()
    }

    #[test]
    fn mobile_payload_is_valid_and_fuel_type_defaults() {
        let fields = valid().validate().unwrap();
        assert_eq!(fields.vehicle_id, 7);
        assert_eq!(fields.fuel_type, "Unleaded");
    }

    #[test]
    fn empty_body_lists_every_problem() {
        let err = RefuelInput::default().validate().unwrap_err();
        for expected in ["Vehicle", "Date", "Odometer", "Volume", "Total cost"] {
            assert!(err.contains(expected), "missing {expected:?} in {err:?}");
        }
    }

    #[test]
    fn zero_volume_and_negative_cost_are_rejected() {
        let input = RefuelInput {
            volume: Some(0.0),
            total_cost: Some(-1.0),
            ..valid()
        };
        let err = input.validate().unwrap_err();
        assert!(err.contains("Volume") && err.contains("Total cost"));
    }
}
