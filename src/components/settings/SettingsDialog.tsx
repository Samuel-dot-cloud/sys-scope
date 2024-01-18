import {
    DarkIcon, LightIcon, StyledForm, StyledInput, StyledSwitch,
    SystemIcon,
    ThemeOption,
    ThemeOptionsContainer,
    ThemeText, TranslucentModal
} from "./styles.ts";
import React, {useEffect, useState} from "react";
import {Form} from "antd";
import {useTheme} from "../../hooks/useTheme.ts";
import {AppTheme} from "../../utils/FrontendUtils.ts";

interface SettingsDialogProps {
    isVisible: boolean;
    onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isVisible, onClose }) => {
    const [launchAtLogin, setLaunchAtLogin] = useState(false);
    const [globalHotkey, setGlobalHotkey] = useState('');
    const { darkMode, setDarkMode } = useTheme();

    useEffect(() => {
        if (isVisible) {
            setLaunchAtLogin(false);
            setGlobalHotkey('');
        }
    }, [isVisible]);

    const handleLaunchChange = (checked: boolean) => {
        setLaunchAtLogin(checked);
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

        console.log("Hotkey value", hotkeyCombination)
        setGlobalHotkey(hotkeyCombination);

        event.preventDefault();
    }

    return (
        <TranslucentModal
            centered={true}
            title="Settings"
            open={isVisible}
            footer={null}
            // onOk={onClose}
            onCancel={onClose}
        >

            <StyledForm layout="horizontal">
                <Form.Item label="Launch at login">
                    <StyledSwitch
                        checked={launchAtLogin}
                        onChange={handleLaunchChange}
                        />
                </Form.Item>

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
                            <ThemeText isActive={darkMode === 'light'}>Light</ThemeText>
                        </ThemeOption>
                        <ThemeOption
                            isActive={darkMode === 'dark'}
                            onClick={() => handleThemeChange('dark')}>
                            <DarkIcon isActive={darkMode === 'dark'}/>
                            <ThemeText isActive={darkMode === 'dark'}>Dark</ThemeText>
                        </ThemeOption>
                        <ThemeOption
                            isActive={darkMode === 'auto'}
                            onClick={() => handleThemeChange('auto')}>
                            <SystemIcon isActive={darkMode === 'auto'}/>
                            <ThemeText isActive={darkMode === 'auto'}>System</ThemeText>
                        </ThemeOption>
                    </ThemeOptionsContainer>
                </Form.Item>
            </StyledForm>

        </TranslucentModal>
    )
}

export default SettingsDialog;