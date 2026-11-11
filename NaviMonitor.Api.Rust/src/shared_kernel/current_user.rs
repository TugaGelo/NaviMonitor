/// The authenticated, allowlisted caller of a request.
///
/// `uid` is the Firebase user id (the token's `sub`). Every row a user owns
/// stores it as `user_id`, matching what the .NET API stored.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CurrentUser {
    pub uid: String,
    pub email: String,
}
