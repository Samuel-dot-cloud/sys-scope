import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {GlabalStyles} from "./styles/globals.ts";
import {ThemeProvider} from "./providers/ThemeProvider.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <GlabalStyles/>
            <App/>
        </ThemeProvider>
    </React.StrictMode>,
)
