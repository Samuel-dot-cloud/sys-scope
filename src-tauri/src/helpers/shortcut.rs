use tauri::{AppHandle, GlobalShortcutManager, Manager, Runtime};
use crate::display::SettingsState;
use anyhow::Result;
use crate::ui::tray::MAIN_WINDOW_LABEL;

pub fn setup_shortcut<R: Runtime>(app_handle: &AppHandle<R>) {
    let settings_state = app_handle.state::<SettingsState>();
    let settings_state = settings_state.read().unwrap();

    if let Some(toggle_app_shortcut) = settings_state.toggle_app_shortcut.clone() {
        if let Err(error) = register_toggle_shortcut(app_handle, &toggle_app_shortcut) {
            eprintln!(
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
    if !app_handle
        .global_shortcut_manager()
        .is_registered(shortcut)? {
        app_handle.global_shortcut_manager().register(shortcut, {
            let app_handle = app_handle.clone();
            move || {
                if let Some(window) = app_handle.get_window(MAIN_WINDOW_LABEL) {
                    match window.is_visible().unwrap() {
                        true => window.hide().unwrap(),
                        false => window.show().unwrap(),
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
    if app_handle
        .global_shortcut_manager()
        .is_registered(shortcut)?
    {
        app_handle.global_shortcut_manager().unregister(shortcut)?
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use std::sync::RwLock;
    use crate::state::Settings;

    use super::*;
    use tauri::test;
    use tauri::Manager;

    const ACCELERATOR: &str = "Ctrl + C";

    #[test]
    fn sets_up_shortcut_from_state() -> Result<()> {
        let app_handle = test::mock_app().app_handle();

        app_handle.manage::<SettingsState>(RwLock::new(Settings {
            toggle_app_shortcut: Some(ACCELERATOR.to_owned()),
            ..Default::default()
        }));

        setup_shortcut(&app_handle);

        assert!(app_handle
            .global_shortcut_manager()
            .is_registered(ACCELERATOR)?);

        Ok(())
    }

    #[test]
    fn sets_up_without_shortcuts() -> Result<()> {
        let app_handle = test::mock_app().app_handle();

        app_handle.manage::<SettingsState>(RwLock::new(Settings::default()));

        setup_shortcut(&app_handle);

        Ok(())
    }

    #[test]
    fn registers_toggle_shortcut() -> Result<()> {
        let app_handle = test::mock_app().app_handle();

        register_toggle_shortcut(&app_handle, ACCELERATOR).unwrap();

        assert!(
            app_handle
                .global_shortcut_manager()
                .is_registered(ACCELERATOR)?
        );

        Ok(())
    }

    #[test]
    fn noop_if_shortcut_registered() -> Result<()> {
        let app_handle = test::mock_app().app_handle();

        register_toggle_shortcut(&app_handle, ACCELERATOR)?;
        register_toggle_shortcut(&app_handle, ACCELERATOR)?;

        assert!(
            app_handle
                .global_shortcut_manager()
                .is_registered(ACCELERATOR)?
        );

        Ok(())
    }

    #[test]
    fn unregisters_shortcut() -> Result<()> {
        let app_handle = test::mock_app().app_handle();

        app_handle
            .global_shortcut_manager()
            .register(ACCELERATOR, || {})?;

        unregister_global_shortcut(&app_handle, ACCELERATOR)?;

        assert!(
            !app_handle
                .global_shortcut_manager()
                .is_registered(ACCELERATOR)?
        );

        Ok(())
    }

    #[test]
    fn noop_if_shortcut_unregistered() -> Result<()> {
        let app_handle = test::mock_app().app_handle();

        app_handle
            .global_shortcut_manager()
            .register(ACCELERATOR, || {})?;

        unregister_global_shortcut(&app_handle, ACCELERATOR)?;
        unregister_global_shortcut(&app_handle, ACCELERATOR)?;

        assert!(
            !app_handle
                .global_shortcut_manager()
                .is_registered(ACCELERATOR)?
        );

        Ok(())
    }
}