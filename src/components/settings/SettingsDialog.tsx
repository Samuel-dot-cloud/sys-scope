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
  const [displayHotkey, setDisplayHotkey] = useState("");
  const [currentInput, setCurrentInput] = useState<string[]>([]);
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
            const hotkeyArray = response.toggleAppShortcut.split(" + ");
            setDisplayHotkey(mapToSymbols(hotkeyArray));
          }
        } catch (error) {
          console.error("Failed to fetch settings: ", error);
        }
      };
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      " ": "Space",
    };
    return keyMap[key] || key.toUpperCase();
  };

  const mapToSymbols = (hotkey: string[]): string => {
    return hotkey.map(keyToSymbol).join(" + ");
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();

    setCurrentInput((prevKeys) => {
      const key = event.key;
      const newKeys = prevKeys.includes(key) ? prevKeys : [...prevKeys, key];
      setDisplayHotkey(mapToSymbols(newKeys));

      return newKeys;
    });

    document.addEventListener("keyup", handleKeyUp);
  };

  const handleKeyUp = () => {
    setCurrentInput((prevKeys) => {
      const hotkeyString = prevKeys.join(" + ");
      saveSettings(hotkeyString)
        .then(() => {
          toast.success("Global hotkey saved!", { duration: 1000 });
        })
        .catch((error) =>
          toast.error(`Something went wrong saving the hotkey: ${error}`),
        );
      setIsPopoverVisible(false);
      return prevKeys;
    });

    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  {currentInput.length ? (
                    currentInput.map((key, index) => (
                      <KeyBlock key={index}>{keyToSymbol(key)}</KeyBlock>
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
                setCurrentInput([]);
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
