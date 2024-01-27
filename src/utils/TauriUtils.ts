import {invoke} from "@tauri-apps/api/tauri";


export const showAboutWindow = async () => {
    try {
        await invoke("show_about_window");
    } catch (error) {
        console.error("Error showing about window: ", error);
    }
}