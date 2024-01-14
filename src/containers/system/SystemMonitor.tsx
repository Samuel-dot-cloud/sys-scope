import React, {useState} from "react";
import CpuComponent from "../../components/cpu/CpuComponent.tsx";
import {AppContainer, AppWindow, Content, Sidebar, SidebarItem} from "./styles.ts";
import MemoryComponent from "../../components/memory/MemoryComponent.tsx";
import BatteryComponent from "../../components/battery/BatteryComponent.tsx";
import NetworkComponent from "../../components/network/NetworkComponent.tsx";
import FooterComponent from "../../components/footer/FooterComponent.tsx";
import DiskComponent from "../../components/disk/DiskComponent.tsx";

type SidebarItemType = 'cpu' | 'memory' | 'disk' | 'battery' | 'network';

const SystemMonitor: React.FC = () => {
    const [activeItem, setActiveItem] = useState<SidebarItemType>('cpu');


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
                    >CPU
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'memory' ? 'active' : ''}
                        onClick={() => setActiveItem('memory')}
                    >Memory
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'disk' ? 'active' : ''}
                        onClick={() => setActiveItem('disk')}
                    >Disk
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'battery' ? 'active' : ''}
                        onClick={() => setActiveItem('battery')}
                    >Battery
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
            </AppContainer>
            <FooterComponent/>
        </AppWindow>
    );
}

export default SystemMonitor;