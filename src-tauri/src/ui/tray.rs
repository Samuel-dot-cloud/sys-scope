use crate::ui::window::setup_about_window;
use log::error;
use tauri::{
    api::dialog, App, AppHandle, CustomMenuItem, Manager, PhysicalPosition, Position, Runtime,
    SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent,
};

pub const MAIN_WINDOW_LABEL: &str = "main";
pub const ABOUT_WINDOW_LABEL: &str = "about";
const QUIT_MENU_ITEM_ID: &str = "quit";
const SETTINGS_MENU_ITEM_ID: &str = "settings";
const CHECK_UPDATES_MENU_ITEM_ID: &str = "check_updates";
const ABOUT_MENU_ITEM_ID: &str = "about";

fn create_window_event_handler<R: Runtime>(app_handle: AppHandle<R>) -> impl Fn(SystemTrayEvent) {
    let main_window = app_handle.get_window(MAIN_WINDOW_LABEL).unwrap();

    move |event| match event {
        SystemTrayEvent::LeftClick {
            position: _position,
            size: _size,
            ..
        } => {
            if main_window.is_visible().unwrap() {
                main_window.hide().unwrap();
            } else {
                let window_size = main_window.outer_size().unwrap();
                let window_width = window_size.width as i32;
                let window_height = window_size.height as i32;

                let current_monitor = main_window.current_monitor().unwrap().unwrap();
                let monitor_size = current_monitor.size();

                let x = (monitor_size.width as i32 - window_width) / 2;
                let y = (monitor_size.height as i32 - window_height) / 2;

                let window_position = Position::Physical(PhysicalPosition { x, y });

                main_window.set_position(window_position).unwrap();
                main_window.show().unwrap();
                main_window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            QUIT_MENU_ITEM_ID => app_handle.exit(0),
            SETTINGS_MENU_ITEM_ID => {
                main_window.show().unwrap();
                main_window.emit("settings-clicked", "show").unwrap();
            }
            ABOUT_MENU_ITEM_ID => {
                let handle = app_handle.clone();
                show_about_window(handle);
            }
            CHECK_UPDATES_MENU_ITEM_ID => {
                let handle = app_handle.clone();
                tauri::async_runtime::spawn(async move {
                    let another_handle = handle.clone();
                    match tauri::updater::builder(handle).check().await {
                        Ok(update) => {
                            if update.is_update_available() {
                                update.download_and_install().await.unwrap();
                            } else {
                                dialog::message(
                                    another_handle.get_window(MAIN_WINDOW_LABEL).as_ref(),
                                    "The app is up-to-date",
                                    "You are already using the latest version of SysScope",
                                );
                            }
                        }
                        Err(error) => {
                            dialog::message(
                                another_handle.get_window(MAIN_WINDOW_LABEL).as_ref(),
                                "Failed to receive update",
                                error.to_string(),
                            );
                        }
                    }
                });
            }
            id => error!("Unsupported menu item clicked {:?}", id),
        },
        _ => {}
    }
}

#[tauri::command]
pub fn show_about_window<R: Runtime>(app_handle: AppHandle<R>) {
    if let Some(about_window) = app_handle.get_window(ABOUT_WINDOW_LABEL) {
        about_window.show().unwrap();
    } else {
        std::thread::scope(|s| {
            s.spawn(|| {
                setup_about_window(&app_handle).unwrap();
            });
        });
    }
}

pub fn setup_tray<R: Runtime>(app: &mut App<R>) {
    let settings_menu_item = CustomMenuItem::new(SETTINGS_MENU_ITEM_ID, "Settings...");
    let check_updates_menu_item =
        CustomMenuItem::new(CHECK_UPDATES_MENU_ITEM_ID, "Check for Updates...");
    let about_menu_item = CustomMenuItem::new(ABOUT_MENU_ITEM_ID, "About");
    let quit_menu_item = CustomMenuItem::new(QUIT_MENU_ITEM_ID, "Quit");
    let system_tray = SystemTray::new().with_menu(
        SystemTrayMenu::new()
            .add_item(settings_menu_item)
            .add_item(about_menu_item)
            .add_item(check_updates_menu_item)
            .add_native_item(tauri::SystemTrayMenuItem::Separator)
            .add_item(quit_menu_item),
    );

    #[cfg(target_os = "macos")]
    let system_tray = system_tray.with_menu_on_left_click(false);

    let main_window = app.get_window(MAIN_WINDOW_LABEL).unwrap();

    main_window.on_window_event({
        let main_window = main_window.clone();
        move |event| {
            if matches!(event, WindowEvent::Focused(false)) {
                main_window.hide().unwrap();
            }
        }
    });

    system_tray
        .on_event(create_window_event_handler(app.handle()))
        .build(app)
        .unwrap();
}
