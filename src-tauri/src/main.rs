// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app::app::AppState;
use app::display;
use app::helpers::shortcut::setup_shortcut;
use tauri::RunEvent;
extern crate pretty_env_logger;

fn main() {
    if std::env::var("RUST_LOG").is_err() {
        std::env::set_var("RUST_LOG", "info");
    }

    pretty_env_logger::init();

    let app_state = AppState::new();

    let mut app = display::create_app(app_state, tauri::Builder::default());

    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    app.run(move |app_handle, e| {
        if matches!(e, RunEvent::Ready) {
            setup_shortcut(app_handle);
        }
    });
}
