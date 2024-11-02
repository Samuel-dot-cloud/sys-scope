import styled from "styled-components";
import { Settings2Outline } from "@styled-icons/evaicons-outline/Settings2Outline";
import { Apple } from "@styled-icons/boxicons-logos/Apple";
import { PowerOff } from "@styled-icons/boxicons-regular/PowerOff";
import { Update } from "@styled-icons/material/Update";
import { Info } from "@styled-icons/bootstrap/Info";
import { Menu } from "antd";

interface AppIconProps {
  size: string;
}

export const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
  background: transparent;
  border-top: 1px solid ${(props) => `rgba(${props.theme.borderRgba})`};
`;

export const AppNameContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const OSInfoContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const AppIcon = styled.img<AppIconProps>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  margin-right: 5px;
`;

export const AppleIcon = styled(Apple)`
  margin-left: 10px;
  color: ${(props) => props.theme.text};
`;

export const AppName = styled.span`
  font-weight: bolder;
  font-size: 14px;
  color: ${(props) => props.theme.text};
`;

export const VersionName = styled.span`
  font-weight: lighter;
  font-size: 11px;
  margin-top: 6px;
  margin-left: 2px;
  color: ${(props) => props.theme.text};
`;

export const SettingsIcon = styled(Settings2Outline)`
  color: ${(props) => props.theme.text};
  width: 1.5em;
  height: 1.5em;
`;

export const PowerIcon = styled(PowerOff)`
  color: crimson;
  width: 1.5em;
  height: 1.5em;
`;

export const TranslucentMenu = styled(Menu)`
  background-color: rgba(255, 255, 255, 0.2);

  &.ant-dropdown-menu,
  &.ant-menu-submenu,
  &.ant-menu-item {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UpdateIcon = styled(Update)`
  color: ${(props) => props.theme.text};
  width: 1.5em;
  height: 1.5em;
`;

export const InfoIcon = styled(Info)`
  color: ${(props) => props.theme.text};
  width: 1.5em;
  height: 1.5em;
`;

export const MenuItemText = styled.span`
  font-weight: normal;
  color: ${(props) => props.theme.text};
`;

export const QuitText = styled.span`
  color: crimson;
`;
