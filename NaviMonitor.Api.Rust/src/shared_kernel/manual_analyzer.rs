use std::{future::Future, pin::Pin};

use serde_json::Value;

/// One uploaded page of an owner's manual.
#[derive(Debug, Clone)]
pub struct ManualImage {
    pub mime_type: String,
    pub data: Vec<u8>,
}

pub type AnalyzeFuture<'a> = Pin<Box<dyn Future<Output = anyhow::Result<Value>> + Send + 'a>>;

/// Turns manual pages into `{"matrix": [...]}`. Gemini implements it in production; tests use a fake.
pub trait ManualAnalyzer: Send + Sync {
    fn analyze<'a>(&'a self, images: &'a [ManualImage]) -> AnalyzeFuture<'a>;
}
