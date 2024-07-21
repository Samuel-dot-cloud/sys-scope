use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime, State};
use crate::display::SettingsState;
use crate::helpers::fs::save_settings;
use crate::helpers::shortcut::{register_toggle_shortcut, unregister_global_shortcut};
use crate::state::Settings;

#[derive(Serialize, Deserialize, Debug)]
pub struct SettingsPayload {
    pub toggle_app_shortcut: Option<String>,
}

impl From<Settings> for SettingsPayload {
    fn from(settings: Settings) -> Self {
        Self {
            toggle_app_shortcut: settings.toggle_app_shortcut,
        }
    }
}

#[tauri::command]
pub fn get_settings(settings: State<'_, SettingsState>) -> Result<SettingsPayload, String> {
    let settings = settings
        .read()
        .map_err(|e| format!("Failed to read settings {}", e))?;
    println!("{:?}", settings.to_owned().clone());
    Ok(settings.to_owned().into())
}

#[tauri::command]
pub fn set_settings<R: Runtime>(
    new_settings: SettingsPayload,
    settings: State<'_, SettingsState>,
    app_handle: AppHandle<R>,
) -> Result<(), String> {
    println!("New settings: {:?}", &new_settings);
    let mut settings = settings.write().unwrap();
    let old_settings = settings.clone();

    *settings = new_settings.into();

    save_settings(&app_handle, &settings)
        .map_err(|e| format!("Failed to write settings with error {}", e))?;

    if let Some(toggle_app_shortcut) = &settings.toggle_app_shortcut {
        register_toggle_shortcut(&app_handle, toggle_app_shortcut)
            .map_err(|e| format!("Failed to register shortcut with error {}", e))?;
        if let Some(old_app_shortcut) = &old_settings.toggle_app_shortcut {
            unregister_global_shortcut(&app_handle, old_app_shortcut)
                .map_err(|e| format!("Failed to unregister old shortcut with error {}", e))?;
        }
    } else if let Some(old_toggle_app_shortcut) = &old_settings.toggle_app_shortcut {
        unregister_global_shortcut(&app_handle, old_toggle_app_shortcut)
            .map_err(|e| format!("Failed to unregister old shortcut with error {}", e))?;
    }

    Ok(())
}
