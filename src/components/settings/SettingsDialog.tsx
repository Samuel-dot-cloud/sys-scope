import {
  DarkIcon,
  HotkeyDisplay,
  KeyBlock,
  LightIcon,
  PlaceholderText,
  PopoverContent,
  RecordingText,
  StyledForm,
  StyledInput,
  StyledPopover,
  StyledSwitch,
  SystemIcon,
  ThemeOption,
  ThemeOptionsContainer,
  ThemeText,
  TranslucentModal,
} from "./styles.ts";
import React, { useEffect, useState } from "react";
import { Form, Skeleton } from "antd";
import { useTheme } from "../../hooks/useTheme.ts";
import { AppTheme } from "../../utils/FrontendUtils.ts";
import { autostart } from "../../lib/autostart.ts";
import { prefersDarkMode } from "../../utils/theme.ts";
import { getSettings, saveSettings } from "../../utils/TauriUtils.ts";
import toast from "react-hot-toast";

interface SettingsDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isVisible,
  onClose,
}) => {
  const [globalHotkey, setGlobalHotkey] = useState("");
  const [displayHotkey, setDisplayHotkey] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const { darkMode, setDarkMode } = useTheme();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const checkAutostart = async () =>
        setChecked(await autostart.isEnabled());
      checkAutostart();
      setLoading(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const fetchSettings = async () => {
        try {
          const response = await getSettings();
          if (response.toggleAppShortcut) {
            setGlobalHotkey(response.toggleAppShortcut);
            setDisplayHotkey(mapToSymbols(response.toggleAppShortcut));
          }
        } catch (error) {
          console.error("Failed to fetch settings: ", error);
        }
      };
      fetchSettings();
    }
  }, [isVisible]);

  const handleLaunchChange = () => {
    if (!checked) {
      autostart.enable();
    } else {
      autostart.disable();
    }
    setChecked(!checked);
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setDarkMode(newTheme);
  };

  const keyToSymbol = (key: string): string => {
    const keyMap: { [key: string]: string } = {
      Meta: "⌘",
      Shift: "⇧",
      Control: "⌃",
      Alt: "⌥",
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
    };
    return keyMap[key] || key;
  };

  const mapToSymbols = (hotkey: string): string => {
    return hotkey.split(" + ").map(keyToSymbol).join(" + ");
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    let hotkeyCombination = "";

    if (event.metaKey) hotkeyCombination += "Meta + ";
    if (event.shiftKey) hotkeyCombination += "Shift + ";
    if (event.ctrlKey) hotkeyCombination += "Control + ";
    if (event.altKey) hotkeyCombination += "Alt + ";

    if (event.key.length === 1 || event.key.startsWith("Arrow")) {
      hotkeyCombination += event.key.toUpperCase();
    }

    setCurrentInput(mapToSymbols(hotkeyCombination));

    console.log("The hotkey combo: ", mapToSymbols(hotkeyCombination));

    if (!hotkeyCombination.endsWith("+ ")) {
      setGlobalHotkey(hotkeyCombination);
      setDisplayHotkey(mapToSymbols(hotkeyCombination));
      saveSettings(hotkeyCombination).then(() => {
        toast.success("Global hotkey saved!", { duration: 1000 });
      });
      setIsPopoverVisible(false);
      document.removeEventListener("keydown", handleKeyDown);
    } else {
      console.log("Incomplete hotkey combination");
    }

    event.preventDefault();
  };

  const startRecordingHotkey = () => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  };

  useEffect(() => {
    if (isPopoverVisible) {
      startRecordingHotkey();
    }
  }, [isPopoverVisible]);

  return (
    <TranslucentModal
      centered={true}
      title="Settings"
      open={isVisible}
      footer={null}
      onCancel={onClose}
    >
      <StyledForm layout="horizontal">
        {loading ? (
          <Skeleton.Avatar active size="default" shape="circle" />
        ) : (
          <Form.Item label="Launch at login">
            <StyledSwitch checked={checked} onChange={handleLaunchChange} />
          </Form.Item>
        )}

        <Form.Item label="SysScope Hotkey">
          <StyledPopover
            content={
              <PopoverContent>
                <HotkeyDisplay>
                  {currentInput ? (
                    currentInput
                      .split(" + ")
                      .map((key, index) => (
                        <KeyBlock key={index}>{key}</KeyBlock>
                      ))
                  ) : (
                    <PlaceholderText>e.g. ⌘ + ⇧ + A</PlaceholderText>
                  )}
                </HotkeyDisplay>
                <RecordingText>Recording...</RecordingText>
              </PopoverContent>
            }
            trigger="click"
            open={isPopoverVisible}
            onOpenChange={setIsPopoverVisible}
            overlayClassName="custom-popover"
          >
            <StyledInput
              placeholder="Enter hotkey combination"
              value={displayHotkey}
              onClick={() => {
                setIsPopoverVisible(true);
                setCurrentInput("");
              }}
              readOnly
            />
          </StyledPopover>
        </Form.Item>

        <Form.Item label="Appearance">
          <ThemeOptionsContainer>
            <ThemeOption
              isActive={darkMode === "light"}
              onClick={() => handleThemeChange("light")}
            >
              <LightIcon isActive={darkMode === "light"} />
              <ThemeText
                isActive={darkMode === "light"}
                isLight={darkMode === "light"}
              >
                Light
              </ThemeText>
            </ThemeOption>
            <ThemeOption
              isActive={darkMode === "dark"}
              onClick={() => handleThemeChange("dark")}
            >
              <DarkIcon isActive={darkMode === "dark"} />
              <ThemeText isActive={darkMode === "dark"} isLight={false}>
                Dark
              </ThemeText>
            </ThemeOption>
            <ThemeOption
              isActive={darkMode === "auto"}
              onClick={() => handleThemeChange("auto")}
            >
              <SystemIcon isActive={darkMode === "auto"} />
              <ThemeText
                isActive={darkMode === "auto"}
                isLight={!prefersDarkMode.matches}
              >
                System
              </ThemeText>
            </ThemeOption>
          </ThemeOptionsContainer>
        </Form.Item>
      </StyledForm>
    </TranslucentModal>
  );
};

export default SettingsDialog;
