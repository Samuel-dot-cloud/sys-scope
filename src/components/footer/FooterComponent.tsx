import {AppIcon, AppleIcon, AppName, AppNameContainer, FooterContainer} from "./styles.ts";
import React from "react";

const FooterComponent: React.FC = () => {
    return (
        <FooterContainer>
            <AppNameContainer>
                <AppIcon size="1.5em"/>
                <AppName>System Scope</AppName>
            </AppNameContainer>
            <AppNameContainer>
                <AppName>aarch64 ARM</AppName>
                <AppleIcon size="1.5em"/>
            </AppNameContainer>
        </FooterContainer>
    );
}

export default FooterComponent;