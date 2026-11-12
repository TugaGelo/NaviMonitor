//! A document with an expiry date: registration, insurance, driver's license, and so on.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::helpers::flexible_datetime;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub id: i32,
    /// None for personal documents such as a driver's license.
    pub vehicle_id: Option<i32>,
    pub document_type: String,
    pub document_number: Option<String>,
    pub issue_date: Option<DateTime<Utc>>,
    pub expiry_date: DateTime<Utc>,
    pub notes: Option<String>,
    pub updated_at: DateTime<Utc>,
}

/// Request body for create and update. Unknown client fields are ignored.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct DocumentInput {
    pub id: Option<i64>,
    pub vehicle_id: Option<i32>,
    pub document_type: Option<String>,
    pub document_number: Option<String>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub issue_date: Option<DateTime<Utc>>,
    #[serde(deserialize_with = "flexible_datetime::option")]
    pub expiry_date: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct DocumentFields {
    pub vehicle_id: Option<i32>,
    pub document_type: String,
    pub document_number: Option<String>,
    pub issue_date: Option<DateTime<Utc>>,
    pub expiry_date: DateTime<Utc>,
    pub notes: Option<String>,
}

/// The phone's SQLite stores "" for unset text; treat it as absent.
fn optional_text(value: Option<String>) -> Option<String> {
    value
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
}

impl DocumentInput {
    pub fn validate(self) -> Result<DocumentFields, String> {
        let mut errors = Vec::new();

        // The phone sends 0 for "no vehicle", so treat 0 like null.
        let vehicle_id = self.vehicle_id.filter(|id| *id != 0);
        if vehicle_id.is_some_and(|id| id < 0) {
            errors.push("Vehicle id is invalid.");
        }
        let document_type = optional_text(self.document_type);
        if document_type.is_none() {
            errors.push("Document type is required.");
        } else if document_type
            .as_ref()
            .is_some_and(|t| t.chars().count() > 50)
        {
            errors.push("Document type must be 50 characters or fewer.");
        }
        if self.expiry_date.is_none() {
            errors.push("Expiry date is required.");
        }
        if let (Some(issued), Some(expires)) = (self.issue_date, self.expiry_date)
            && issued > expires
        {
            errors.push("Issue date must be before the expiry date.");
        }

        match (document_type, self.expiry_date) {
            (Some(document_type), Some(expiry_date)) if errors.is_empty() => Ok(DocumentFields {
                vehicle_id,
                document_type,
                document_number: optional_text(self.document_number),
                issue_date: self.issue_date,
                expiry_date,
                notes: optional_text(self.notes),
            }),
            _ => Err(errors.join(" ")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn license() -> DocumentInput {
        serde_json::from_value(serde_json::json!({
            "vehicleId": null,
            "documentType": "Driver's License",
            "documentNumber": "",
            "issueDate": "2024-01-15",
            "expiryDate": "2034-01-15T00:00:00.000Z"
        }))
        .unwrap()
    }

    #[test]
    fn personal_document_without_vehicle_is_valid() {
        let fields = license().validate().unwrap();
        assert_eq!(fields.vehicle_id, None);
        assert_eq!(fields.document_number, None);
        assert!(fields.issue_date.is_some());
    }

    #[test]
    fn zero_vehicle_id_means_no_vehicle() {
        let fields = DocumentInput {
            vehicle_id: Some(0),
            ..license()
        }
        .validate()
        .unwrap();
        assert_eq!(fields.vehicle_id, None);
    }

    #[test]
    fn empty_body_lists_every_problem() {
        let err = DocumentInput::default().validate().unwrap_err();
        assert!(err.contains("Document type") && err.contains("Expiry date"));
    }

    #[test]
    fn issue_after_expiry_is_rejected() {
        let input = DocumentInput {
            issue_date: flexible_datetime::parse("2035-01-01"),
            ..license()
        };
        assert!(input.validate().unwrap_err().contains("Issue date"));
    }
}
