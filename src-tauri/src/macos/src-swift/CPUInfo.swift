import Foundation
import SwiftRs

class CPUInfo: NSObject {
    var user: Double
    var system: Double
    var idle: Double

    init(user: Double, system: Double, idle: Double) {
        self.user = user
        self.system = system
        self.idle = idle
    }
}

class CPUProcess: NSObject {
    var pid: Int
    var name: SRString
    var cpu: Double
    var iconBase64: SRString

    init(pid: Int, name: SRString, cpu: Double, iconBase64: SRString) {
        self.pid = pid
        self.name = name
        self.cpu = cpu
        self.iconBase64 = iconBase64
    }
}

@_cdecl("get_cpu_info")
func getCPUInfo() -> CPUInfo? {
    var cpuInfo1 = host_cpu_load_info()
    var cpuInfo2 = host_cpu_load_info()
    var count = UInt32(MemoryLayout<host_cpu_load_info_data_t>.stride / MemoryLayout<integer_t>.stride)

    let result1 = withUnsafeMutablePointer(to: &cpuInfo1) {
        $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
            host_statistics(mach_host_self(), HOST_CPU_LOAD_INFO, $0, &count)
        }
    }

    guard result1 == KERN_SUCCESS else {
        return nil
    }

    Thread.sleep(forTimeInterval: 0.1)

    let result2 = withUnsafeMutablePointer(to: &cpuInfo2) {
        $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
            host_statistics(mach_host_self(), HOST_CPU_LOAD_INFO, $0, &count)
        }
    }

    guard result2 == KERN_SUCCESS else {
        return nil
    }

    let userDelta = Double(cpuInfo2.cpu_ticks.0 - cpuInfo1.cpu_ticks.0)
    let systemDelta = Double(cpuInfo2.cpu_ticks.1 - cpuInfo1.cpu_ticks.1)
    let idleDelta = Double(cpuInfo2.cpu_ticks.2 - cpuInfo1.cpu_ticks.2)
    let niceDelta = Double(cpuInfo2.cpu_ticks.3 - cpuInfo1.cpu_ticks.3)

    let totalTicks = userDelta + systemDelta + idleDelta + niceDelta

    let userPercent = (userDelta / totalTicks) * 100.0
    let systemPercent = (systemDelta / totalTicks) * 100.0
    let idlePercent = (idleDelta / totalTicks) * 100.0

    return CPUInfo(
        user: userPercent,
        system: systemPercent,
        idle: idlePercent
    )
}

@_cdecl("get_top_cpu_processes")
func getTopCPUProcesses() -> SRObjectArray {
    let command = "/bin/ps"
    let arguments = ["-Aceo pid,pcpu,comm", "-r"]

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
                cpu: cpu,
                iconBase64: SRString(iconBase64)
            )
            processes.append(processInfo)

            if processes.count == 5 {
                break
            }
        }
    }

    processes.sort { $0.cpu > $1.cpu }

    let topProcesses = Array(processes.prefix(5))

    return SRObjectArray(topProcesses)
}
