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
    //color: #ffffff;
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
`;

export const AppName = styled.span`
    font-weight: bold;
`;

export const SettingsIcon = styled(Settings2Outline)`
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;