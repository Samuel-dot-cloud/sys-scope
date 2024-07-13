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

class DiskMonitor {
    private var processList: [Int32: DiskProcess] = [:]
    
    func updateProcessDiskIOStats() -> [DiskProcess] {
        guard let output = runProcess(path: "/bin/ps", args: ["-eo", "pid=,comm=", "-r"]) else {
            return []
        }
        
        var newProcesses: [DiskProcess] = []
        
        output.enumerateLines { (line, _) -> Void in
            let components = line.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true)
            if components.count == 2, let pid = Int32(components[0]) {
                var pathComponent = String(components[1])
                let name = URL(fileURLWithPath: pathComponent).lastPathComponent
                
                if let ioStats = getProcessDiskIOStats(pid: pid) {
                    if let existingProcess = self.processList[pid] {
                        let readDiff = ioStats.read - existingProcess.bytesRead
                        let writeDiff = ioStats.write - existingProcess.bytesWritten
                        
                        if readDiff != 0 || writeDiff != 0 {
                            newProcesses.append(DiskProcess(
                                pid: pid,
                                name: name,
                                bytesRead: readDiff,
                                bytesWritten: writeDiff)
                            )
                        }
                        existingProcess.bytesRead = ioStats.read
                        existingProcess.bytesWritten = ioStats.write
                    } else {
                        let newProcess = DiskProcess(
                            pid: pid,
                            name: name,
                            bytesRead: ioStats.read,
                            bytesWritten: ioStats.write)
                        self.processList[pid] = newProcess
                    }
                }
            }
        }
        newProcesses.sort { max($0.bytesRead, $0.bytesWritten) > max($1.bytesRead, $1.bytesWritten)}
        return Array(newProcesses.prefix(5))
    }
    
    func startMonitoring() {
        while true {
            let topProcesses = updateProcessDiskIOStats()
//            print("Top Processes by Disk I/O:")
//            for process in topProcesses {
//                print("PID: \(process.pid), Name: \(process.name), Bytes Read: \(process.bytesRead), Bytes Written: \(process.bytesWritten)")
//            }
            sleep(3)
        }
    }
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
