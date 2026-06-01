use crate::state::Settings;
use anyhow::{Context, Result};
use log::info;
use std::fs;
use tauri::{AppHandle, Manager, Runtime};

const SETTINGS_FILENAME: &str = "settings.json";

pub fn load_settings<R: Runtime>(handle: &AppHandle<R>) -> Result<Settings> {
    let app_data_dir = handle
        .path()
        .app_data_dir()
        .context("Failed to resolve app data dir")?;

    let settings_path = app_data_dir.join(SETTINGS_FILENAME);
    let settings_data = fs::read_to_string(&settings_path)
        .with_context(|| format!("Failed to read settings from {}", settings_path.display()))?;
    let parsed_settings = serde_json::from_str::<Settings>(&settings_data)
        .with_context(|| format!("Failed to parse setings, received {}", settings_data))?;

    info!("The parsed settings: {:?}", parsed_settings.clone());

    Ok(parsed_settings)
}

pub fn save_settings<R: Runtime>(handle: &AppHandle<R>, new_settings: &Settings) -> Result<()> {
    let app_data_dir = handle
        .path()
        .app_data_dir()
        .context("Failed to resolve app data dir")?;

    let settings_path = app_data_dir.join(SETTINGS_FILENAME);
    info!("The settings path: {:?}", settings_path.clone());
    info!("The new settings: {:?}", new_settings.clone());
    let file_contents =
        serde_json::to_string::<Settings>(new_settings).context("Failed to serialize settings")?;

    fs::create_dir_all(&app_data_dir)
        .with_context(|| format!("Failed to create directories in {}", app_data_dir.display()))?;
    fs::write(&settings_path, file_contents)
        .with_context(|| format!("Failed to write settings to {}", settings_path.display()))?;

    Ok(())
}
