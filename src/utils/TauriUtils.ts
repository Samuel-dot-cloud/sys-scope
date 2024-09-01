import { invoke } from "@tauri-apps/api/tauri";

export interface Settings {
  toggleAppShortcut?: string;
}

export interface SettingsPayload {
  toggle_app_shortcut: string | null;
}

export const showAboutWindow = async () => {
  try {
    await invoke("show_about_window");
  } catch (error) {
    console.error("Error showing about window: ", error);
  }
};

export const getSettings = async (): Promise<Settings> => {
  const settings = await invoke<SettingsPayload>("get_settings");

  return {
    toggleAppShortcut: settings.toggle_app_shortcut ?? "",
  };
};

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
};

export const shutDown = async () => {
  try {
    await invoke("quit_app");
  } catch (error) {
    console.error("Something went wrong trying to quit the app: ", error);
  }
};
