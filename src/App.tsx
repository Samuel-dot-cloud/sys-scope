import SystemMonitor from "./containers/system/SystemMonitor.tsx";
import AppProvider from "./providers";
import {useState} from "react";
import {DefaultTheme, ThemeProvider} from "styled-components";
import {dark} from "./styles/themes.ts";

function App() {
    const [theme, setTheme] = useState<DefaultTheme>(dark);

    return (
        <AppProvider>
            <ThemeProvider theme={theme}>
                <SystemMonitor/>
            </ThemeProvider>
        </AppProvider>
    )
}

export default App
