use crate::helpers::process::convert_processes;
use crate::macos::{
    fetch_battery_info, get_cpu_info, get_disk_info, get_disk_processes, get_memory_info,
    get_top_battery_processes, get_top_cpu_processes, get_top_memory_processes,
};
use crate::models::{
    BatteryTrait, Cpu, CpuTrait, DeviceBattery, Disk, DiskTrait, LoadAverage, Memory,
    MemoryProcess, MemoryTrait, Network, NetworkTrait, Process, ProcessTrait, Swap, SwapTrait,
    SysInfo, SystemInformationTrait, TopProcess,
};
use crate::utils::{current_time, get_percentage, round};
use sysinfo::{Networks, System};

pub struct Metrics {
    sys: System,
    networks: Networks,
}

impl Default for Metrics {
    fn default() -> Self {
        Metrics {
            sys: System::new_all(),
            networks: Networks::new_with_refreshed_list(),
        }
    }
}

impl SystemInformationTrait for Metrics {
    fn get_system_information(&mut self) -> SysInfo {
        self.sys.refresh_all();

        let kernel_version = System::kernel_version().unwrap_or("Unknown".to_string());
        let os_version = System::long_os_version().unwrap_or("Unknown".to_string());
        let hostname = System::host_name().unwrap_or("Unknown".to_string());
        let core_count = self.sys.physical_core_count().unwrap_or(0).to_string();
        let uptime = System::uptime();
        let load_average = System::load_average();

        SysInfo {
            kernel_version,
            os_version,
            hostname,
            core_count,
            uptime,
            timestamp: current_time(),
            load_average: LoadAverage {
                one: load_average.one,
                five: load_average.five,
                fifteen: load_average.fifteen,
            },
        }
    }
}

impl CpuTrait for Metrics {
    fn get_cpu(&mut self) -> Cpu {
        let swift_cpu_info = unsafe { get_cpu_info() };

        let (user, system, idle) = match swift_cpu_info {
            Some(info) => (info.user as f32, info.system as f32, info.idle as f32),
            None => (0.0, 0.0, 0.0),
        };

        Cpu { user, system, idle }
    }

    fn get_cpu_processes(&mut self) -> Vec<crate::models::CpuProcess> {
        let top_processes_swift = unsafe { get_top_cpu_processes() };
        let top_processes_rust = convert_processes(top_processes_swift);

        top_processes_rust
    }
}

impl DiskTrait for Metrics {
    fn get_disk(&mut self) -> Disk {
        let swift_disk_info = unsafe { get_disk_info() };

        let (
            mount_point,
            total_space,
            free_space,
            bytes_read,
            bytes_written,
            file_system,
            is_removable,
        ) = match swift_disk_info {
            Some(info) => (
                info.mount_point.parse().unwrap_or_default(),
                info.total_space as u64,
                info.free_space as u64,
                info.bytes_read as u64,
                info.bytes_written as u64,
                info.file_system_type.parse().unwrap_or_default(),
                info.is_removable as bool,
            ),
            None => ("".to_string(), 0, 0, 0, 0, "".to_string(), false),
        };

        let total = total_space;
        let free = free_space;
        let used = total - free;

        Disk {
            name: String::from("Macintosh HD"),
            free,
            used,
            total,
            mount_point: mount_point.clone(),
            file_system,
            is_removable,
            disk_type: String::from(""),
            bytes_read,
            bytes_written,
        }
    }

    fn get_disk_processes(&mut self) -> Vec<crate::models::DiskProcess> {
        let swift_disk_processes = unsafe { get_disk_processes() };
        let rust_disk_processes: Vec<crate::models::DiskProcess> =
            convert_processes(swift_disk_processes);

        rust_disk_processes
    }
}

