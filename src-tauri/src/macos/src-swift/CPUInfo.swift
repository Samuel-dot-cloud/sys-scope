import Foundation
import SwiftRs

class CPUInfo: NSObject {
    var user: Int
    var system: Int
    var idle: Int
    
    init(user: Int, system: Int, idle: Int) {
        self.user = user
        self.system = system
        self.idle = idle
    }
}

class CPUProcess: NSObject {
    var pid: Int
    var name: SRString
    var cpu: Int
    var iconBase64: SRString
    
    init(pid: Int, name: SRString, cpu: Int, iconBase64: SRString) {
        self.pid = pid
        self.name = name
        self.cpu = cpu
        self.iconBase64 = iconBase64
    }
}

@_cdecl("get_cpu_info")
func getCPUInfo() -> CPUInfo? {
    var count = UInt32(MemoryLayout<host_cpu_load_info_data_t>.stride / MemoryLayout<integer_t>.stride)
    var cpuInfo = host_cpu_load_info()
    let result = withUnsafeMutablePointer(to: &cpuInfo) {
        $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
            host_statistics(mach_host_self(), HOST_CPU_LOAD_INFO, $0, &count)
        }
    }
    
    guard result == KERN_SUCCESS else {
        return nil
    }
    
    let user = Double(cpuInfo.cpu_ticks.0)
    let system = Double(cpuInfo.cpu_ticks.1)
    let idle = Double(cpuInfo.cpu_ticks.2)
    let nice = Double(cpuInfo.cpu_ticks.3)
    
    let totalTicks = user + system + idle + nice
    
    let userPercent = (user / totalTicks) * 100.0
    let systemPercent = (system / totalTicks) * 100.0
    let idlePercent = (idle / totalTicks) * 100.0
    let nicePercent = (nice / totalTicks) * 100.0
    
    return CPUInfo(
        user: Int(userPercent),
        system: Int(systemPercent),
        idle: Int(idlePercent)
    )
}

@_cdecl("get_top_cpu_processes")
func getTopCPUProcesses() -> SRObjectArray {
    let command = "/bin/ps"
    let arguments = ["-Aceo", "pid,pcpu,comm", "-r"]
    
    guard let output = runProcess(path: command, args: arguments) else {
        return SRObjectArray([])
    }
    
    var processes: [CPUProcess] = []
    
    let lines = output.split(separator: "\n")
    for line in lines {
        let components = line.split(separator: " ", maxSplits: 2, omittingEmptySubsequences: true)
        if components.count == 3, let pid = Int(components[0]), let cpu = Double(components[1]) {
            let command = String(components[2])
            let iconBase64 = getProcessIconBase64(for: command) ?? ""
            let processInfo = CPUProcess(
                pid: pid,
                name: SRString(command),
                cpu: Int(cpu),
                iconBase64: SRString(iconBase64)
            )
            processes.append(processInfo)
        }
    }
    
    processes.sort { $0.cpu > $1.cpu }
    
    
    return SRObjectArray(Array(processes.prefix(5)))
}
