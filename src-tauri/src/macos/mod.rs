#![cfg(target_os = "macos")]

use swift_rs::{swift, Bool, Double, Int, SRObject, SRObjectArray, SRString};

pub type NSObject = *mut std::ffi::c_void;

#[repr(C)]
pub struct BatteryInfo {
    pub power_source: SRString,

    pub time_to_full: Int,
    pub time_to_empty: Int,

    pub current_capacity: Int,
    pub max_capacity: Int,
    pub design_capacity: Int,

    pub cycle_count: Int,
    pub design_cycle_count: Int,

    pub ac_powered: Bool,
    pub is_charging: Bool,
    pub is_charged: Bool,
    pub amperage: Int,
    pub voltage: Double,
    pub watts: Double,
    pub temperature: Double,

    pub charge: Double,
    pub health: Double,
}

#[repr(C)]
pub struct BatteryProcess {
    pub pid: Int,
    pub name: SRString,
    pub power: Double,
    pub icon_base_64: SRString,
}

#[repr(C)]
pub struct DiskInfo {
    pub total_space: Int,
    pub free_space: Int,
    pub bytes_read: Int,
    pub bytes_written: Int,
}

#[repr(C)]
pub struct DiskProcess {
    pub pid: Int,
    pub name: SRString,
    pub bytes_read: Int,
    pub bytes_written: Int,
    pub icon_base_64: SRString,
}

#[repr(C)]
pub struct Memory {
    pub active: Int,
    pub inactive: Int,
    pub wired: Int,
    pub compressed: Int,
    pub free: Int,
    pub total: Int,
    pub used: Int,
    pub app: Int,
}

swift!(pub fn set_transparent_titlebar(window: &NSObject));
swift!(pub fn fetch_battery_info() -> SRObject<BatteryInfo>);
swift!(pub fn get_top_battery_processes() -> SRObjectArray<BatteryProcess>);
swift!(pub fn get_disk_info() -> Option<SRObject<DiskInfo>>);
swift!(pub fn get_disk_processes() -> SRObjectArray<DiskProcess>);
swift!(pub fn get_memory_usage_info() -> Option<SRObject<Memory>>);

