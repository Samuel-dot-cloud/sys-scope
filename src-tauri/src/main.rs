// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::debug;
use app::app::AppState;
use app::ui;


fn main() {
    pretty_env_logger::init();

    let app = AppState::new();

    ui::show(app);
}
