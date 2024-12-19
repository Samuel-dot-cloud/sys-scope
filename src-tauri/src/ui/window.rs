#[allow(unused_imports)]
use crate::macos::set_transparent_titlebar;
use anyhow::Result;
#[allow(unused_imports)]
use tauri::{AppHandle, Runtime, Theme, TitleBarStyle, Window, WindowBuilder, WindowUrl};
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub fn decorate_window<R: Runtime>(window: &Window<R>) {
    #[cfg(target_os = "macos")]
    apply_vibrancy(
        window,
        NSVisualEffectMaterial::HudWindow,
        Some(window_vibrancy::NSVisualEffectState::FollowsWindowActiveState),
        Some(8.0),
    )
    .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

    #[cfg(target_os = "windows")]
    {
        use tauri::{Theme, WindowEvent};
        use window_vibrancy::apply_acrylic;

        fn apply_window_theme<R: Runtime>(theme: &Theme, window: &Window<R>) {
            match theme {
                Theme::Light => apply_acrylic(window, Some((255, 255, 255, 125)))
                    .expect("Unsupported platform! 'apply_acrylic' is only supported on Windows"),
                Theme::Dark => apply_acrylic(window, Some((0, 0, 0, 50)))
                    .expect("Unsupported platform! 'apply_acrylic' is only supported on Windows"),
                _ => {}
            }
        }

        apply_window_theme(&window.theme().unwrap(), window);

        window.on_window_event({
            let window = window.clone();
            move |event| {
                if let WindowEvent::ThemeChanged(theme) = event {
                    apply_window_theme(theme, &window)
                }
            }
        });
    }
}

pub fn setup_about_window<R: Runtime>(app_handle: &AppHandle<R>) -> Result<Window<R>> {
    let about_window = WindowBuilder::new(
        app_handle,
        crate::ui::tray::ABOUT_WINDOW_LABEL,
        WindowUrl::App("src/pages/about/about.html".into()),
    )
    .title("")
    .resizable(false)
    .minimizable(false)
    .inner_size(350., 300.)
    .focused(true)
    .skip_taskbar(true);

    #[cfg(target_os = "macos")]
    let about_window = about_window.title_bar_style(TitleBarStyle::Overlay);

    let about_window = about_window.build().unwrap();

    // Wait for DOM to load to avoid showing empty screen
    about_window.once("window_loaded", {
        let about_window = about_window.clone();
        move |_| {
            about_window
                .show()
                .expect("Failed to show about window on load")
        }
    });

    Ok(about_window)
}
