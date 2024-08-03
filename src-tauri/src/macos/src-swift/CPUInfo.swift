import Foundation
import IOKit
import MachO
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
