use tauri::Manager;
use window_shadows::set_shadow;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

pub fn show() {
    tauri::Builder::default()
        .setup(|app| {
            let win = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&win, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&win, Some((10, 10, 10, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(&win, true).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}