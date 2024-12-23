use log::error;
use std::sync::RwLock;
use std::time::Duration;
use tauri::{Manager, Runtime};
use tauri_plugin_autostart::MacosLauncher;
use window_shadows::set_shadow;

use crate::app::AppState;
use crate::helpers::fs::load_settings;
use crate::macos::set_transparent_titlebar;
use crate::state::Settings;
use crate::ui::tray::{setup_tray, MAIN_WINDOW_LABEL};
#[allow(unused_imports)]
use crate::ui::window::decorate_window;

pub type SettingsState = RwLock<Settings>;

pub fn create_app<R: Runtime>(app: AppState, builder: tauri::Builder<R>) -> tauri::App<R> {
    let mut ctx = tauri::generate_context!();

    let auto_start_plugin =
        tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--autostart"]));

    builder
        .menu(tauri::Menu::new())
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().unwrap();
                api.prevent_close();
            }
        })
        .manage(app)
        .manage::<SettingsState>(RwLock::new(Settings::default()))
        .setup(|app| {
            let app_handle = app.app_handle();
            let win = app.get_window(MAIN_WINDOW_LABEL).unwrap();
            let state = AppState::new();

            setup_tray(app);

            #[cfg(not(test))]
            decorate_window(&win);

            #[cfg(any(windows, target_os = "macos"))]
            {
                set_shadow(&win, true).unwrap();

                let nswindow = win.ns_window().unwrap();

                unsafe { set_transparent_titlebar(&nswindow) };
            }

            {
                match load_settings(&app_handle) {
                    Ok(settings) => {
                        *app.state::<SettingsState>().write().unwrap() = settings;
                    }
                    Err(error) => {
                        error!("Failed to load settings with error {:?}", error)
                    }
                }
            }

            tauri::async_runtime::spawn(async move {
                loop {
                    state.emit_sysinfo(&win).await;
                    state.emit_cpu(&win).await;
                    state.emit_cpu_processes(&win).await;
                    state.emit_memory(&win).await;
                    // state.emit_swap(&win).await;
                    // state.emit_networks(&win);
                    state.emit_disks(&win).await;
                    state.emit_processes(&win).await;
                    state.emit_batteries(&win).await;
                    state.emit_battery_processes(&win).await;
                    state.emit_disk_processes(&win).await;
                    state.emit_memory_processes(&win).await;
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::ui::tray::show_about_window,
            crate::commands::settings::get_settings,
            crate::commands::settings::set_settings,
            crate::utils::quit_app
        ])
        .plugin(auto_start_plugin)
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .build(ctx)
        .expect("error while running tauri application")
}

#[cfg(test)]
mod tests {
    use super::*;
    use tauri::Manager;

    #[test]
    fn creates_main_window() {
        let app_state = AppState::new();
        let app = create_app(app_state, tauri::test::mock_builder());
        assert!(app.get_window(MAIN_WINDOW_LABEL).is_some());
    }
}
