import React, {createContext} from "react";
import {
    Cpu,
    DeviceBattery,
    Disk,
    GlobalCpu, LoadAverage,
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
    sysInfo: SysInfo;
    processes: Process[];
    networks: Enumerable<Network>[];
    cpus: Enumerable<Cpu>[];
    disks: Enumerable<Disk>[];
    batteries: DeviceBattery[];
}

const load: LoadAverage = {
    one: 0,
    five: 0,
    fifteen: 0,
}

const sysInfo: SysInfo = {
    hostname: "",
    kernelVersion: "",
    osVersion: "",
    coreCount: "",
    uptime: 0,
    timestamp: 0,
    loadAverage: load,

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
    sysInfo: sysInfo,
});

const maxSize = 60 * 10;

const ServerEventsProvider: React.FC<ServerEventsProviderProps> = ({ children }) => {
    const [sysInfo] = useServerEventsStore<SysInfo>(ServerEvent.SysInfo, { maxSize: 1});
    const [globalCpu] = useServerEventsStore<GlobalCpu[]>(ServerEvent.GlobalCpu, { maxSize: 1 });
    const [memory] = useServerEventsStore<Memory>(ServerEvent.Memory, { maxSize });
    const [swap] = useServerEventsStore<Swap>(ServerEvent.Swap, { maxSize });
    const [processes] = useServerEventsStore<Process[]>(ServerEvent.Processes, { maxSize: 1 });
    const [networks] = useServerEventsEnumerableStore<Network>(ServerEvent.Networks, { maxSize });
    const [cpus] = useServerEventsEnumerableStore<Cpu>(ServerEvent.Cpus, { maxSize: 1});
    const [disks] = useServerEventsEnumerableStore<Disk>(ServerEvent.Disks, { maxSize });
    const [batteries] = useServerEventsStore<DeviceBattery[]>(ServerEvent.Batteries, { maxSize: 1 });

    return (
        <ServerEventsContext.Provider
            value={{
                sysInfo: sysInfo[sysInfo.length - 1], // get latest sysInfo
                globalCpu: globalCpu[globalCpu.length - 1] ?? [],
                memory,
                swap,
                processes: processes[processes.length - 1] ?? [], // Get latest processes
                networks,
                cpus,
                disks,
                batteries: batteries[batteries.length - 1] ?? [],
            }}
            >
            {children}
        </ServerEventsContext.Provider>
    )
}

export default ServerEventsProvider;

