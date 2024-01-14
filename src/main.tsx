import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {GlabalStyles} from "./styles/globals.ts";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <GlabalStyles/>
        <App/>
    </React.StrictMode>,
)
