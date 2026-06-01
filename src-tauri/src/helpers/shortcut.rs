use crate::display::SettingsState;
use crate::ui::tray::MAIN_WINDOW_LABEL;
use anyhow::Result;
use log::error;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

pub fn setup_shortcut<R: Runtime>(app_handle: &AppHandle<R>) {
    let settings_state = app_handle.state::<SettingsState>();
    let settings_state = settings_state.read().unwrap();

    if let Some(toggle_app_shortcut) = settings_state.toggle_app_shortcut.clone() {
        if let Err(error) = register_toggle_shortcut(app_handle, &toggle_app_shortcut) {
            error!(
                "Failed to register shortcut {} with error {}",
                toggle_app_shortcut, error
            );
        }
    }
}

pub fn register_toggle_shortcut<R: Runtime>(
    app_handle: &AppHandle<R>,
    shortcut: &str,
) -> Result<()> {
    if !app_handle.global_shortcut().is_registered(shortcut) {
        app_handle.global_shortcut().on_shortcut(shortcut, {
            let app_handle = app_handle.clone();
            move |_, _, _| {
                if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
                    if window.is_visible().unwrap() {
                        window.hide().unwrap_or_default();
                    } else {
                        window.show().unwrap_or_default();
                        window.set_focus().unwrap_or_default();
                    }
                }
            }
        })?;
    }

    Ok(())
}

pub fn unregister_global_shortcut<R: Runtime>(
    app_handle: &AppHandle<R>,
    shortcut: &str,
) -> Result<()> {
    if app_handle.global_shortcut().is_registered(shortcut) {
        app_handle.global_shortcut().unregister(shortcut)?
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::state::Settings;
    use std::sync::RwLock;

    use super::*;
    use tauri::test;
    use tauri::Manager;

    const ACCELERATOR: &str = "Ctrl + C";

    fn mock_app() -> tauri::App<test::MockRuntime> {
        test::mock_builder()
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .build(test::mock_context(test::noop_assets()))
            .unwrap()
    }

    #[test]
    fn manages_toggle_shortcut() -> Result<()> {
        let app = mock_app();
        let app_handle = app.app_handle();

        app_handle.manage::<SettingsState>(RwLock::new(Settings::default()));
        setup_shortcut(&app_handle);
        assert!(!app_handle.global_shortcut().is_registered(ACCELERATOR));

        register_toggle_shortcut(&app_handle, ACCELERATOR)?;
        register_toggle_shortcut(&app_handle, ACCELERATOR)?;
        assert!(app_handle.global_shortcut().is_registered(ACCELERATOR));

        unregister_global_shortcut(&app_handle, ACCELERATOR)?;
        unregister_global_shortcut(&app_handle, ACCELERATOR)?;
        assert!(!app_handle.global_shortcut().is_registered(ACCELERATOR));

        *app_handle.state::<SettingsState>().write().unwrap() = Settings {
            toggle_app_shortcut: Some(ACCELERATOR.to_owned()),
            ..Default::default()
        };
        setup_shortcut(&app_handle);
        assert!(app_handle.global_shortcut().is_registered(ACCELERATOR));

        Ok(())
    }
}
