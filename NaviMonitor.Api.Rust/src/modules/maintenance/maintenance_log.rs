//! A service or modification done to a vehicle.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::helpers::flexible_datetime;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct MaintenanceLog {
    pub id: i32,
    pub vehicle_id: i32,
    pub log_type: String,
    pub service_category: Option<String>,
    pub date: DateTime<Utc>,
    pub odometer: i32,
    pub service_type: String,
    pub price: f64,
    #[serde(rename = "isDIY")]
    pub is_diy: bool,
    pub shop_name: Option<String>,
    pub mechanic_name: Option<String>,
    pub contact_number: Option<String>,
    pub notes: Option<String>,
    pub next_service_odometer: Option<i32>,
    pub next_service_date: Option<DateTime<Utc>>,
    pub tire_position: Option<String>,
    pub updated_at: DateTime<Utc>,
}

/// Request body for create and update. Unknown client fields are ignored.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct MaintenanceInput {
    pub id: Option<i64>,
    pub vehicle_id: Option<i32>,
    pub log_type: Option<String>,
    pub service_category: Option<String>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub date: Option<DateTime<Utc>>,
    pub odometer: Option<i32>,
    pub service_type: Option<String>,
    pub price: Option<f64>,
    #[serde(rename = "isDIY")]
    pub is_diy: Option<bool>,
    pub shop_name: Option<String>,
    pub mechanic_name: Option<String>,
    pub contact_number: Option<String>,
    pub notes: Option<String>,
    pub next_service_odometer: Option<i32>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub next_service_date: Option<DateTime<Utc>>,
    pub tire_position: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct MaintenanceFields {
    pub vehicle_id: i32,
    pub log_type: String,
    pub service_category: Option<String>,
    pub date: DateTime<Utc>,
    pub odometer: i32,
    pub service_type: String,
    pub price: f64,
    pub is_diy: bool,
    pub shop_name: Option<String>,
    pub mechanic_name: Option<String>,
    pub contact_number: Option<String>,
    pub notes: Option<String>,
    pub next_service_odometer: Option<i32>,
    pub next_service_date: Option<DateTime<Utc>>,
    pub tire_position: Option<String>,
}

/// The phone's SQLite stores "" for unset text; treat it as absent.
fn optional_text(value: Option<String>) -> Option<String> {
    value
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
}

impl MaintenanceInput {
    pub fn validate(self) -> Result<MaintenanceFields, String> {
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
        let service_type = optional_text(self.service_type);
        if service_type.is_none() {
            errors.push("Service type is required.");
        }
        let price = self.price.filter(|p| p.is_finite() && *p >= 0.0);
        if price.is_none() {
            errors.push("Price is required and cannot be negative.");
        }
        if self.next_service_odometer.is_some_and(|o| o < 0) {
            errors.push("Next service odometer cannot be negative.");
        }

        match (vehicle_id, self.date, odometer, service_type, price) {
            (Some(vehicle_id), Some(date), Some(odometer), Some(service_type), Some(price))
                if errors.is_empty() =>
            {
                Ok(MaintenanceFields {
                    vehicle_id,
                    log_type: optional_text(self.log_type).unwrap_or_else(|| "Maintenance".into()),
                    service_category: optional_text(self.service_category),
                    date,
                    odometer,
                    service_type,
                    price,
                    is_diy: self.is_diy.unwrap_or(false),
                    shop_name: optional_text(self.shop_name),
                    mechanic_name: optional_text(self.mechanic_name),
                    contact_number: optional_text(self.contact_number),
                    notes: optional_text(self.notes),
                    next_service_odometer: self.next_service_odometer,
                    next_service_date: self.next_service_date,
                    tire_position: optional_text(self.tire_position),
                })
            }
            _ => Err(errors.join(" ")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid() -> MaintenanceInput {
        serde_json::from_value(serde_json::json!({
            "id": 4, "is_synced": 0,
            "vehicleId": 7,
            "logType": "Maintenance",
            "date": "2026-11-01T00:00:00.000Z",
            "odometer": 15000,
            "serviceType": "Oil Change",
            "price": 450,
            "isDIY": true,
            "shopName": "",
            "nextServiceOdometer": 17000,
            "nextServiceDate": ""
        }))
        .unwrap()
    }

    #[test]
    fn mobile_payload_is_valid_and_blanks_become_none() {
        let fields = valid().validate().unwrap();
        assert!(fields.is_diy);
        assert_eq!(fields.price, 450.0);
        assert_eq!(fields.shop_name, None);
        assert_eq!(fields.next_service_date, None);
        assert_eq!(fields.next_service_odometer, Some(17000));
    }

    #[test]
    fn log_type_defaults_to_maintenance() {
        let fields = MaintenanceInput {
            log_type: None,
            ..valid()
        }
        .validate()
        .unwrap();
        assert_eq!(fields.log_type, "Maintenance");
    }

    #[test]
    fn empty_body_lists_every_problem() {
        let err = MaintenanceInput::default().validate().unwrap_err();
        for expected in ["Vehicle", "Date", "Odometer", "Service type", "Price"] {
            assert!(err.contains(expected), "missing {expected:?} in {err:?}");
        }
    }

    #[test]
    fn negative_next_service_odometer_is_rejected() {
        let input = MaintenanceInput {
            next_service_odometer: Some(-5),
            ..valid()
        };
        assert!(input.validate().unwrap_err().contains("Next service"));
    }
}
