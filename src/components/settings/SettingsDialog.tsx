import {
    DarkIcon, LightIcon, StyledForm, StyledInput, StyledSwitch,
    SystemIcon,
    ThemeOption,
    ThemeOptionsContainer,
    ThemeText, TranslucentModal
} from "./styles.ts";
import React, {useEffect, useState} from "react";
import {Form, Skeleton} from "antd";
import {useTheme} from "../../hooks/useTheme.ts";
import {AppTheme} from "../../utils/FrontendUtils.ts";
import {autostart} from "../../lib/autostart.ts";
import {prefersDarkMode} from "../../utils/theme.ts";
import {getSettings, saveSettings} from "../../utils/TauriUtils.ts";

interface SettingsDialogProps {
    isVisible: boolean;
    onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({isVisible, onClose}) => {
    const [globalHotkey, setGlobalHotkey] = useState('');
    const {darkMode, setDarkMode} = useTheme();
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isVisible) {
            const checkAutostart = async () => setChecked(
                await autostart.isEnabled()
            );
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
    }

    const handleThemeChange = (newTheme: AppTheme) => {
        setDarkMode(newTheme)
    }

    const handleHotkeyChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
        let hotkeyCombination = '';

        if (event.metaKey) {
            hotkeyCombination += "Cmd + ";
        }

        if (event.shiftKey) {
            hotkeyCombination += "Shift + ";
        }

        if (event.ctrlKey) {
            hotkeyCombination += "Ctrl + ";
        }

        if (event.altKey) {
            hotkeyCombination += "Alt + ";
        }

        if (event.key.length === 1 || event.key === "Backspace") {
            hotkeyCombination += event.key === "Backspace" ? "" : event.key.toUpperCase();
        }

        if (!hotkeyCombination.endsWith("+ ")) {
            console.log("Hotkey value", hotkeyCombination);
            setGlobalHotkey(hotkeyCombination);
        } else {
            console.log("Incomplete hotkey combination");
        }

        event.preventDefault();
    }

    return (
        <TranslucentModal
            centered={true}
            title="Settings"
            open={isVisible}
            onOk={() => saveSettings(globalHotkey)}
            onCancel={onClose}
        >

            <StyledForm layout="horizontal">
                {loading ? (
                    <Skeleton.Avatar active size="default" shape="circle"/>
                ) : (
                    <Form.Item label="Launch at login">
                        <StyledSwitch
                            checked={checked}
                            onChange={handleLaunchChange}
                        />
                    </Form.Item>
                )}

                <Form.Item label="SysScope Hotkey">
                    <StyledInput
                        placeholder="Enter hotkey combination"
                        value={globalHotkey}
                        onKeyDown={handleHotkeyChange}
                        readOnly
                    />
                </Form.Item>

                <Form.Item label="Appearance">
                    <ThemeOptionsContainer>
                        <ThemeOption
                            isActive={darkMode === 'light'}
                            onClick={() => handleThemeChange('light')}>
                            <LightIcon isActive={darkMode === 'light'}/>
                            <ThemeText
                                isActive={darkMode === 'light'}
                                isLight={darkMode === 'light'}
                            >Light
                            </ThemeText>
                        </ThemeOption>
                        <ThemeOption
                            isActive={darkMode === 'dark'}
                            onClick={() => handleThemeChange('dark')}>
                            <DarkIcon isActive={darkMode === 'dark'}/>
                            <ThemeText
                                isActive={darkMode === 'dark'}
                                isLight={false}
                            >Dark
                            </ThemeText>
                        </ThemeOption>
                        <ThemeOption
                            isActive={darkMode === 'auto'}
                            onClick={() => handleThemeChange('auto')}>
                            <SystemIcon isActive={darkMode === 'auto'}/>
                            <ThemeText
                                isActive={darkMode === 'auto'}
                                isLight={!prefersDarkMode.matches}
                            >System
                            </ThemeText>
                        </ThemeOption>
                    </ThemeOptionsContainer>
                </Form.Item>
            </StyledForm>

        </TranslucentModal>
    )
}

export default SettingsDialog;