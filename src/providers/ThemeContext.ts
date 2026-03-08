import React, { createContext } from "react";
import { AppTheme } from "../utils/FrontendUtils.ts";

export interface ThemeContextValue {
  darkMode: AppTheme;
  setDarkMode: React.Dispatch<React.SetStateAction<AppTheme>>;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);
