export enum ServerEvent {
    SysInfo = "emit_sysinfo",
    GlobalCpu = "emit_global_cpus",
    Cpus = "emit_cpus",
    Memory = "emit_memory",
    Swap = "emit_swap",
    Networks = "emit_networks",
    Disks = "emit_disks",
    Processes = "emit_processes",
    Batteries = "emit_batteries",
    BatteryProcesses = "emit_battery_processes",
    DiskProcesses = "emit_disk_processes"
}

// Typescript interfaces/types from models.rs

type Timestamp = number;

export interface LoadAverage {
    one: number;
    five: number;
    fifteen: number;
}

export interface SysInfo {
    hostname: string;
    kernelVersion: string;
    osVersion: string;
    coreCount: string;
    uptime: number,
    timestamp: Timestamp;
    loadAverage: LoadAverage;
}

export interface Memory {
    free: number;
    total: number;
    used: number;
    usedPercentage: number;
    timestamp: Timestamp;
}

export interface GlobalCpu {
    usage: number;
    brand: string;
    frequency: number;
    name: string;
    vendor: string;
    timestamp: Timestamp;
}

export interface Cpu {
    name: string;
    usage: number;
    timestamp: Timestamp;
}

export interface Swap {
    free: number;
    total: number;
    used: number;
    usedPercentage: number;
    timestamp: Timestamp;
}

export interface Network {
    name: string;
    received: number;
    transmitted: number;
    timestamp: Timestamp;
}

export interface Disk {
    name: string;
    free: number;
    total: number;
    used: number;
    mountPoint: string;
    fileSystem: string;
    diskType: string;
    isRemovable: boolean;
    bytesRead: number;
    bytesWritten: number;
    timestamp: Timestamp;
}

export interface DiskProcess {
    pid: number;
    name: string;
    bytesRead: number;
    bytesWritten: number;
    iconBase64: string;
}

export interface Process {
    name: string;
    pid: string;
    cpuUsage: number;
    memoryUsage: number;
    status: string;
}

export interface DeviceBattery {
    chargePercent: number;
    secsUntilFull: number;
    secsUntilEmpty: number;
    powerConsumptionRateWatts: number;
    healthPercent: number;
    vendor: string;
    technology: string;
    cycleCount: number;
    model: string;
    state: string;
    temperature: number;
    energy: number;
    energyFull: number;
    voltage: number;
}

export interface BatteryProcess {
    pid: number,
    name: string,
    power: number,
    iconBase64: string
}
