use std::fs;
use tauri::{AppHandle, Runtime};
use anyhow::{Context, Result};
use crate::state::Settings;

const SETTINGS_FILENAME: &str = "settings.json";

pub fn load_settings<R: Runtime>(handle: &AppHandle<R>) -> Result<Settings> {
    let app_data_dir = handle
        .path_resolver()
        .app_data_dir()
        .context("Failed to resolve app data dir")?;

    let settings_path = app_data_dir.join(SETTINGS_FILENAME);
    let settings_data = fs::read_to_string(&settings_path)
        .with_context(|| format!("Failed to read settings from {}", settings_path.display()))?;
    let parsed_settings = serde_json::from_str::<Settings>(&settings_data)
        .with_context(|| format!("Failed to parse setings, received {}", settings_data))?;

    println!("The parsed settings: {:?}", parsed_settings.clone());

    Ok(parsed_settings)
}

pub fn save_settings<R: Runtime>(handle: &AppHandle<R>, new_settings: &Settings) -> Result<()> {
    let app_data_dir = handle
        .path_resolver()
        .app_data_dir()
        .context("Failed to resolve app data dir")?;

    let settings_path = app_data_dir.join(SETTINGS_FILENAME);
    println!("The settings path: {:?}", settings_path.clone());
    println!("The new settings: {:?}", new_settings.clone());
    let file_contents = serde_json::to_string::<Settings>(new_settings)
        .context("Failed to serialize settings")?;

    println!("The file contents after saving: {}", &file_contents);

    fs::create_dir_all(&app_data_dir)
        .with_context(|| format!("Failed to create directories in {}", app_data_dir.display()))?;
    fs::write(&settings_path, file_contents)
        .with_context(|| format!("Failed to write settings to {}", settings_path.display()))?;

    println!("Think stuff is being saved here");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;
    use serial_test::serial;
    use tauri::{Manager, test};


    #[serial(fs)]
    #[test]
    fn test_save_settings() {
        let app_handle = test::mock_app().app_handle();

        assert!(save_settings(
            &app_handle,
            &Settings {
                toggle_app_shortcut: Some("Ctrl + S".to_string())
            },
        )
            .is_ok())
    }

    #[serial(fs)]
    #[test]
    fn test_load_settings() -> Result<()> {
        let app_handle = test::mock_app().app_handle();
        let settings = Settings {
            toggle_app_shortcut: Some("Ctrl + S".to_string()),
        };
        save_settings(&app_handle, &settings)?;
        assert_eq!(load_settings(&app_handle)?, settings);

        Ok(())
    }
}