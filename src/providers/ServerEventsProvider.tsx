import React, {createContext} from "react";
import {
    Cpu,
    DeviceBattery,
    Disk,
    GlobalCpu,
    Memory,
    Network,
    Process,
    ServerEvent,
    Swap,
    SysInfo
} from "../lib/types.ts";
import useServerEventsEnumerableStore, {Enumerable} from "../hooks/useServerEventsEnumerableStore.tsx";
import useServerEventsStore from "../hooks/useServerEventsStore.tsx";


interface ServerEventsProviderProps {
    children: React.ReactNode;
}

interface ServerEventsContext {
    globalCpu: GlobalCpu[];
    memory: Memory[];
    swap: Swap[];
    sysInfo: SysInfo | null;
    processes: Process[];
    networks: Enumerable<Network>[];
    cpus: Enumerable<Cpu>[];
    disks: Enumerable<Disk>[];
    batteries: DeviceBattery[];
}

export const ServerEventsContext = createContext<ServerEventsContext>({
    batteries: [],
    cpus: [],
    disks: [],
    globalCpu: [],
    memory: [],
    networks: [],
    processes: [],
    swap: [],
    sysInfo: null,
});

const maxSize = 60 * 10;

const ServerEventsProvider: React.FC<ServerEventsProviderProps> = ({ children }) => {
    const [sysInfo] = useServerEventsStore<SysInfo>(ServerEvent.SysInfo, { maxSize: 1});
    const [globalCpu] = useServerEventsStore<GlobalCpu>(ServerEvent.GlobalCpu, { maxSize });
    const [memory] = useServerEventsStore<Memory>(ServerEvent.Memory, { maxSize });
    const [swap] = useServerEventsStore<Swap>(ServerEvent.Swap, { maxSize });
    const [processes] = useServerEventsStore<Process[]>(ServerEvent.Processes, { maxSize: 1 });
    const [networks] = useServerEventsEnumerableStore<Network>(ServerEvent.Networks, { maxSize });
    const [cpus] = useServerEventsEnumerableStore<Cpu>(ServerEvent.Cpus, { maxSize: 1});
    const [disks] = useServerEventsEnumerableStore<Disk>(ServerEvent.Disks, { maxSize });
    const [batteries] = useServerEventsStore<DeviceBattery>(ServerEvent.Batteries, { maxSize: 1 });

    return (
        <ServerEventsContext.Provider
            value={{
                sysInfo: sysInfo[sysInfo.length - 1] ?? null, // get latest sysInfo
                globalCpu,
                memory,
                swap,
                processes: processes[processes.length - 1] ?? [], // Get latest processes
                networks,
                cpus,
                disks,
                batteries
            }}
            >
            {children}
        </ServerEventsContext.Provider>
    )
}

export default ServerEventsProvider;

