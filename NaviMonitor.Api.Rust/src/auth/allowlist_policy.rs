//! Pure decision: may this verified identity use the API?

use crate::shared_kernel::token_verifier::VerifiedIdentity;

#[derive(Debug, PartialEq, Eq)]
pub enum AllowlistDecision {
    Allowed { email: String },
    Denied,
}

/// `allowed` must already be lower-cased (see `Config`).
pub fn check_allowlist(identity: &VerifiedIdentity, allowed: &[String]) -> AllowlistDecision {
    let Some(email) = identity.email.as_deref() else {
        return AllowlistDecision::Denied;
    };
    if !identity.email_verified {
        return AllowlistDecision::Denied;
    }
    let email = email.trim().to_lowercase();
    if allowed.contains(&email) {
        AllowlistDecision::Allowed { email }
    } else {
        AllowlistDecision::Denied
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn identity(email: Option<&str>, verified: bool) -> VerifiedIdentity {
        VerifiedIdentity {
            uid: "uid-1".into(),
            email: email.map(String::from),
            email_verified: verified,
        }
    }

    fn list() -> Vec<String> {
        vec!["me@gmail.com".into()]
    }

    #[test]
    fn allows_listed_verified_email_case_insensitively() {
        assert_eq!(
            check_allowlist(&identity(Some("Me@Gmail.com"), true), &list()),
            AllowlistDecision::Allowed {
                email: "me@gmail.com".into()
            }
        );
    }

    #[test]
    fn denies_unlisted_email() {
        let decision = check_allowlist(&identity(Some("stranger@gmail.com"), true), &list());
        assert_eq!(decision, AllowlistDecision::Denied);
    }

    #[test]
    fn denies_unverified_email() {
        let decision = check_allowlist(&identity(Some("me@gmail.com"), false), &list());
        assert_eq!(decision, AllowlistDecision::Denied);
    }

    #[test]
    fn denies_missing_email() {
        assert_eq!(
            check_allowlist(&identity(None, true), &list()),
            AllowlistDecision::Denied
        );
    }

    #[test]
    fn empty_allowlist_denies_everyone() {
        let decision = check_allowlist(&identity(Some("me@gmail.com"), true), &[]);
        assert_eq!(decision, AllowlistDecision::Denied);
    }
}
