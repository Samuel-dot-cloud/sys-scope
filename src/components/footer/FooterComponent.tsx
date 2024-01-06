import {AppIcon, AppName, AppNameContainer, FooterContainer, SettingsIcon} from "./styles.ts";
import React from "react";

const FooterComponent: React.FC = () => {
    return (
        <FooterContainer>
            <AppNameContainer>
                <AppIcon size="1.5em"/>
                <AppName>System Scope</AppName>
            </AppNameContainer>
            <SettingsIcon size="1.5em" onClick={() => console.log('Settings clicked')}/>
        </FooterContainer>
    );
}

export default FooterComponent;