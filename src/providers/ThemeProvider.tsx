import { DefaultTheme } from "styled-components";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { dark, light } from "../styles/themes.ts";
import { AppTheme } from "../utils/FrontendUtils.ts";
import useEffectAsync from "../hooks/useEffectAsync.tsx";
import { prefersDarkMode, setTheme, Theme } from "../utils/theme.ts";

interface ThemeContextProps {
  darkMode: AppTheme;
  setDarkMode: React.Dispatch<React.SetStateAction<AppTheme>>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined,
);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<AppTheme>("auto");
  const [styledTheme, setStyledTheme] = useState<DefaultTheme>(light);

  useEffect(() => {
    invoke<AppTheme>("plugin:theme|get_theme").then((theme) => {
      setDarkMode(theme || "auto");
      setTheme(theme === "dark" ? Theme.Dark : Theme.Light);
    });
  }, []);

  useEffectAsync(async () => {
    invoke("plugin:theme|set_theme", { theme: darkMode });
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
      setTheme(isDark ? Theme.Dark : Theme.Light);
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
