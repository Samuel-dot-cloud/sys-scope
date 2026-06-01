import { DefaultTheme } from "styled-components";
import React, { ReactNode, useEffect, useState } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { dark, light } from "../styles/themes.ts";
import { AppTheme } from "../utils/FrontendUtils.ts";
import useEffectAsync from "../hooks/useEffectAsync.tsx";
import { ThemeContext } from "./ThemeContext.ts";
import {
  prefersDarkMode,
  setTheme as setDocumentTheme,
  Theme,
} from "../utils/theme.ts";

const THEME_STORAGE_KEY = "theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<AppTheme>("auto");
  const [styledTheme, setStyledTheme] = useState<DefaultTheme>(light);

  useEffect(() => {
    const theme =
      (localStorage.getItem(THEME_STORAGE_KEY) as AppTheme) || "auto";
    setDarkMode(theme);
    setDocumentTheme(theme === "dark" ? Theme.Dark : Theme.Light);
  }, []);

  useEffectAsync(async () => {
    localStorage.setItem(THEME_STORAGE_KEY, darkMode);
    await setAppTheme(darkMode === "auto" ? null : darkMode);
  }, [darkMode]);

  useEffect(() => {
    const updateDocumentMode = () => {
      const isSystemDarkMode = prefersDarkMode.matches;
      let isDark: boolean;

      if (darkMode === "auto") {
        isDark = isSystemDarkMode;
      } else {
        isDark = darkMode === "dark";
      }

      document.documentElement.classList.toggle("dark", isDark);
      setDocumentTheme(isDark ? Theme.Dark : Theme.Light);
      setStyledTheme(isDark ? dark : light);
    };

    updateDocumentMode();
    const handleSystemChange = () => {
      if (darkMode === "auto") {
        updateDocumentMode();
      }
    };
    prefersDarkMode.addEventListener("change", handleSystemChange);

    return () => {
      prefersDarkMode.removeEventListener("change", handleSystemChange);
    };
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <StyledThemeProvider theme={styledTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
