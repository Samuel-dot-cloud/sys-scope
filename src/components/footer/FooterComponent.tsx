import {
  AppIcon,
  AppleIcon,
  AppName,
  AppNameContainer,
  FooterContainer,
  InfoIcon,
  MenuItemContent,
  MenuItemText,
  OSInfoContainer,
  PowerIcon,
  QuitText,
  SettingsIcon,
  TranslucentMenu,
  UpdateIcon,
} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import appIconImage from "../../assets/app-icon.png";
import { Dropdown, Menu } from "antd";
import React from "react";
import toast from "react-hot-toast";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { ask, message } from "@tauri-apps/api/dialog";
import { relaunch } from "@tauri-apps/api/process";
import { showAboutWindow, shutDown } from "../../utils/TauriUtils.ts";

interface FooterComponentProps {
  openSettings: () => void;
}

const FooterComponent: React.FC<FooterComponentProps> = ({ openSettings }) => {
  const { sysInfo } = useServerEventsContext();

  const handleMenuClick = async (menuItem: string) => {
    switch (menuItem) {
      case "1":
        await showAboutWindow();
        break;
      case "2":
        openSettings();
        break;
      case "3": {
        toast.loading("Checking for updates", { duration: 1000 });
        const updateStatus = checkUpdate();
        updateStatus
          .then(async (result) => {
            console.log("The result: ", result);
            if (!result.shouldUpdate) {
              await message("There are currently no updates available.", {
                title: "The app is up-to-date",
                type: "info",
              });
            } else {
              const confirm = await ask(
                "An update is available. Install now?",
                {
                  title: "Install update",
                  type: "info",
                },
              );

              if (confirm) {
                await installUpdate();

                await relaunch();
              }
            }
          })
          .catch((error) => {
            toast.error(`${error}`, { duration: 1500 });
          });
        break;
      }
      case "4":
        await shutDown();
        break;
      default:
        console.log("Unknown menu item");
    }
  };

  const settingsMenu = (
    <TranslucentMenu onClick={({ key }) => handleMenuClick(key)}>
      <Menu.Item key="1">
        <MenuItemContent>
          <InfoIcon />
          <MenuItemText>About SysScope</MenuItemText>
        </MenuItemContent>
      </Menu.Item>
      <Menu.Item key="2">
        <MenuItemContent>
          <SettingsIcon />
          <MenuItemText>Settings</MenuItemText>
        </MenuItemContent>
      </Menu.Item>
      <Menu.Item key="3">
        <MenuItemContent>
          <UpdateIcon />
          <MenuItemText>Check for updates</MenuItemText>
        </MenuItemContent>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4">
        <MenuItemContent>
          <PowerIcon />
          <QuitText>Quit SysScope</QuitText>
        </MenuItemContent>
      </Menu.Item>
    </TranslucentMenu>
  );

  return (
    <FooterContainer>
      <Dropdown overlay={settingsMenu} trigger={["click"]} placement="topRight">
        <AppNameContainer>
          <AppIcon src={appIconImage} size="1.1em" alt="App Icon" />
          <AppName>SysScope</AppName>
        </AppNameContainer>
      </Dropdown>
      <OSInfoContainer>
        <AppName>{sysInfo?.osVersion}</AppName>
        <AppleIcon size="1.5em" />
      </OSInfoContainer>
    </FooterContainer>
  );
};

export default FooterComponent;
