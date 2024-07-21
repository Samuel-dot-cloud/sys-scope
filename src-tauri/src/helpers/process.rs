use swift_rs::SRObjectArray;

use crate::{
    macos::BatteryProcess,
    models::{DiskProcess, TopProcess},
};

pub trait ConvertTo<T> {
    fn convert(&self) -> T;
}

impl ConvertTo<TopProcess> for BatteryProcess {
    fn convert(&self) -> TopProcess {
        TopProcess {
            pid: self.pid as u64,
            name: self.name.parse().unwrap_or_default(),
            power: self.power as f64,
            icon_base_64: self.icon_base_64.parse().unwrap_or_default(),
        }
    }
}

impl ConvertTo<crate::models::DiskProcess> for crate::macos::DiskProcess {
    fn convert(&self) -> crate::models::DiskProcess {
        DiskProcess {
            pid: self.pid as u32,
            name: self.name.parse().unwrap_or_default(),
            bytes_read: self.bytes_read as u64,
            bytes_written: self.bytes_written as u64,
            icon_base_64: self.icon_base_64.parse().unwrap_or_default(),
        }
    }
}

pub fn convert_processes<S, T>(source: SRObjectArray<S>) -> Vec<T>
where
    S: ConvertTo<T>,
{
    source.into_iter().map(|value| value.as_ref().convert()).collect()
}
