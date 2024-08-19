import { appWindow } from "@tauri-apps/api/window";
import { disableContextMenu } from "../../utils/dom.ts";
import * as theme from "../../utils/theme.ts";

appWindow.emit("window_loaded");

theme.followSystemTheme();
disableContextMenu();
