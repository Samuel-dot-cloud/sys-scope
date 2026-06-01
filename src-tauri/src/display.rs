use log::error;
use std::sync::RwLock;
use std::time::Duration;
use tauri::{Manager, Runtime};
use tauri_plugin_autostart::MacosLauncher;

use crate::app::AppState;
use crate::helpers::fs::load_settings;
use crate::macos::set_transparent_titlebar;
use crate::state::Settings;
use crate::ui::tray::setup_tray;
use crate::ui::tray::MAIN_WINDOW_LABEL;
use crate::ui::window::decorate_window;

pub type SettingsState = RwLock<Settings>;

pub fn create_app<R: Runtime>(app: AppState, builder: tauri::Builder<R>) -> tauri::App<R> {
    let ctx = tauri::generate_context!();

    let auto_start_plugin =
        tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--autostart"]));

    let builder = builder
        .enable_macos_default_menu(false)
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .manage(app)
        .manage::<SettingsState>(RwLock::new(Settings::default()))
        .setup(|app| {
            let app_handle = app.app_handle().clone();
            let win = app.get_webview_window(MAIN_WINDOW_LABEL).unwrap();
            let state = AppState::new();

            setup_tray(app)?;

            decorate_window(&win);

            #[cfg(any(windows, target_os = "macos"))]
            win.set_shadow(true).unwrap();

            #[cfg(target_os = "macos")]
            {
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

            // TODO: Spawn threads in a non-blocking manner
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build());

    let builder = builder.plugin(tauri_plugin_global_shortcut::Builder::new().build());

    builder
        .build(ctx)
        .expect("error while running tauri application")
}
