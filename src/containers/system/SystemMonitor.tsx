import React, {useState} from "react";
import CpuComponent from "../../components/cpu/CpuComponent.tsx";
import {
    AppContainer,
    AppWindow,
    BatteryIcon,
    Content,
    CpuIcon,
    DiskIcon,
    MemoryIcon,
    Sidebar,
    SidebarItem
} from "./styles.ts";
import MemoryComponent from "../../components/memory/MemoryComponent.tsx";
import BatteryComponent from "../../components/battery/BatteryComponent.tsx";
import NetworkComponent from "../../components/network/NetworkComponent.tsx";
import FooterComponent from "../../components/footer/FooterComponent.tsx";
import DiskComponent from "../../components/disk/DiskComponent.tsx";
import SettingsDialog from "../../components/settings/SettingsDialog.tsx";

type SidebarItemType = 'cpu' | 'memory' | 'disk' | 'battery' | 'network';

const SystemMonitor: React.FC = () => {
    const [activeItem, setActiveItem] = useState<SidebarItemType>('cpu');
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

    const showSettingsDialog = () => {
        setIsDialogVisible(true);
    }

    const hideSettingsDialog = () => {
        setIsDialogVisible(false);
    }


    const renderActiveComponent = () => {
        switch (activeItem) {
            case "cpu":
                return <CpuComponent/>;
            case "memory":
                return <MemoryComponent />;
            case "disk":
                return <DiskComponent />;
            case "battery":
                return <BatteryComponent />;
            case "network":
                return <NetworkComponent/>
            default:
                return null;
        }
    };

    return (
        <AppWindow>
            <AppContainer>
                <Sidebar>
                    <SidebarItem
                        className={activeItem == 'cpu' ? 'active' : ''}
                        onClick={() => setActiveItem('cpu')}
                    >
                       <CpuIcon/> CPU
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'memory' ? 'active' : ''}
                        onClick={() => setActiveItem('memory')}
                    >
                        <MemoryIcon/> Memory
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'disk' ? 'active' : ''}
                        onClick={() => setActiveItem('disk')}
                    >
                        <DiskIcon/> Disk
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'battery' ? 'active' : ''}
                        onClick={() => setActiveItem('battery')}
                    >
                        <BatteryIcon/> Battery
                    </SidebarItem>
                    {/*<SidebarItem*/}
                    {/*    className={activeItem == 'network' ? 'active' : ''}*/}
                    {/*    onClick={() => setActiveItem('network')}*/}
                    {/*>Network*/}
                    {/*</SidebarItem>*/}
                </Sidebar>
                <Content>
                    {renderActiveComponent()}
                </Content>
                <SettingsDialog isVisible={isDialogVisible} onClose={hideSettingsDialog}/>
            </AppContainer>
            <FooterComponent openSettings={showSettingsDialog}/>
        </AppWindow>
    );
}

export default SystemMonitor;