import styled, { css, keyframes } from "styled-components";
import { Form, Input, Modal, Popover, Switch } from "antd";
import { Sun } from "@styled-icons/bootstrap/Sun";
import { Moon } from "@styled-icons/bootstrap/Moon";
import { DarkTheme } from "@styled-icons/fluentui-system-regular/DarkTheme";

export const TranslucentModal = styled(Modal)`
  .ant-modal-content {
    background-color: ${(props) => `rgba(${props.theme.modalRgba})`};
  }

  .ant-modal-header {
    background-color: transparent;
    color: ${(props) => props.theme.text};
  }
  .ant-modal-close-x {
    color: ${(props) => props.theme.text};
  }
  .ant-modal-title {
    color: ${(props) => props.theme.text};
  }
`;

const iconStyles = css<{ isActive: boolean }>`
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  padding: 4px;
  box-sizing: content-box;

  ${(props) =>
    props.isActive
      ? css`
          color: currentColor;
          border: 2px solid currentColor;
        `
      : css`
          color: darkgrey;
          border: 2px solid darkgrey;
        `}
`;

const pulsate = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(41, 231, 94, 0.5);
    }
    70% {
        box-shadow: 0 0 0 15px rgba(41, 231, 94, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(41, 231, 94, 0);
    }
`;

export const LightIcon = styled(Sun)<{ isActive: boolean }>`
  ${iconStyles};
  color: ${(props) => (props.isActive ? "darkkhaki" : "darkgrey")};
`;

export const DarkIcon = styled(Moon)<{ isActive: boolean }>`
  ${iconStyles};
  color: ${(props) => (props.isActive ? "plum" : "darkgrey")};
`;

export const SystemIcon = styled(DarkTheme)<{ isActive: boolean }>`
  ${iconStyles};
  color: ${(props) => (props.isActive ? "chocolate" : "darkgrey")};
  transform: rotate(140deg);
`;

export const ThemeOption = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
`;

export const ThemeOptionsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const ThemeText = styled.div<{ isActive: boolean; isLight: boolean }>`
  padding: 4px;
  border-radius: 4px;
  color: #ccc;
  border: 1px solid transparent;
  margin-top: 5px;

  ${(props) =>
    props.isActive &&
    css`
      background-color: ${(props) => props.theme.text};
      color: ${props.isLight ? "white" : "black"};
    `}
`;

export const StyledForm = styled(Form)`
  &&& label {
    color: ${(props) => props.theme.text};
  }
`;

export const StyledSwitch = styled(Switch)`
  &&& {
    &.ant-switch {
      background-color: grey;
    }
    &.ant-switch-checked {
      background-color: green;
    }
  }
`;

export const StyledInput = styled(Input)`
  background-color: rgba(255, 255, 255, 0.2);
  color: ${(props) => props.theme.text};
  border: none;
  outline: none;

  &:focus {
    animation: ${pulsate} 1.5s infinite;
  }

  &::placeholder {
    color: grey;
    opacity: 1;
  }
`;

export const StyledPopover = styled(Popover)``;

export const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const HotkeyDisplay = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

export const KeyBlock = styled.span`
  background-color: ${(props) => `rgba(${props.theme.hoverRgba})`};
  color: ${(props) => props.theme.text};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
`;

export const PlaceholderText = styled.span`
  color: ${(props) => props.theme.text};
  font-size: 16px;
`;

export const RecordingText = styled.div`
  color: ${(props) => props.theme.text};
  font-size: 14px;
`;
