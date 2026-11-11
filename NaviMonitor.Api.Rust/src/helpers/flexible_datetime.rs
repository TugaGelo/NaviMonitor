//! Lenient date parsing for request bodies.
//!
//! The .NET API emitted dates without a timezone ("2026-05-01T00:00:00"), so
//! clients may echo that, an ISO string with "Z", or a bare date.

use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use serde::{Deserialize, Deserializer, de::Error};

/// RFC 3339, a naive date-time (taken as UTC), or a bare date (midnight UTC).
pub fn parse(s: &str) -> Option<DateTime<Utc>> {
    let s = s.trim();
    DateTime::parse_from_rfc3339(s)
        .map(|d| d.with_timezone(&Utc))
        .ok()
        .or_else(|| {
            NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S%.f")
                .ok()
                .map(|n| n.and_utc())
        })
        .or_else(|| {
            NaiveDate::parse_from_str(s, "%Y-%m-%d")
                .ok()
                .map(|d| d.and_time(chrono::NaiveTime::MIN).and_utc())
        })
}

/// `#[serde(deserialize_with = "...::option")]`: null, missing or "" become `None`.
pub fn option<'de, D: Deserializer<'de>>(d: D) -> Result<Option<DateTime<Utc>>, D::Error> {
    match Option::<String>::deserialize(d)? {
        None => Ok(None),
        Some(s) if s.trim().is_empty() => Ok(None),
        Some(s) => parse(&s)
            .map(Some)
            .ok_or_else(|| D::Error::custom(format!("invalid date {s:?}"))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_the_three_shapes_clients_send() {
        let expected = "2026-05-01T00:00:00Z";
        assert_eq!(
            parse("2026-05-01T00:00:00Z").unwrap().to_rfc3339(),
            parse(expected).unwrap().to_rfc3339()
        );
        assert_eq!(
            parse("2026-05-01T00:00:00").unwrap(),
            parse(expected).unwrap()
        );
        assert_eq!(parse("2026-05-01").unwrap(), parse(expected).unwrap());
        assert_eq!(
            parse("2026-05-01T08:00:00+08:00").unwrap(),
            parse(expected).unwrap()
        );
    }

    #[test]
    fn rejects_garbage() {
        assert!(parse("next tuesday").is_none());
    }
}
