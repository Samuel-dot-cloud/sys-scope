export enum ServerEvent {
  SysInfo = "emit_sysinfo",
  Cpu = "emit_cpu",
  CpuProcesses = "emit_cpu_processes",
  Memory = "emit_memory",
  Swap = "emit_swap",
  Networks = "emit_networks",
  Disks = "emit_disks",
  Processes = "emit_processes",
  Batteries = "emit_batteries",
  BatteryProcesses = "emit_battery_processes",
  DiskProcesses = "emit_disk_processes",
  MemoryProcesses = "emit_memory_processes",
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
  uptime: number;
  timestamp: Timestamp;
  loadAverage: LoadAverage;
}

export interface Memory {
  free: number;
  total: number;
  used: number;
  wired: number;
  compressed: number;
  active: number;
  inactive: number;
  app: number;
}

export interface MemoryProcess {
  pid: number;
  name: string;
  memory: string;
  iconBase64: string;
}

export interface CpuProcess {
  pid: number;
  name: string;
  cpu: number;
  iconBase64: string;
}

export interface Cpu {
  user: number;
  system: number;
  idle: number;
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
  bytesRead: string;
  bytesWritten: string;
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
  pid: number;
  name: string;
  power: number;
  iconBase64: string;
}
