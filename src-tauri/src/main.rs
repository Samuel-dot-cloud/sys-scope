// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app::app::AppState;
use app::ui;


fn main() {
    let app = AppState::new();

    ui::show(app);
}
