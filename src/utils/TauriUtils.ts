import {invoke} from "@tauri-apps/api/tauri";

// TODO: Find a means of code generation to get rid of SettingsPayload and other stuff under types.ts
export interface Settings {
    toggleAppShortcut?: string;
}

export interface SettingsPayload {
    toggle_app_shortcut: string | null
}

export const showAboutWindow = async () => {
    try {
        await invoke("show_about_window");
    } catch (error) {
        console.error("Error showing about window: ", error);
    }
}

export const getSettings = async (): Promise<Settings> => {
    const settings = await invoke<SettingsPayload>("get_settings");

    return {
        toggleAppShortcut: settings.toggle_app_shortcut ?? "",
    };
}

export const saveSettings = async (globalShortcut: string) => {
    console.log("The global shortcut: ", globalShortcut);
    const settings: SettingsPayload = {
        toggle_app_shortcut: globalShortcut || null,
    };

    try {
        await invoke("set_settings", {
            newSettings: settings,
        });
    } catch (error) {
        console.error("Error saving global shortcut: ", error);
    }
}