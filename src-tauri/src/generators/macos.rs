#![cfg(target_os = "macos")]

use swift_rs::{Bool, Double, Int, SRObject, SRString, swift};

pub type NSObject = *mut std::ffi::c_void;

#[repr(C)]
pub struct BatteryInfo {
    pub name: Option<SRString>,

    pub time_to_full: Option<Int>,
    pub time_to_empty: Option<Int>,

    pub manufacturer: Option<SRString>,
    // pub manufacture_date: Option<SRString>,

    pub current_capacity: Option<Int>,
    pub max_capacity: Option<Int>,
    pub design_capacity: Option<Int>,

    pub cycle_count: Option<Int>,
    pub design_cycle_count: Option<Int>,

    pub ac_powered: Option<Bool>,
    pub is_charging: Option<Bool>,
    pub is_charged: Option<Bool>,
    pub amperage: Option<Int>,
    pub voltage: Option<Double>,
    pub watts: Option<Double>,
    pub temperature: Option<Double>,

    pub charge: Option<Double>,
    pub health: Option<Double>,

    // pub time_left: Option<SRString>,
    pub time_remaining: Option<Int>,
}

swift!(pub fn set_transparent_titlebar(window: &NSObject));
swift!(pub fn fetch_battery_info() -> SRObject<BatteryInfo>);

