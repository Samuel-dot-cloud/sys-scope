use std::time::Duration;
use tauri::Manager;
use window_shadows::set_shadow;
use tauri_plugin_theme::ThemePlugin;

#[allow(unused_imports)]
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};
use window_vibrancy::NSVisualEffectState;
use crate::app::AppState;

pub fn show(app: AppState) {
    let mut ctx = tauri::generate_context!();

    tauri::Builder::default()
        .setup(|app| {
            let win = app.get_window("main").unwrap();
            let state = AppState::new();

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
                    std::thread::sleep(Duration::from_secs(1));
                }
            });

            Ok(())
        })
        .manage(app)
        .plugin(ThemePlugin::init(ctx.config_mut()))
        .run(ctx)
        .expect("error while running tauri application");
}