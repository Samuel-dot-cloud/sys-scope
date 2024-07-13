import Cocoa
import IOKit
import IOKit.storage
import DiskArbitration

class DiskStats: NSObject {
    let totalSpace: Int64
    let freeSpace: Int64
    let bytesRead: Int64
    let bytesWritten: Int64
    
    init(totalSpace: Int64, freeSpace: Int64, bytesRead: Int64, bytesWritten: Int64) {
        self.totalSpace = totalSpace
        self.freeSpace = freeSpace
        self.bytesRead = bytesRead
        self.bytesWritten = bytesWritten
    }
}

class DiskProcess: NSObject {
    let pid: Int32
    let name: String
    var bytesRead: Int
    var bytesWritten: Int
    
    init(pid: Int32, name: String, bytesRead: Int, bytesWritten: Int) {
        self.pid = pid
        self.name = name
        self.bytesRead = bytesRead
        self.bytesWritten = bytesWritten
    }
}

func getTopDiskIOprocesses(topN: Int = 5) -> [DiskProcess]? {
    var processes: [DiskProcess] = []
    
    guard let output = runProcess(path: "/bin/ps", args: ["-Aceo pid,args", "-r"]) else {
        return nil
    }
    
    output.enumerateLines { (line, _) -> Void in
        let components = line.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true)
        if components.count == 2, let pid = Int32(components[0]) {
            var name = String(components[1])
            
            if let lastComponent = URL(string: name)?.lastPathComponent {
                name = lastComponent
            }
            
            if let ioStats = getProcessDiskIOStats(pid: pid) {
                processes.append(DiskProcess(
                    pid: pid,
                    name: name,
                    bytesRead: ioStats.read,
                    bytesWritten: ioStats.write)
                )
            }
        }
    }
    
    processes.sort { max($0.bytesRead, $0.bytesWritten) > max($1.bytesRead, $1.bytesWritten)}
    
    return Array(processes.prefix(topN))
}

private func runProcess(path: String, args: [String]) -> String? {
    let task = Process()
    task.executableURL = URL(fileURLWithPath: path)
    task.arguments = args
    
    let outputPipe = Pipe()
    task.standardOutput = outputPipe
    
    do {
        try task.run()
        
    } catch {
        return nil
    }
    
    let outputData = outputPipe.fileHandleForReading.readDataToEndOfFile()
    return String(decoding: outputData, as: UTF8.self)
}

private func getProcessDiskIOStats(pid: Int32) -> (read: Int, write: Int)? {
    var usage = rusage_info_current()
    let result = withUnsafeMutablePointer(to: &usage) {
        $0.withMemoryRebound(to: (rusage_info_t?.self), capacity: 1) {
            proc_pid_rusage(pid, RUSAGE_INFO_CURRENT, $0)
        }
    }
    guard result == 0 else {
        return nil
    }
    let bytesRead = Int(usage.ri_diskio_bytesread)
    let bytesWritten = Int(usage.ri_diskio_byteswritten)
    
    return (read: bytesRead, write: bytesWritten)
}

class DiskUtility {
    static func getDiskStats(forBSDName bsdName: String) -> DiskStats? {
        guard let mountPoint = getMountPoint(forBSDName: bsdName),
              let totalSpace = getTotalDiskSpace(at: mountPoint),
              let freeSpace = getFreeDiskSpace(at: mountPoint),
              let ioStats = getDiskIOStats(bsdName: bsdName) else {
            return nil
        }
        
        return DiskStats(totalSpace: totalSpace, freeSpace: freeSpace, bytesRead: ioStats.read, bytesWritten: ioStats.write)
    }
    
    private static func getMountPoint(forBSDName bsdName: String) -> String? {
        let session = DASessionCreate(kCFAllocatorDefault)
        guard let session = session else { return nil }
        
        if let disk = DADiskCreateFromBSDName(kCFAllocatorDefault, session, bsdName) {
            if let diskDescription = DADiskCopyDescription(disk) as? [CFString: Any] {
                if let volumePath = diskDescription[kDADiskDescriptionVolumePathKey] as? URL {
                    return volumePath.path
                }
            }
        }
        return nil
    }
    
