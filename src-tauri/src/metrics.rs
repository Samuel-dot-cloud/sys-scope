use crate::helpers::process::convert_processes;
use crate::macos::{
    fetch_battery_info, get_disk_info, get_disk_processes, get_memory_usage_info, get_top_battery_processes, get_top_memory_processes
};
use crate::models::{
    BatteryTrait, Cpu, CpuTrait, DeviceBattery, Disk, DiskTrait, GlobalCpu, GlobalCpuTrait, LoadAverage, Memory, MemoryProcess, MemoryTrait, Network, NetworkTrait, Process, ProcessTrait, Swap, SwapTrait, SysInfo, SystemInformationTrait, TopProcess
};
use crate::utils::{current_time, get_percentage, round};
use starship_battery::units::electric_potential::volt;
use starship_battery::units::energy::megajoule;
use starship_battery::units::power::watt;
use starship_battery::units::ratio::percent;
use starship_battery::units::thermodynamic_temperature::degree_celsius;
use starship_battery::units::time::second;
use starship_battery::Manager;
use std::thread;
use sysinfo::{Disks, Networks, System};

pub struct Metrics {
    sys: System,
    disks: Disks,
    networks: Networks,
    batteries: Option<Manager>,
}

impl Default for Metrics {
    fn default() -> Self {
        Metrics {
            sys: System::new_all(),
            disks: Disks::new_with_refreshed_list(),
            networks: Networks::new_with_refreshed_list(),
            batteries: Manager::new().ok(),
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

impl GlobalCpuTrait for Metrics {
    fn get_global_cpus(&mut self) -> Vec<GlobalCpu> {
        self.sys.refresh_cpu();
        thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
        self.sys.refresh_cpu();

        let mut global_cpus: Vec<GlobalCpu> = Vec::new();

        for cpu in self.sys.cpus() {
            let usage = if cpu.cpu_usage().is_nan() {
                0.0
            } else {
                cpu.cpu_usage()
            };
            let brand = cpu.brand().to_owned();
            let frequency = cpu.frequency().to_owned();
            let name = cpu.name().to_owned();
            let vendor = cpu.vendor_id().to_owned();

            global_cpus.push(GlobalCpu {
                usage,
                brand,
                frequency,
                name,
                vendor,
                timestamp: current_time(),
            });
        }
        global_cpus
    }
}

impl CpuTrait for Metrics {
    fn get_cpus(&mut self) -> Vec<Cpu> {
        self.sys.refresh_cpu();
        thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
        self.sys.refresh_cpu();

        let cpus: Vec<Cpu> = self
            .sys
            .cpus()
            .iter()
            .map(|cpu| {
                let name = cpu.name().to_owned();
                let usage = cpu.cpu_usage().to_owned() as u64;
                let total = 100;

                Cpu {
                    name,
                    usage: get_percentage(&usage, &total),
                    timestamp: current_time(),
                }
            })
            .collect();

        cpus
    }
}

impl DiskTrait for Metrics {
    fn get_disks(&mut self) -> Vec<Disk> {
        let swift_disk_info = unsafe { get_disk_info() };

        let (total_space, free_space, bytes_read, bytes_written) = match swift_disk_info {
            Some(info) => (
                info.total_space as u64,
                info.free_space as u64,
                info.bytes_read as u64,
                info.bytes_written as u64,
            ),
            None => (0, 0, 0, 0),
        };

        let disks: Vec<Disk> = self
            .disks
            .iter()
            .map(|disk| {
                let name = match disk.name().to_str() {
                    Some("") => disk.mount_point().to_str().unwrap_or("Unknown").to_owned(),
                    Some(name) => name.to_owned(),
                    None => "-----".to_owned(),
                };

                let disk_type = match disk.kind() {
                    sysinfo::DiskKind::HDD => "HDD".to_owned(),
                    sysinfo::DiskKind::SSD => "SSD".to_owned(),
                    _ => "-----".to_owned(),
                };

                let file_system = disk.file_system().to_string_lossy().to_ascii_uppercase();

                let total = total_space;
                let free = free_space;
                let used = total - free;
                let is_removable = disk.is_removable();
                let mount_point = disk.mount_point().to_owned();

                Disk {
                    name,
                    free,
                    used,
                    total,
                    mount_point,
                    file_system,
                    is_removable,
                    disk_type,
                    bytes_read,
                    bytes_written,
                    timestamp: current_time(),
                }
            })
            .collect();

        disks
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
        let swift_memory_info = unsafe { get_memory_usage_info() };

        let (active, inactive, wired, compressed, free, total, used, app) = match swift_memory_info {
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
            None => (0, 0, 0, 0, 0, 0, 0, 0)
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
    fn get_batteries(&mut self) -> Vec<DeviceBattery> {
        let mut device_batteries: Vec<DeviceBattery> = Vec::new();
        let swift_battery_info = unsafe { fetch_battery_info() };

        if let Some(manager) = &self.batteries {
            if let Ok(batteries) = manager.batteries() {
                for battery in batteries {
                    if let Ok(battery_info) = battery {
                        let secs_until_full = battery_info
                            .time_to_full()
                            .map(|time| f64::from(time.get::<second>()) as i64)
                            .unwrap_or(0);
                        let secs_until_empty = battery_info
                            .time_to_empty()
                            .map(|time| f64::from(time.get::<second>()) as i64)
                            .unwrap_or(0);
                        let power_consumption_rate_watts =
                            f64::from(battery_info.energy_rate().get::<watt>());
                        let health_percent =
                            f64::from(battery_info.state_of_health().get::<percent>());
                        // let vendor = battery_info.vendor().unwrap_or("-----").to_owned();
                        let technology = match battery_info.technology() {
                            starship_battery::Technology::LeadAcid => "Lead Acid".to_string(),
                            starship_battery::Technology::LithiumIon => "Lithium Ion".to_string(),
                            starship_battery::Technology::LithiumPolymer => {
                                "Lithium Polymer".to_string()
                            }
                            starship_battery::Technology::NickelMetalHydride => {
                                "Nickel Metal Hydride".to_string()
                            }
                            starship_battery::Technology::NickelCadmium => {
                                "Nickel Cadmium".to_string()
                            }
                            starship_battery::Technology::NickelZinc => "Nickel Zinc".to_string(),
                            starship_battery::Technology::LithiumIronPhosphate => {
                                "Lithium Iron Phosphate".to_string()
                            }
                            starship_battery::Technology::RechargeableAlkalineManganese => {
                                "Rechargeable Alkaline Manganese".to_string()
                            }
                            _ => "-----".to_string(),
                        };
                        let cycle_count = battery_info.cycle_count().unwrap_or(0);
                        let model = battery_info.model().unwrap_or("Unknown").to_string();
                        let state = match battery_info.state() {
                            starship_battery::State::Charging => "Charging".to_string(),
                            starship_battery::State::Discharging => "Discharging".to_string(),
                            starship_battery::State::Empty => "Empty".to_string(),
                            starship_battery::State::Full => "Full".to_string(),
                            _ => "-----".to_string(),
                        };

                        let temperature =
                            f64::from(battery_info.temperature().unwrap().get::<degree_celsius>());
                        let energy = f64::from(battery_info.energy().get::<megajoule>());
                        let energy_full = f64::from(battery_info.energy_full().get::<megajoule>());
                        let voltage = f64::from(battery_info.voltage().get::<volt>());

                        device_batteries.push(DeviceBattery {
                            charge_percent: swift_battery_info.charge,
                            secs_until_full,
                            secs_until_empty,
                            power_consumption_rate_watts,
                            health_percent: health_percent,
                            vendor: swift_battery_info.power_source.parse().unwrap(),
                            technology,
                            cycle_count,
                            model,
                            state,
                            temperature,
                            energy,
                            energy_full,
                            voltage,
                        });
                    }
                }
            }
        }
        device_batteries
    }

    fn get_battery_processes(&mut self) -> Vec<TopProcess> {
        let top_processes_swift = unsafe { get_top_battery_processes() };
        let top_processes_rust: Vec<TopProcess> = convert_processes(top_processes_swift);

        top_processes_rust
    }
}
