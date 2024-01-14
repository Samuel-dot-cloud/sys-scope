import styled from "styled-components";
import { Settings2Outline } from "@styled-icons/evaicons-outline/Settings2Outline";
import { Discord } from "@styled-icons/boxicons-logos/Discord";
import { Apple } from "@styled-icons/boxicons-logos/Apple";

export const FooterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 20px;
    background: transparent;
    border-top: 1px solid ${props => `rgba(${props.theme.borderRgba})`};
`;

export const AppNameContainer = styled.div`
    display: flex;
    align-items: center;
`;

export const AppIcon = styled(Discord)`
    margin-right: 10px;
`;

export const AppleIcon = styled(Apple)`
    margin-left: 10px;
    color: ${props => props.theme.text};
`;

export const AppName = styled.span`
    font-weight: bold;
    color: ${props => props.theme.text};
`;

export const SettingsIcon = styled(Settings2Outline)`
    cursor: pointer;
    color: ${props => props.theme.text};
    &:hover {
        opacity: 0.8;
    }
`;