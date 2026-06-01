use anyhow::Result;
use tauri::{
    window::{Effect, EffectState, EffectsBuilder},
    AppHandle, Listener, Runtime, TitleBarStyle, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

pub fn decorate_window<R: Runtime>(window: &WebviewWindow<R>) {
    #[cfg(target_os = "macos")]
    window
        .set_effects(
            EffectsBuilder::new()
                .effect(Effect::HudWindow)
                .state(EffectState::FollowsWindowActiveState)
                .radius(8.0)
                .build(),
        )
        .expect("HudWindow effect is only supported on macOS");

    #[cfg(target_os = "windows")]
    {
        use tauri::{
            window::{Color, Effect, EffectsBuilder},
            Theme, WindowEvent,
        };

        fn apply_window_theme<R: Runtime>(theme: &Theme, window: &WebviewWindow<R>) {
            let color = match theme {
                Theme::Light => Color(255, 255, 255, 125),
                Theme::Dark => Color(0, 0, 0, 50),
                _ => return,
            };

            window
                .set_effects(
                    EffectsBuilder::new()
                        .effect(Effect::Acrylic)
                        .color(color)
                        .build(),
                )
                .expect("Acrylic effect is only supported on Windows");
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

pub fn setup_about_window<R: Runtime>(app_handle: &AppHandle<R>) -> Result<WebviewWindow<R>> {
    let about_window = WebviewWindowBuilder::new(
        app_handle,
        crate::ui::tray::ABOUT_WINDOW_LABEL,
        WebviewUrl::App("src/pages/about/about.html".into()),
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

    // Wait for DOM to load to avoid showing an empty screen.
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
