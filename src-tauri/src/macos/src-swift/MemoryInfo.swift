import Foundation
import IOKit
import MachO

let HOST_VM_INFO64_COUNT: mach_msg_type_number_t = UInt32(MemoryLayout<vm_statistics64_data_t>.size / MemoryLayout<integer_t>.size)

struct MemoryUsage {
    var active: UInt64
    var inactive: UInt64
    var wired: UInt64
    var compressed: UInt64
    var free: UInt64
    var total: UInt64
    var used: UInt64
}

enum MemoryStatsError: Error {
    case hostStatisticsFailed(kern_return_t)
}

func getMemoryUsage() throws -> MemoryUsage {
    var stats = vm_statistics64()
    var size = HOST_VM_INFO64_COUNT
    let hostPort: mach_port_t = mach_host_self()
    
    let kern: kern_return_t = withUnsafeMutablePointer(to: &stats) {
        $0.withMemoryRebound(to: integer_t.self, capacity: Int(size)) {
            host_statistics64(hostPort, HOST_VM_INFO64, $0, &size)
        }
    }
    
    guard kern == KERN_SUCCESS else {
        throw MemoryStatsError.hostStatisticsFailed(kern)
    }
    
    let pageSize = UInt64(vm_kernel_page_size)
    let active = UInt64(stats.active_count) * pageSize
    let inactive = UInt64(stats.inactive_count) * pageSize
    let wired = UInt64(stats.wire_count) * pageSize
    let compressed = UInt64(stats.compressor_page_count) * pageSize
    let free = UInt64(stats.free_count) * pageSize
    let total = (active + inactive + wired + compressed + free)
    let used = total - free
    
    return MemoryUsage(
        active: active,
        inactive: inactive,
        wired: wired,
        compressed: compressed,
        free: free,
        total: total,
        used: used
    )
}
