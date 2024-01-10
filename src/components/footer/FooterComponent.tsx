import {AppIcon, AppleIcon, AppName, AppNameContainer, FooterContainer} from "./styles.ts";
import React from "react";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";

const FooterComponent: React.FC = () => {
    const { sysInfo } = useServerEventsContext();
    return (
        <FooterContainer>
            <AppNameContainer>
                <AppIcon size="1.5em"/>
                <AppName>System Scope</AppName>
            </AppNameContainer>
            <AppNameContainer>
                <AppName>{sysInfo?.osVersion}</AppName>
                <AppleIcon size="1.5em"/>
            </AppNameContainer>
        </FooterContainer>
    );
}

export default FooterComponent;