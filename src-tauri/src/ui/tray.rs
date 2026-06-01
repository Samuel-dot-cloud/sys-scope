use crate::ui::window::setup_about_window;
use log::error;
use tauri::{
    menu::MenuBuilder,
    tray::{MouseButton, MouseButtonState, TrayIconEvent},
    App, AppHandle, Emitter, Manager, PhysicalPosition, Position, Runtime, WindowEvent,
};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_updater::UpdaterExt;

pub const MAIN_WINDOW_LABEL: &str = "main";
pub const ABOUT_WINDOW_LABEL: &str = "about";
const QUIT_MENU_ITEM_ID: &str = "quit";
const SETTINGS_MENU_ITEM_ID: &str = "settings";
const CHECK_UPDATES_MENU_ITEM_ID: &str = "check_updates";
const ABOUT_MENU_ITEM_ID: &str = "about";

fn toggle_main_window<R: Runtime>(app_handle: &AppHandle<R>) {
    let main_window = app_handle.get_webview_window(MAIN_WINDOW_LABEL).unwrap();

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

        main_window
            .set_position(Position::Physical(PhysicalPosition { x, y }))
            .unwrap();
        main_window.show().unwrap();
        main_window.set_focus().unwrap();
    }
}

fn show_message<R: Runtime>(
    app_handle: &AppHandle<R>,
    title: &str,
    message: impl Into<String>,
    kind: MessageDialogKind,
) {
    app_handle
        .dialog()
        .message(message)
        .title(title)
        .kind(kind)
        .show(|_| {});
}

fn check_for_updates<R: Runtime>(app_handle: AppHandle<R>) {
    tauri::async_runtime::spawn(async move {
        let update = match app_handle.updater() {
            Ok(updater) => updater.check().await,
            Err(error) => Err(error),
        };

        match update {
            Ok(Some(update)) => {
                if let Err(error) = update.download_and_install(|_, _| {}, || {}).await {
                    show_message(
                        &app_handle,
                        "Failed to install update",
                        error.to_string(),
                        MessageDialogKind::Error,
                    );
                }
            }
            Ok(None) => show_message(
                &app_handle,
                "The app is up-to-date",
                "You are already using the latest version of SysScope",
                MessageDialogKind::Info,
            ),
            Err(error) => show_message(
                &app_handle,
                "Failed to receive update",
                error.to_string(),
                MessageDialogKind::Error,
            ),
        }
    });
}

fn handle_menu_event<R: Runtime>(app_handle: &AppHandle<R>, id: &str) {
    match id {
        QUIT_MENU_ITEM_ID => app_handle.exit(0),
        SETTINGS_MENU_ITEM_ID => {
            let main_window = app_handle.get_webview_window(MAIN_WINDOW_LABEL).unwrap();
            main_window.show().unwrap();
            main_window.emit("settings-clicked", "show").unwrap();
        }
        ABOUT_MENU_ITEM_ID => show_about_window(app_handle.clone()),
        CHECK_UPDATES_MENU_ITEM_ID => check_for_updates(app_handle.clone()),
        id => error!("Unsupported menu item clicked {:?}", id),
    }
}

#[tauri::command]
pub fn show_about_window<R: Runtime>(app_handle: AppHandle<R>) {
    if let Some(about_window) = app_handle.get_webview_window(ABOUT_WINDOW_LABEL) {
        about_window.show().unwrap();
    } else {
        setup_about_window(&app_handle).unwrap();
    }
}

pub fn setup_tray<R: Runtime>(app: &mut App<R>) -> tauri::Result<()> {
    let menu = MenuBuilder::new(app)
        .text(SETTINGS_MENU_ITEM_ID, "Settings...")
        .text(ABOUT_MENU_ITEM_ID, "About")
        .text(CHECK_UPDATES_MENU_ITEM_ID, "Check for Updates...")
        .separator()
        .text(QUIT_MENU_ITEM_ID, "Quit")
        .build()?;
    let tray = app
        .tray_by_id("main")
        .expect("configured tray icon missing");
    tray.set_menu(Some(menu))?;

    #[cfg(target_os = "macos")]
    tray.set_show_menu_on_left_click(false)?;

    let main_window = app.get_webview_window(MAIN_WINDOW_LABEL).unwrap();
    main_window.on_window_event({
        let main_window = main_window.clone();
        move |event| {
            if matches!(event, WindowEvent::Focused(false)) {
                main_window.hide().unwrap();
            }
        }
    });

    app.on_menu_event(|app_handle, event| handle_menu_event(app_handle, event.id().as_ref()));
    app.on_tray_icon_event(|app_handle, event| {
        if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } = event
        {
            toggle_main_window(app_handle);
        }
    });

    Ok(())
}
