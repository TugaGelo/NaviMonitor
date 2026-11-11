//! Runtime configuration, read once from the environment at startup.

use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub firebase_project_id: String,
    /// Lower-cased emails allowed to use the API. Empty means nobody is allowed.
    pub allowed_emails: Vec<String>,
    /// Browser origins allowed by CORS. Mobile clients don't need an entry.
    pub cors_origins: Vec<String>,
    pub gemini_api_key: Option<String>,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("missing required environment variable {0}")]
    Missing(&'static str),
    #[error("environment variable {name} is invalid: {reason}")]
    Invalid { name: &'static str, reason: String },
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_lookup(|key| env::var(key).ok())
    }

    /// Builds a config from any key lookup, so tests don't touch the process env.
    pub fn from_lookup(lookup: impl Fn(&str) -> Option<String>) -> Result<Self, ConfigError> {
        let required = |name: &'static str| {
            lookup(name)
                .filter(|v| !v.trim().is_empty())
                .ok_or(ConfigError::Missing(name))
        };

        let port = match lookup("PORT") {
            Some(raw) => raw.trim().parse().map_err(|_| ConfigError::Invalid {
                name: "PORT",
                reason: format!("{raw:?} is not a port number"),
            })?,
            None => 8080,
        };

        Ok(Self {
            port,
            database_url: required("DATABASE_URL")?,
            firebase_project_id: required("FIREBASE_PROJECT_ID")?,
            allowed_emails: split_list(lookup("ALLOWED_EMAILS"))
                .into_iter()
                .map(|e| e.to_lowercase())
                .collect(),
            cors_origins: split_list(lookup("CORS_ORIGINS")),
            gemini_api_key: lookup("GEMINI_API_KEY").filter(|v| !v.trim().is_empty()),
        })
    }
}

fn split_list(raw: Option<String>) -> Vec<String> {
    raw.unwrap_or_default()
        .split(',')
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(String::from)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn lookup(pairs: &[(&str, &str)]) -> impl Fn(&str) -> Option<String> {
        let map: HashMap<String, String> = pairs
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect();
        move |key| map.get(key).cloned()
    }

    const BASE: [(&str, &str); 2] = [
        ("DATABASE_URL", "postgres://localhost/navi"),
        ("FIREBASE_PROJECT_ID", "navi-monitor"),
    ];

    #[test]
    fn defaults_port_and_empty_lists() {
        let config = Config::from_lookup(lookup(&BASE)).unwrap();
        assert_eq!(config.port, 8080);
        assert!(config.allowed_emails.is_empty());
        assert!(config.cors_origins.is_empty());
        assert!(config.gemini_api_key.is_none());
    }

    #[test]
    fn parses_and_normalizes_allowlist() {
        let mut pairs = BASE.to_vec();
        pairs.push(("ALLOWED_EMAILS", " Me@Gmail.com, ,friend@gmail.com "));
        let config = Config::from_lookup(lookup(&pairs)).unwrap();
        assert_eq!(config.allowed_emails, ["me@gmail.com", "friend@gmail.com"]);
    }

    #[test]
    fn missing_database_url_is_an_error() {
        let err = Config::from_lookup(lookup(&[("FIREBASE_PROJECT_ID", "x")])).unwrap_err();
        assert!(matches!(err, ConfigError::Missing("DATABASE_URL")));
    }

    #[test]
    fn invalid_port_is_an_error() {
        let mut pairs = BASE.to_vec();
        pairs.push(("PORT", "abc"));
        let err = Config::from_lookup(lookup(&pairs)).unwrap_err();
        assert!(matches!(err, ConfigError::Invalid { name: "PORT", .. }));
    }
}
