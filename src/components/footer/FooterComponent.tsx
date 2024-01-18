import {
    AppIcon,
    AppleIcon,
    AppName,
    AppNameContainer,
    FooterContainer, InfoIcon, MenuItemContent, MenuItemText,
    PowerIcon, QuitText,
    SettingsIcon,
    TranslucentMenu, UpdateIcon
} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import appIconImage from "../../assets/app-icon.png";
import {Dropdown, Menu} from "antd";
import React from "react";

interface FooterComponentProps {
    openSettings: () => void;
}
const FooterComponent: React.FC<FooterComponentProps> = ({ openSettings }) => {
    const {sysInfo} = useServerEventsContext();

    const handleMenuClick = (menuItem: string) => {
        switch (menuItem) {
            case "1":
                console.log("About is clicked");
                break;
            case "2":
                openSettings();
                break;
            case "3":
                console.log("Check for updates is clicked");
                break;
            case "4":
                console.log("Quit is clicked");
                break;
            default:
                console.log("Unknown menu item");
        }
    }

    const settingsMenu = (
        <TranslucentMenu onClick={({ key }) => handleMenuClick(key)}>
            <Menu.Item key="1">
                <MenuItemContent>
                    <InfoIcon/>
                    <MenuItemText>
                        About SysScope
                    </MenuItemText>
                </MenuItemContent>
            </Menu.Item>
            <Menu.Item key="2">
                <MenuItemContent>
                    <SettingsIcon/>
                    <MenuItemText>
                        Settings
                    </MenuItemText>
                </MenuItemContent>
            </Menu.Item>
            <Menu.Item key="3">
                <MenuItemContent>
                    <UpdateIcon/>
                    <MenuItemText>
                        Check for updates
                    </MenuItemText>
                </MenuItemContent>
            </Menu.Item>
            <Menu.Divider/>
            <Menu.Item key="4">
                <MenuItemContent>
                    <PowerIcon/>
                    <QuitText>
                        Quit SysScope
                    </QuitText>
                </MenuItemContent>
            </Menu.Item>
        </TranslucentMenu>
    );

    return (
        <FooterContainer>
            <Dropdown overlay={settingsMenu} trigger={['click']} placement="topRight">
                <AppNameContainer>
                    <AppIcon src={appIconImage} size="1.1em" alt="App Icon"/>
                    <AppName>SysScope</AppName>
                </AppNameContainer>
            </Dropdown>
            <AppNameContainer>
                <AppName>{sysInfo?.osVersion}</AppName>
                <AppleIcon size="1.5em"/>
            </AppNameContainer>
        </FooterContainer>
    );
}

export default FooterComponent;