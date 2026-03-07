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
  UpdateIcon,
  VersionName,
} from "./styles.ts";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";
import appIconImage from "../../assets/app-icon.png";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { ask, message } from "@tauri-apps/api/dialog";
import { relaunch } from "@tauri-apps/api/process";
import { showAboutWindow, shutDown } from "../../utils/TauriUtils.ts";
import { getVersion } from "@tauri-apps/api/app";

interface FooterComponentProps {
  openSettings: () => void;
}

const FooterComponent: React.FC<FooterComponentProps> = ({ openSettings }) => {
  const { sysInfo } = useServerEventsContext();
  const [appVersion, setAppVersion] = useState<string>("");

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const version = await getVersion();
        setAppVersion(version);
      } catch (error) {
        console.error("Error fetching app version: ", error);
      }
    };

    fetchAppVersion();
  }, []);

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

  const settingsMenuItems: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <MenuItemContent>
          <InfoIcon />
          <MenuItemText>About SysScope</MenuItemText>
        </MenuItemContent>
      ),
    },
    {
      key: "2",
      label: (
        <MenuItemContent>
          <SettingsIcon />
          <MenuItemText>Settings</MenuItemText>
        </MenuItemContent>
      ),
    },
    {
      key: "3",
      label: (
        <MenuItemContent>
          <UpdateIcon />
          <MenuItemText>Check for updates</MenuItemText>
        </MenuItemContent>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: (
        <MenuItemContent>
          <PowerIcon />
          <QuitText>Quit SysScope</QuitText>
        </MenuItemContent>
      ),
    },
  ];

  return (
    <FooterContainer>
      <Dropdown
        menu={{
          items: settingsMenuItems,
          onClick: ({ key }) => handleMenuClick(String(key)),
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(20px)",
          },
        }}
        trigger={["click"]}
        placement="topRight"
      >
        <AppNameContainer>
          <AppIcon src={appIconImage} size="1.1em" alt="App Icon" />
          <AppName>SysScope</AppName>
          <VersionName>{appVersion}</VersionName>
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
