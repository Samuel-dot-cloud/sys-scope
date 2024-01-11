import React, {useState} from "react";
import CpuComponent from "../../components/cpu/CpuComponent.tsx";
import {AppContainer, AppWindow, Content, Sidebar, SidebarItem} from "./styles.ts";
import MemoryComponent from "../../components/memory/MemoryComponent.tsx";
import BatteryComponent from "../../components/battery/BatteryComponent.tsx";
import NetworkComponent from "../../components/network/NetworkComponent.tsx";
import FooterComponent from "../../components/footer/FooterComponent.tsx";
import useServerEventsContext from "../../hooks/useServerEventsContext.tsx";

type SidebarItemType = 'cpu' | 'memory' | 'battery' | 'network';

const SystemMonitor: React.FC = () => {
    const [activeItem, setActiveItem] = useState<SidebarItemType>('cpu');
    const { batteries } = useServerEventsContext();

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

    // TODO: Move this logic into the BatteryComponent
    const powerDetails = [
        {label: 'Vendor', value: batteries.at(-1)?.vendor},
        {label: 'Battery Level', value: `${batteries.at(-1)?.chargePercent}%`},
        {label: 'Charging state', value: batteries.at(-1)?.state},
        {label: 'Cycle Count', value: batteries.at(-1)?.cycleCount},
        {label: 'Technology', value: batteries.at(-1)?.technology},
        {label: 'Maximum Battery Capacity', value: `${batteries.at(-1)?.healthPercent.toFixed(0)}%`},
        {label: 'Time to full battery', value: batteries.at(-1)?.hoursUntilFull},
        {label: 'Time to empty battery', value: batteries.at(-1)?.hoursUntilEmpty},
        {label: 'Temperature', value: `${batteries.at(-1)?.temperature.toFixed(1)} °C`},
        {label: 'Charge', value: `${batteries.at(-1)?.energy.toFixed(3)} MJ / ${batteries.at(-1)?.energyFull.toFixed(3)} MJ`},
        {label: 'Voltage', value: `${batteries.at(-1)?.voltage.toFixed(2)} V`},
        {label: 'Energy rate', value: `${batteries.at(-1)?.powerConsumptionRateWatts} W`},
    ];

    const renderActiveComponent = () => {
        switch (activeItem) {
            case "cpu":
                return <CpuComponent/>;
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