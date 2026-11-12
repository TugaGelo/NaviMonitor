//! Gemini REST client for reading maintenance schedules out of manual photos.

use anyhow::Context;
use base64::{Engine, engine::general_purpose::STANDARD};
use serde_json::{Value, json};

use crate::shared_kernel::manual_analyzer::{AnalyzeFuture, ManualAnalyzer, ManualImage};

const URL: &str =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// Same prompt as the .NET MaintenanceAIService, so results look the same in both apps.
const PROMPT: &str = r#"Act as an expert mechanic. Analyze these pages from a maintenance schedule manual.
Combine the data from ALL provided images and extract a unified list of maintenance tasks.

Instructions:
1. Differentiate between 'Initial' (break-in/first-time) service and 'Regular' (recurring) intervals.
2. Use 'km' for all distance values. Ignore miles or months.
3. The 'interval' field must represent the recurring pattern (e.g., every 4,000km).
4. The 'initialMilestone' field is for the first-ever check (e.g., the 1,000km break-in). If no specific initial check exists, omit the field or set to null.
5. Extract items for: 'R' (Replace), 'C' (Clean), and 'I' (Inspect).
6. Handle vehicle variants as separate line items.

Return ONLY a raw JSON object with this exact structure:
{
  "matrix": [
    {
      "item": "string",
      "initialMilestone": number or null,
      "interval": number,
      "action": "string (Replace, Clean, or Inspect)"
    }
  ]
}"#;

pub struct GeminiAnalyzer {
    http: reqwest::Client,
    api_key: String,
}

impl GeminiAnalyzer {
    /// `http` should have a long timeout: several pages can take Gemini a minute.
    pub fn new(http: reqwest::Client, api_key: String) -> Self {
        Self { http, api_key }
    }

    async fn call(&self, images: &[ManualImage]) -> anyhow::Result<Value> {
        let mut parts = vec![json!({ "text": PROMPT })];
        parts.extend(images.iter().map(|img| {
            json!({ "inline_data": { "mime_type": img.mime_type, "data": STANDARD.encode(&img.data) } })
        }));
        let body = json!({
            "contents": [{ "role": "user", "parts": parts }],
            "generationConfig": { "responseMimeType": "application/json" }
        });

        let res = self
            .http
            .post(URL)
            .header("x-goog-api-key", &self.api_key)
            .json(&body)
            .send()
            .await
            .context("calling Gemini")?;
        let status = res.status();
        let text = res.text().await.context("reading Gemini reply")?;
        anyhow::ensure!(status.is_success(), "Gemini returned {status}: {text}");
        parse_reply(&serde_json::from_str(&text).context("Gemini reply is not JSON")?)
    }
}

impl ManualAnalyzer for GeminiAnalyzer {
    fn analyze<'a>(&'a self, images: &'a [ManualImage]) -> AnalyzeFuture<'a> {
        Box::pin(self.call(images))
    }
}

/// Pulls `{"matrix": [...]}` out of a generateContent reply.
fn parse_reply(reply: &Value) -> anyhow::Result<Value> {
    let text: String = reply["candidates"][0]["content"]["parts"]
        .as_array()
        .context("Gemini reply has no content")?
        .iter()
        .filter_map(|p| p["text"].as_str())
        .collect();
    // JSON mode should stop code fences, but the .NET version saw them, so strip them anyway.
    let cleaned = text
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();
    let parsed: Value = serde_json::from_str(cleaned).context("Gemini text is not JSON")?;
    anyhow::ensure!(
        parsed["matrix"].is_array(),
        "Gemini text has no matrix list"
    );
    Ok(json!({ "matrix": parsed["matrix"] }))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn reply(text: &str) -> Value {
        json!({ "candidates": [{ "content": { "parts": [{ "text": text }] } }] })
    }

    #[test]
    fn reads_the_matrix_and_strips_code_fences() {
        let text = "```json\n{\"matrix\":[{\"item\":\"Engine Oil\",\"interval\":4000}]}\n```";
        let m = parse_reply(&reply(text)).unwrap();
        assert_eq!(m["matrix"][0]["item"], "Engine Oil");
    }

    #[test]
    fn rejects_replies_without_a_matrix() {
        assert!(parse_reply(&reply("{\"error\":\"nope\"}")).is_err());
        assert!(parse_reply(&reply("not json")).is_err());
        // A blocked prompt comes back with no content at all.
        assert!(parse_reply(&json!({ "candidates": [{ "finishReason": "SAFETY" }] })).is_err());
    }
}
