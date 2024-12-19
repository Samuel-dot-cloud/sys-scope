import Foundation
import IOKit
import MachO
import SwiftRs

let HOST_VM_INFO64_COUNT: mach_msg_type_number_t = UInt32(MemoryLayout<vm_statistics64_data_t>.size / MemoryLayout<integer_t>.size)

private let pageSize = UInt64(vm_kernel_page_size)
private let command = "/usr/bin/top"
private let arguments = ["-l", "1", "-o", "mem", "-n", "5", "-stats", "pid,command,mem"]
private let logger = OSLogger(tag: "getMemoryInfo")

class MemoryInfo: NSObject {
    var active: Int
    var inactive: Int
    var wired: Int
    var compressed: Int
    var free: Int
    var total: Int
    var used: Int
    var app: Int

    init(active: Int, inactive: Int, wired: Int, compressed: Int, free: Int, total: Int, used: Int, app: Int) {
        self.active = active
        self.inactive = inactive
        self.wired = wired
        self.compressed = compressed
        self.free = free
        self.total = total
        self.used = used
        self.app = app
    }
}

class MemoryProcess: NSObject {
    var pid: Int
    var name: SRString
    var memory: SRString
    var iconBase64: SRString

    init(pid: Int, name: SRString, memory: SRString, iconBase64: SRString) {
        self.pid = pid
        self.name = name
        self.memory = memory
        self.iconBase64 = iconBase64
    }
}

@_cdecl("get_memory_info")
func getMemoryInfo() -> MemoryInfo? {
    autoreleasepool {
        var stats = vm_statistics64()
        var size = HOST_VM_INFO64_COUNT
        let hostPort: mach_port_t = mach_host_self()

        let kern: kern_return_t = withUnsafeMutablePointer(to: &stats) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(size)) {
                host_statistics64(hostPort, HOST_VM_INFO64, $0, &size)
            }
        }

        guard kern == KERN_SUCCESS else {
            logger.error("Error with host_statistics64(): \(kern)")
            return nil
        }

        let active = UInt64(stats.active_count) * pageSize
        let inactive = UInt64(stats.inactive_count) * pageSize
        let wired = UInt64(stats.wire_count) * pageSize
        let compressed = UInt64(stats.compressor_page_count) * pageSize
        let free = UInt64(stats.free_count) * pageSize
        let total = (active + inactive + wired + compressed + free)
        let used = total - free
        let app = used - wired - compressed

        return MemoryInfo(
            active: Int(active),
            inactive: Int(inactive),
            wired: Int(wired),
            compressed: Int(compressed),
            free: Int(free),
            total: Int(total),
            used: Int(used),
            app: Int(app)
        )
    }
}

private func formatMemory(_ bytes: Int) -> String {
    if bytes > 1000 * 1024 * 1024 {
        return String(format: "%.2f GB", Double(bytes) / (1024 * 1024 * 1024))
    } else if bytes > 1000 * 1024 {
        return String(format: "%.1f MB", Double(bytes) / (1024 * 1024))
    } else {
        return String(format: "%.1f KB", Double(bytes) / 1024)
    }
}

private func parseMemory(_ memory: String) -> Int {
    let unit = memory.suffix(1)
    let value = memory.dropLast()

    guard let numericalValue = Int(value) else {
        return 0
    }

    switch unit {
    case "K":
        return numericalValue * 1024
    case "M":
        return numericalValue * (1024 * 1024)
    case "G":
        return numericalValue * (1024 * 1024 * 1024)
    default:
        return numericalValue
    }
}

@_cdecl("get_top_memory_processes")
func getTopMemoryProcesses() -> SRObjectArray {
    guard let output = runProcess(path: command, args: arguments) else {
        return SRObjectArray([])
    }

    var processes = [MemoryProcess]()
    processes.reserveCapacity(5)

    let lines = output.split(separator: "\n")
    var processLinesStarted = false

    for line in lines {
        autoreleasepool {
            let trimmedLine = line.trimmingCharacters(in: .whitespaces)
            if trimmedLine.starts(with: "PID") {
                processLinesStarted = true
                return
            }

            if processLinesStarted {
                let columns = trimmedLine.split(separator: " ", omittingEmptySubsequences: true)
                if columns.count >= 3 {
                    let pid = Int(columns[0]) ?? 0
                    let command = String(columns[1 ..< columns.count - 1].joined(separator: " "))
                    let memoryString = String(columns.last!)
                    let memoryInBytes = parseMemory(memoryString)
                    let formattedMemory = formatMemory(memoryInBytes)
                    let iconBase64 = getProcessIconBase64(for: command) ?? ""
                    let processInfo = autoreleasepool { () -> MemoryProcess in
                        return MemoryProcess(
                            pid: pid,
                            name: SRString(command),
                            memory: SRString(formattedMemory),
                            iconBase64: SRString(iconBase64)
                        )
                    }
                    processes.append(processInfo)
                    if processes.count == 5 {
                        return
                    }
                }
            }
        }
    }

    let result = SRObjectArray(processes)
    processes.removeAll(keepingCapacity: false)
    return result
}
