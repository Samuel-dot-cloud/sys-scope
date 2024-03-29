use std::path::PathBuf;
use serde::{Serialize, Deserialize};


#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Timestamp(pub i64);
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LoadAverage {
    pub one: f64,
    pub five: f64,
    pub fifteen: f64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Memory {
    pub free: u64,
    pub total: u64,
    pub used: u64,
    pub used_percentage: f64,
    pub timestamp: Timestamp,
}

pub trait MemoryTrait {
    fn get_memory(&mut self) -> Memory;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalCpu {
    pub usage: f32,
    pub brand: String,
    pub frequency: u64,
    pub name: String,
    pub vendor: String,
    pub timestamp: Timestamp,
}

pub trait GlobalCpuTrait {
    fn get_global_cpus(&mut self) -> Vec<GlobalCpu>;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cpu {
    pub name: String,
    pub usage: f64,
    pub timestamp: Timestamp,
}

pub trait CpuTrait {
    fn get_cpus(&mut self) -> Vec<Cpu>;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Swap {
    pub free: u64,
    pub total: u64,
    pub used: u64,
    pub used_percentage: f64,
    pub timestamp: Timestamp,
}

pub trait SwapTrait {
    fn get_swap(&mut self) -> Swap;
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SysInfo {
    pub kernel_version: String,
    pub os_version: String,
    pub hostname: String,
    pub core_count: String,
    pub uptime: u64,
    pub timestamp: Timestamp,
    pub load_average: LoadAverage,
}

pub trait SystemInformationTrait {
    fn get_system_information(&mut self) -> SysInfo;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Network {
    pub name: String,
    pub received: u64,
    pub transmitted: u64,
    pub timestamp: Timestamp,
}

pub trait NetworkTrait {
    fn get_networks(&mut self) -> Vec<Network>;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Disk {
    pub name: String,
    pub free: u64,
    pub total: u64,
    pub used: u64,
    pub mount_point: PathBuf,
    pub file_system: String,
    pub disk_type: String,
    pub is_removable: bool,
    pub timestamp: Timestamp,
}

pub trait DiskTrait {
    fn get_disks(&mut self) -> Vec<Disk>;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Process {
    pub name: String,
    pub pid: String,
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub status: String,
}

pub trait ProcessTrait {
    fn get_processes(&mut self) -> Vec<Process>;
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceBattery {
    pub charge_percent: f64,
    pub secs_until_full: i64,
    pub secs_until_empty: i64,
    pub power_consumption_rate_watts: f64,
    pub health_percent: f64,
    pub vendor: String,
    pub technology: String,
    pub cycle_count: u32,
    pub model: String,
    pub state: String,
    pub temperature: f64,
    pub energy: f64,
    pub energy_full: f64,
    pub voltage: f64,
}

pub trait BatteryTrait {
    fn get_batteries(&mut self) -> Vec<DeviceBattery>;
}

