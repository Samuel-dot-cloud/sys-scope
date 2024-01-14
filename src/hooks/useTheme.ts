import {DefaultTheme} from "styled-components";
import {createContext, useContext} from "react";
import {light} from "../styles/themes.ts";


export interface ThemeContextType {
    theme: DefaultTheme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: light,
    toggleTheme: () => {

    },
});

export const useTheme = (): ThemeContextType => {
    const {theme, toggleTheme} = useContext(ThemeContext);
    return { theme, toggleTheme };
}