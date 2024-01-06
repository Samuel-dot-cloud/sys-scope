import React, {useState} from "react";
import CpuComponent from "../../components/cpu/CpuComponent.tsx";
import {AppContainer, AppWindow, Content, Sidebar, SidebarItem} from "./styles.ts";
import MemoryComponent from "../../components/memory/MemoryComponent.tsx";
import BatteryComponent from "../../components/battery/BatteryComponent.tsx";
import NetworkComponent from "../../components/network/NetworkComponent.tsx";
import FooterComponent from "../../components/footer/FooterComponent.tsx";

type SidebarItemType = 'cpu' | 'memory' | 'battery' | 'network';

const SystemMonitor: React.FC = () => {
    const [activeItem, setActiveItem] = useState<SidebarItemType>('cpu');

    const cpuUsage = '8%';

    const cpuAverageLoad = [
        {label: '1 min', value: '1.40'},
        {label: '5 min', value: '1.58'},
        {label: '15 min', value: '2.23'},
    ];

    const cpuProcesses = [
        {label: 'Notion Helper (Renderer)', value: '9.1%'},
        {label: 'Raycast', value: '7.8%'},
        // ... more processes
    ];

    const uptime = '44 minutes ago';

    const networkSpeeds = {
        downloadSpeed: '0 B/s',
        uploadSpeed: '286 B/s'
    };

    const networkProcesses = [
        {name: 'systemstats', download: '0 B/s', upload: '0 B/s'},
        {name: 'configd', download: '0 B/s', upload: '0 B/s'},
        // ...more processes
    ];

    const memoryDetails = [
        {label: 'Total Disk Space', value: '17.41 GB'},
        {label: 'Free Disk Space', value: '489.3 MB'},
        {label: 'Total RAM', value: '32 GB'},
        {label: 'Free RAM', value: '15 GB'},
        {label: 'Free RAM %', value: '47%'},
    ];

    const processes = [
        {name: 'rustrover', ram: '3465 MB'},
        {name: 'node', ram: '472 MB'},
        // ... more processes
    ];

    const powerDetails = [
        {label: 'Battery Level', value: '98%'},
        {label: 'Charging', value: 'No'},
        {label: 'Cycle Count', value: '64'},
        {label: 'Condition', value: 'Normal'},
        {label: 'Maximum Battery Capacity', value: '100%'},
        {label: 'Time to discharge', value: '14:54'},
        {label: 'Time on battery', value: '12:36:11'},
    ];

    const renderActiveComponent = () => {
        switch (activeItem) {
            case "cpu":
                return <CpuComponent
                    usage={cpuUsage}
                    averageLoad={cpuAverageLoad}
                    uptime={uptime}
                    processes={cpuProcesses}
                />;
            case "memory":
                return <MemoryComponent
                    memoryDetails={memoryDetails}
                    processes={processes}
                />;
            case "battery":
                return <BatteryComponent details={powerDetails}/>;
            case "network":
                return <NetworkComponent
                    downloadSpeed={networkSpeeds.downloadSpeed}
                    uploadSpeed={networkSpeeds.uploadSpeed}
                    processes={networkProcesses}
                />
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
                        className={activeItem == 'battery' ? 'active' : ''}
                        onClick={() => setActiveItem('battery')}
                    >Battery
                    </SidebarItem>
                    <SidebarItem
                        className={activeItem == 'network' ? 'active' : ''}
                        onClick={() => setActiveItem('network')}
                    >Network
                    </SidebarItem>
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