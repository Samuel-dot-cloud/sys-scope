import Foundation
import IOKit
import MachO
import SwiftRs

let HOST_VM_INFO64_COUNT: mach_msg_type_number_t = UInt32(MemoryLayout<vm_statistics64_data_t>.size / MemoryLayout<integer_t>.size)

class MemoryUsage: NSObject {
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

@_cdecl("get_memory_usage_info")
func getMemoryUsageInfo() -> MemoryUsage? {
    var stats = vm_statistics64()
    var size = HOST_VM_INFO64_COUNT
    let hostPort: mach_port_t = mach_host_self()
    
    let kern: kern_return_t = withUnsafeMutablePointer(to: &stats) {
        $0.withMemoryRebound(to: integer_t.self, capacity: Int(size)) {
            host_statistics64(hostPort, HOST_VM_INFO64, $0, &size)
        }
    }
    
    guard kern == KERN_SUCCESS else {
        print("Error with host_statistics64(): \(kern)")
        return nil
    }
    
    let pageSize = UInt64(vm_kernel_page_size)
    let active = UInt64(stats.active_count) * pageSize
    let inactive = UInt64(stats.inactive_count) * pageSize
    let wired = UInt64(stats.wire_count) * pageSize
    let compressed = UInt64(stats.compressor_page_count) * pageSize
    let free = UInt64(stats.free_count) * pageSize
    let total = (active + inactive + wired + compressed + free)
    let used = total - free
    let app = used - wired - compressed
    
    return MemoryUsage(
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