impl SwapTrait for Metrics {
    fn get_swap(&mut self) -> Swap {
        self.sys.refresh_memory();

        Swap {
            free: self.sys.free_swap(),
            total: self.sys.total_swap(),
            used: self.sys.used_swap(),
            used_percentage: get_percentage(&self.sys.used_swap(), &self.sys.total_swap()),
            timestamp: current_time(),
        }
    }
}

impl MemoryTrait for Metrics {
    fn get_memory(&mut self) -> Memory {
        let swift_memory_info = unsafe { get_memory_info() };

        let (active, inactive, wired, compressed, free, total, used, app) = match swift_memory_info
        {
            Some(info) => (
                info.active as u64,
                info.inactive as u64,
                info.wired as u64,
                info.compressed as u64,
                info.free as u64,
                info.total as u64,
                info.used as u64,
                info.app as u64,
            ),
            None => (0, 0, 0, 0, 0, 0, 0, 0),
        };

        Memory {
            free,
            total,
            used,
            wired,
            compressed,
            active,
            inactive,
            app,
        }
    }

    fn get_memory_processes(&mut self) -> Vec<MemoryProcess> {
        let top_processes_swift = unsafe { get_top_memory_processes() };
        let top_processes_rust: Vec<MemoryProcess> = convert_processes(top_processes_swift);

        top_processes_rust
    }
}

impl ProcessTrait for Metrics {
    fn get_processes(&mut self) -> Vec<Process> {
        self.sys.refresh_processes();

        let cpu_count = self.sys.physical_core_count().unwrap_or(1);

        let processes: Vec<Process> = self
            .sys
            .processes()
            .iter()
            .map(|(pid, process)| {
                let name = process.name().to_owned();
                let cpu_usage = round(process.cpu_usage() / cpu_count as f32);
                let pid = pid.to_string();
                let memory_usage = process.memory();

                let status = match process.status() {
                    sysinfo::ProcessStatus::Run => "Running".to_owned(),
                    sysinfo::ProcessStatus::Sleep => "Sleeping".to_owned(),
                    sysinfo::ProcessStatus::Stop => "Stopped".to_owned(),
                    sysinfo::ProcessStatus::Idle => "Idle".to_owned(),
                    sysinfo::ProcessStatus::Zombie => "Zombie".to_owned(),
                    _ => "Unknown".to_string(),
                };

                Process {
                    name,
                    pid,
                    cpu_usage,
                    memory_usage,
                    status,
                }
            })
            .collect();

        processes
    }
}

// TODO: Find a means of displaying accurate network info as sysinfo crate does not cut it.
impl NetworkTrait for Metrics {
    fn get_networks(&mut self) -> Vec<Network> {
        let networks: Vec<Network> = self
            .networks
            .into_iter()
            .map(|(name, network)| {
                let name = name.to_owned();

                Network {
                    name,
                    received: network.received(),
                    transmitted: network.transmitted(),
                    timestamp: current_time(),
                }
            })
            .collect();

        networks
    }
}

impl BatteryTrait for Metrics {
    fn get_battery(&mut self) -> DeviceBattery {
        let swift_battery_info = unsafe { fetch_battery_info() };

        DeviceBattery {
            charge_percent: swift_battery_info.charge,
            secs_until_full: swift_battery_info.time_to_full as i64,
            secs_until_empty: swift_battery_info.time_to_empty as i64,
            power_consumption_rate_watts: swift_battery_info.watts,
            health_percent: swift_battery_info.health,
            power_source: swift_battery_info.power_source.parse().unwrap(),
            cycle_count: swift_battery_info.cycle_count as u32,
            temperature: swift_battery_info.temperature,
            energy: swift_battery_info.amperage as f64,
            voltage: swift_battery_info.voltage,
        }
    }

    fn get_battery_processes(&mut self) -> Vec<TopProcess> {
        let top_processes_swift = unsafe { get_top_battery_processes() };
        let top_processes_rust: Vec<TopProcess> = convert_processes(top_processes_swift);

        top_processes_rust
    }
}
