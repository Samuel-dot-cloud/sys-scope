import { appWindow } from "@tauri-apps/api/window";
import { disableContextMenu } from "../../utils/dom.ts";
import * as theme from "../../utils/theme.ts";
import { getVersion, getTauriVersion } from "@tauri-apps/api/app";

const displayAppAndTauriVersion = async () => {
  try {
    const [appVersion, tauriVersion] = await Promise.all([
      getVersion(),
      getTauriVersion(),
    ]);

    const appInfoContainer = document.querySelector(".app-info");

    if (appInfoContainer) {
      const appVersionElement = document.createElement("p");
      appVersionElement.className = "app-version";
      appVersionElement.textContent = `App version: ${appVersion}`;
      appInfoContainer.appendChild(appVersionElement);

      const tauriVersionElement = document.createElement("p");
      tauriVersionElement.className = "tauri-version";
      tauriVersionElement.textContent = `Tauri version: ${tauriVersion}`;
      appInfoContainer.appendChild(tauriVersionElement);
    }
  } catch (error) {
    console.error("Error fetching version info: ", error);
  }
};

appWindow.emit("window_loaded");

theme.followSystemTheme();
disableContextMenu();
displayAppAndTauriVersion();
