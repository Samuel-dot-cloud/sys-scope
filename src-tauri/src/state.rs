use serde::{Deserialize, Serialize};
use crate::commands::settings::SettingsPayload;

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq)]
pub struct Settings {
    pub toggle_app_shortcut: Option<String>,
}

impl From<SettingsPayload> for Settings {
    fn from(payload: SettingsPayload) -> Self {
        Self {
            toggle_app_shortcut: payload.toggle_app_shortcut,
        }
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            toggle_app_shortcut: None,
        }
    }
}

