use crate::metrics::Metrics;
use crate::models::*;
use std::sync::{Arc, Mutex};
use tauri::{Runtime, Window};

pub struct AppState(Arc<Mutex<App>>);

impl AppState {
    pub fn new() -> Self {
        AppState(Arc::new(Mutex::new(App::default())))
    }
}

pub struct App {
    pub metrics: Metrics,
    pub battery_static: Option<BatteryStaticInfo>,
}

impl Default for App {
    fn default() -> Self {
        Self {
            metrics: Metrics::default(),
            battery_static: None,
        }
    }
}

impl App {
    fn get_or_init_battery_static(&mut self) -> BatteryStaticInfo {
        if let Some(battery_static) = &self.battery_static {
            return battery_static.clone();
        }

        let battery_static = self.metrics.get_battery_static_info();
        self.battery_static = Some(battery_static.clone());
        battery_static
    }
}

impl AppState {
    pub async fn emit_sysinfo<R: Runtime>(&self, window: &Window<R>) {
        let sys_info = self.0.lock().unwrap().metrics.get_system_information();
        window.emit("emit_sysinfo", &sys_info).unwrap();
    }

    pub async fn emit_cpu<R: Runtime>(&self, window: &Window<R>) {
        let cpu = self.0.lock().unwrap().metrics.get_cpu();
        window.emit("emit_cpu", &cpu).unwrap();
    }

    pub async fn emit_cpu_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_cpu_processes();
        window.emit("emit_cpu_processes", &processes).unwrap();
    }

    pub async fn emit_memory<R: Runtime>(&self, window: &Window<R>) {
        let memory = self.0.lock().unwrap().metrics.get_memory();
        window.emit("emit_memory", &memory).unwrap();
    }

    pub async fn emit_swap<R: Runtime>(&self, window: &Window<R>) {
        let swap = self.0.lock().unwrap().metrics.get_swap();
        window.emit("emit_swap", &swap).unwrap();
    }

    pub async fn emit_networks<R: Runtime>(&self, window: &Window<R>) {
        let networks = self.0.lock().unwrap().metrics.get_networks();
        window.emit("emit_networks", &networks).unwrap();
    }

    pub async fn emit_disks<R: Runtime>(&self, window: &Window<R>) {
        let disk = self.0.lock().unwrap().metrics.get_disk();
        window.emit("emit_disk", &disk).unwrap();
    }

    pub async fn emit_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_processes();
        window.emit("emit_processes", &processes).unwrap();
    }

    pub async fn emit_batteries<R: Runtime>(&self, window: &Window<R>) {
        let mut app = self.0.lock().unwrap();
        let battery_static = app.get_or_init_battery_static();
        let mut battery = app.metrics.get_battery();
        battery.cycle_count = battery_static.cycle_count;
        battery.max_capacity_percent = battery_static.max_capacity_percent;
        window.emit("emit_battery", &battery).unwrap();
    }

    pub async fn emit_battery_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_battery_processes();
        window.emit("emit_battery_processes", &processes).unwrap();
    }

    pub async fn emit_disk_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_disk_processes();
        window.emit("emit_disk_processes", &processes).unwrap();
    }

    pub async fn emit_memory_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_memory_processes();
        window.emit("emit_memory_processes", &processes).unwrap();
    }
}
