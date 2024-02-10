import React from "react";
import ServerEventsProvider from "./ServerEventsProvider.tsx";


interface AppProvider {
    children: React.ReactNode
}

const AppProvider: React.FC<AppProvider> = ({ children }) => {
    return (
        <ServerEventsProvider>
            {children}
        </ServerEventsProvider>
    )
}

export default AppProvider;