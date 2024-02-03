use std::time::{SystemTime, UNIX_EPOCH};
use crate::models::Timestamp;

pub fn current_time() -> Timestamp {
    let start = SystemTime::now();
    let since_epoch = start.duration_since(UNIX_EPOCH);
    Timestamp(since_epoch.unwrap().as_millis() as i64)
}

pub fn get_percentage(value: &u64, total: &u64) -> f64 {
    let percentage = (*value as f64 / *total as f64) * 100.0;
    (percentage * 100.0).round() / 100.0
}

pub fn round(x: f32) -> f32 {
    (x * 1000.0).round() / 100.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_current_time() {
        let time = current_time();

        assert!(time.0 > 0, "The current time should be greater than 0");
    }

    #[test]
    fn test_get_percentage() {
        assert_eq!(get_percentage(&25, &100), 25.0);
        assert_eq!(get_percentage(&1, &4), 25.0);
        assert_eq!(get_percentage(&0, &100), 0.0);
        assert_eq!(get_percentage(&50, &200), 25.0);
        // Test rounding
        assert_eq!(get_percentage(&1, &3), 33.33);
    }

    #[test]
    fn test_round() {
        assert_eq!(round(std::f32::consts::PI), 31.42);
        assert_eq!(round(std::f32::consts::E), 27.18);
        assert_eq!(round(0.0), 0.0);
        assert_eq!(round(-std::f32::consts::E), -27.18);
        // Test rounding precision
        assert_eq!(round(1.235456), 12.35);
        assert_eq!(round(1.23556), 12.36);
    }
}