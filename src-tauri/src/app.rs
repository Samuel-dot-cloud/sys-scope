use std::sync::{Arc, Mutex};
use tauri::{Runtime, Window};
use crate::metrics::Metrics;
use crate::models::*;

pub struct AppState(Arc<Mutex<App>>);

impl AppState {
    pub fn new() -> Self {
        AppState(Arc::new(Mutex::new(App::default())))
    }
}

#[derive(Default)]
pub struct App {
    pub metrics: Metrics,
}

impl AppState {
    pub fn emit_sysinfo<R: Runtime>(&self, window: &Window<R>) {
        let sys_info = self.0.lock().unwrap().metrics.get_system_information();
        window.emit("emit_sysinfo", &sys_info).unwrap();
    }

    pub fn emit_global_cpus<R: Runtime>(&self, window: &Window<R>) {
        let global_cpu = self.0.lock().unwrap().metrics.get_global_cpus();
        window.emit("emit_global_cpus", &global_cpu).unwrap();
    }

    pub fn emit_cpus<R: Runtime>(&self, window: &Window<R>) {
        let cpus = self.0.lock().unwrap().metrics.get_cpus();
        window.emit("emit_cpus", &cpus).unwrap();
    }

    pub fn emit_memory<R: Runtime>(&self, window: &Window<R>) {
        let memory = self.0.lock().unwrap().metrics.get_memory();
        window.emit("emit_memory", &memory).unwrap();
    }

    pub fn emit_swap<R: Runtime>(&self, window: &Window<R>) {
        let swap = self.0.lock().unwrap().metrics.get_swap();
        window.emit("emit_swap", &swap).unwrap();
    }

    pub fn emit_networks<R: Runtime>(&self, window: &Window<R>) {
        let networks = self.0.lock().unwrap().metrics.get_networks();
        window.emit("emit_networks", &networks).unwrap();
    }

    pub fn emit_disks<R: Runtime>(&self, window: &Window<R>) {
        let disks = self.0.lock().unwrap().metrics.get_disks();
        window.emit("emit_disks", &disks).unwrap();
    }

    pub fn emit_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_processes();
        window.emit("emit_processes", &processes).unwrap();
    }

    pub fn emit_batteries<R: Runtime>(&self, window: &Window<R>) {
        let batteries = self.0.lock().unwrap().metrics.get_batteries();
        window.emit("emit_batteries", &batteries).unwrap();
    }

    pub fn emit_battery_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_battery_processes();
        window.emit("emit_battery_processes", &processes).unwrap();
    }

    pub fn emit_disk_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_disk_processes();
        window.emit("emit_disk_processes", &processes).unwrap();
    }

    pub fn emit_memory_processes<R: Runtime>(&self, window: &Window<R>) {
        let processes = self.0.lock().unwrap().metrics.get_memory_processes();
        window.emit("emit_memory_processes", &processes).unwrap();
    }
}