    private static func getTotalDiskSpace(at path: String) -> Int64? {
        return getDiskSpace(at: path, key: FileAttributeKey.systemSize)
    }
    
    private static func getFreeDiskSpace(at path: String) -> Int64? {
        return getDiskSpace(at: path, key: FileAttributeKey.systemFreeSize)
    }
    
    private static func getDiskSpace(at path: String, key: FileAttributeKey) -> Int64? {
        do {
            let attributes = try FileManager.default.attributesOfFileSystem(forPath: path)
            if let space = (attributes[key] as? NSNumber)?.int64Value {
                return space
            }
        } catch {
            print("Error retrieving disk space for \(path): \(error.localizedDescription)")
        }
        return nil
    }
    
    private static func getDeviceIOParent(_ obj: io_registry_entry_t, level: Int) -> io_registry_entry_t? {
        var parent: io_registry_entry_t = 0
        
        if IORegistryEntryGetParentEntry(obj, kIOServiceClass, &parent) != KERN_SUCCESS {
            return nil
        }
        
        for _ in 1...level where IORegistryEntryGetParentEntry(parent, kIOServicePlane, &parent) != KERN_SUCCESS {
            IOObjectRelease(parent)
            return nil
        }
        
        return parent
    }
    
    private static func getIOProperties(_ entry: io_registry_entry_t) -> NSDictionary? {
        var properties: Unmanaged<CFMutableDictionary>? = nil
        
        if IORegistryEntryCreateCFProperties(entry, &properties, kCFAllocatorDefault, 0) != kIOReturnSuccess {
            return nil
        }
        
        defer {
            properties?.release()
        }
        
        return properties?.takeUnretainedValue()
    }
    
    private static func getDiskIOStats(bsdName: String) -> (read: Int64, write: Int64)? {
        var disk = IOServiceGetMatchingService(kIOMasterPortDefault, IOBSDNameMatching(kIOMasterPortDefault, 0, bsdName))
        guard disk != 0 else { return nil }
        defer { IOObjectRelease(disk) }
        
        let partitionLevel = bsdName.filter {"0"..."9"~=$0}.count
        
        if let parent = getDeviceIOParent(disk, level: partitionLevel) {
            guard let props = getIOProperties(parent) else {
                return nil
            }
            if let statistics = props.object(forKey: "Statistics") as? NSDictionary {
                let bytesRead = statistics.object(forKey: "Bytes (Read)") as? Int64 ?? 0
                let bytesWritten = statistics.object(forKey: "Bytes (Write)") as? Int64 ?? 0
                
                return (read: bytesRead, write: bytesWritten)
            }
        } else {
            return nil
        }
        return nil
    }
}

func findMainMacintoshHDBSDName() -> String? {
    let session = DASessionCreate(kCFAllocatorDefault)
    guard let session = session else { return nil }
    
    let mountedVolumes = FileManager.default.mountedVolumeURLs(includingResourceValuesForKeys: nil, options: []) ?? []
    
    for volume in mountedVolumes {
        if let volumeName = try? volume.resourceValues(forKeys: [.volumeNameKey]).volumeName, volumeName == "Macintosh HD" {
            if let disk = DADiskCreateFromVolumePath(kCFAllocatorDefault, session, volume as CFURL) {
                let diskDescription = DADiskCopyDescription(disk) as Dictionary?
                let bsdName = diskDescription?[kDADiskDescriptionMediaBSDNameKey] as? String
                return bsdName
            }
        }
    }
    
    return nil
}

func getDiskStats(forBSDName bsdName: String) -> DiskStats? {
    return DiskUtility.getDiskStats(forBSDName: bsdName)
}
