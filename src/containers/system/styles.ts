import styled from "styled-components";
import { Cpu } from "@styled-icons/feather/Cpu";
import { Memory } from "@styled-icons/bootstrap/Memory";
import { Storage } from "@styled-icons/material-outlined/Storage";
import { BatteryFull } from "@styled-icons/bootstrap/BatteryFull";

export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background: transparent;
`;

export const Sidebar = styled.div`
  width: 200px;
  background: transparent;
  border-right: 1px solid ${(props) => `rgba(${props.theme.borderRgba})`};
  padding: 40px 20px 20px;
`;

export const SidebarItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: ${(props) => props.theme.text};
  padding: 10px;
  &:hover {
    background-color: ${(props) => `rgba(${props.theme.hoverRgba})`};
    border-radius: 10px;
  }
  &.active {
    background-color: ${(props) => props.theme.active};
    border-radius: 10px;
  }
`;

export const Content = styled.div`
  flex-grow: 1;
  background: transparent;
  padding: 20px;
  overflow-y: auto;
`;

export const AppWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const CpuIcon = styled(Cpu)`
  color: #ec5020;
  margin-right: 8px;
  width: 20px;
  height: 20px;
`;

export const MemoryIcon = styled(Memory)`
  color: bisque;
  margin-right: 8px;
  width: 20px;
  height: 20px;
`;

export const DiskIcon = styled(Storage)`
  color: darkkhaki;
  margin-right: 8px;
  width: 20px;
  height: 20px;
`;

export const BatteryIcon = styled(BatteryFull)`
  color: greenyellow;
  margin-right: 8px;
  width: 20px;
  height: 20px;
`;
