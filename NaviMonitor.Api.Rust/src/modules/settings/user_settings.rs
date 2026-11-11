//! Per-user settings: units, currency, and the pick lists for fuel and service types.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct UserSettings {
    pub user_id: String,
    pub distance_unit: String,
    pub volume_unit: String,
    pub currency: String,
    pub fuel_types_json: String,
    pub service_types_json: String,
}

/// PUT body. A missing field keeps its stored value.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct SettingsInput {
    pub user_id: Option<String>,
    pub distance_unit: Option<String>,
    pub volume_unit: Option<String>,
    pub currency: Option<String>,
    pub fuel_types_json: Option<String>,
    pub service_types_json: Option<String>,
}

/// Validated changes. `None` = leave as is.
#[derive(Debug, Default, PartialEq)]
pub struct SettingsPatch {
    pub distance_unit: Option<String>,
    pub volume_unit: Option<String>,
    pub currency: Option<String>,
    pub fuel_types_json: Option<String>,
    pub service_types_json: Option<String>,
}

impl SettingsInput {
    pub fn validate(self) -> Result<SettingsPatch, String> {
        let mut errors = Vec::new();

        let mut text = |value: Option<String>, label: &str| {
            let value = value?.trim().to_string();
            if value.is_empty() {
                errors.push(format!("{label} cannot be empty."));
            }
            Some(value)
        };
        let distance_unit = text(self.distance_unit, "Distance unit");
        let volume_unit = text(self.volume_unit, "Volume unit");
        let currency = text(self.currency, "Currency");

        // The web app JSON.parse()s these, so anything else would break it on next load.
        let mut string_list = |value: Option<String>, label: &str| {
            let value = value?;
            match serde_json::from_str::<Vec<String>>(&value) {
                Ok(_) => Some(value),
                Err(_) => {
                    errors.push(format!("{label} must be a JSON array of strings."));
                    None
                }
            }
        };
        let fuel_types_json = string_list(self.fuel_types_json, "Fuel types");
        let service_types_json = string_list(self.service_types_json, "Service types");

        if !errors.is_empty() {
            return Err(errors.join(" "));
        }
        Ok(SettingsPatch {
            distance_unit,
            volume_unit,
            currency,
            fuel_types_json,
            service_types_json,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_fields_mean_no_change() {
        assert_eq!(
            SettingsInput::default().validate().unwrap(),
            SettingsPatch::default()
        );
    }

    #[test]
    fn accepts_what_the_web_app_sends() {
        let input: SettingsInput = serde_json::from_value(serde_json::json!({
            "userId": "uid-1",
            "distanceUnit": "mi",
            "volumeUnit": "gal",
            "currency": "USD",
            "fuelTypesJson": "[\"Unleaded\",\"E10\"]",
            "serviceTypesJson": "[]",
            "fuelTypes": ["Unleaded", "E10"]
        }))
        .unwrap();
        let patch = input.validate().unwrap();
        assert_eq!(patch.distance_unit.as_deref(), Some("mi"));
        assert_eq!(patch.service_types_json.as_deref(), Some("[]"));
    }

    #[test]
    fn rejects_blank_units_and_bad_lists() {
        let input = SettingsInput {
            currency: Some("  ".into()),
            fuel_types_json: Some("Unleaded, Diesel".into()),
            service_types_json: Some("[1, 2]".into()),
            ..Default::default()
        };
        let err = input.validate().unwrap_err();
        assert!(
            err.contains("Currency") && err.contains("Fuel types") && err.contains("Service types")
        );
    }
}
