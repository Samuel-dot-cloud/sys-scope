use std::time::Duration;
use tauri::Manager;
use window_shadows::set_shadow;
use tauri_plugin_theme::ThemePlugin;
use tauri_plugin_autostart::MacosLauncher;

#[allow(unused_imports)]
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};
use window_vibrancy::NSVisualEffectState;
use crate::app::AppState;
use crate::ui::tray::{MAIN_WINDOW_LABEL, setup_tray};

pub fn show(app: AppState) {
    let mut ctx = tauri::generate_context!();

    let auto_start_plugin = tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None);

    tauri::Builder::default()
        .setup(|app| {
            let win = app.get_window(MAIN_WINDOW_LABEL).unwrap();
            let state = AppState::new();

            setup_tray(app);

            #[cfg(target_os = "macos")]
            apply_vibrancy(
                &win,
                NSVisualEffectMaterial::Popover,
                Some(NSVisualEffectState::FollowsWindowActiveState),
                Some(8.0),
            )
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&win, Some((10, 10, 10, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(&win, true).unwrap();

            tauri::async_runtime::spawn(async move {
                loop {
                    state.emit_sysinfo(&win);
                    state.emit_global_cpus(&win);
                    state.emit_cpus(&win);
                    state.emit_memory(&win);
                    state.emit_swap(&win);
                    state.emit_networks(&win);
                    state.emit_disks(&win);
                    state.emit_processes(&win);
                    state.emit_batteries(&win);
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            });

            Ok(())
        })
        .manage(app)
        .plugin(auto_start_plugin)
        .plugin(ThemePlugin::init(ctx.config_mut()))
        .run(ctx)
        .expect("error while running tauri application");
}