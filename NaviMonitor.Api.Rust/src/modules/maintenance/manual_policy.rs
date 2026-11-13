//! Limits on manual analysis: they keep Gemini usage small and uploads under Vercel's 4.5 MB body cap.

use crate::shared_kernel::manual_analyzer::ManualImage;

pub const DAILY_LIMIT: i32 = 5;
pub const MAX_IMAGES: usize = 8;
/// Vercel rejects request bodies over 4.5 MB, so the apps shrink photos to ~300 KB before upload.
pub const MAX_TOTAL_BYTES: usize = 4 * 1024 * 1024;
const ALLOWED_TYPES: [&str; 5] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
];

pub fn check_images(images: &[ManualImage]) -> Result<(), String> {
    if images.is_empty() {
        return Err("Please upload at least one image of a manual.".into());
    }
    if images.len() > MAX_IMAGES {
        return Err(format!("Send at most {MAX_IMAGES} pages at a time."));
    }
    if let Some(bad) = images
        .iter()
        .find(|img| !ALLOWED_TYPES.contains(&img.mime_type.as_str()))
    {
        return Err(format!(
            "{} files aren't supported. Use JPEG, PNG, WebP or HEIC photos.",
            bad.mime_type
        ));
    }
    if images.iter().map(|img| img.data.len()).sum::<usize>() > MAX_TOTAL_BYTES {
        return Err(too_large_message());
    }
    Ok(())
}

pub fn too_large_message() -> String {
    format!(
        "The photos are too large. Keep them under {} MB in total.",
        MAX_TOTAL_BYTES / (1024 * 1024)
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn jpeg(size: usize) -> ManualImage {
        ManualImage {
            mime_type: "image/jpeg".into(),
            data: vec![0; size],
        }
    }

    #[test]
    fn accepts_a_few_normal_photos() {
        assert!(check_images(&[jpeg(1_000_000), jpeg(1_500_000)]).is_ok());
    }

    #[test]
    fn rejects_none_too_many_too_big_and_wrong_type() {
        assert!(check_images(&[]).is_err());
        assert!(check_images(&vec![jpeg(10); MAX_IMAGES + 1]).is_err());
        assert!(check_images(&[jpeg(MAX_TOTAL_BYTES), jpeg(1)]).is_err());
        let pdf = ManualImage {
            mime_type: "application/pdf".into(),
            data: vec![0; 10],
        };
        assert!(
            check_images(&[pdf])
                .unwrap_err()
                .contains("application/pdf")
        );
    }
}
