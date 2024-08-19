import Cocoa
import IOKit
import IOKit.storage
import SwiftRs

class DiskInfo: NSObject {
    let totalSpace: Int
    let freeSpace: Int
    let bytesRead: Int
    let bytesWritten: Int

    init(totalSpace: Int, freeSpace: Int, bytesRead: Int, bytesWritten: Int) {
        self.totalSpace = totalSpace
        self.freeSpace = freeSpace
        self.bytesRead = bytesRead
        self.bytesWritten = bytesWritten
    }
}

class DiskProcess: NSObject {
    let pid: Int
    let name: SRString
    var bytesRead: SRString
    var bytesWritten: SRString
    var iconBase64: SRString

    init(pid: Int, name: SRString, bytesRead: SRString, bytesWritten: SRString, iconBase64: SRString) {
        self.pid = pid
        self.name = name
        self.bytesRead = bytesRead
        self.bytesWritten = bytesWritten
        self.iconBase64 = iconBase64
    }
}

class IO: NSObject {
    var bytesRead: Int
    var bytesWritten: Int

    init(bytesRead: Int, bytesWritten: Int) {
        self.bytesRead = bytesRead
        self.bytesWritten = bytesWritten
    }
}

class DiskMonitor {
    // TODO: Fix disk process retrieval logic
    func getDiskProcessIOStats() -> [DiskProcess] {
        guard let output = runProcess(path: "/bin/ps", args: ["-eo", "pid=,comm=", "-r"]) else {
            return []
        }

        var newProcesses: [DiskProcess] = []

        let lines = output.split(separator: "\n")
        for line in lines {
            let components = line.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true)
            if components.count == 2, let pid = Int32(components[0]) {
                let pathComponent = String(components[1])
                let name = URL(fileURLWithPath: pathComponent).lastPathComponent
                let icon = getProcessIconBase64(for: name) ?? ""

                if let ioStats = getProcessDiskIOStats(pid: pid) {
                    newProcesses.append(
                        DiskProcess(
                            pid: Int(pid),
                            name: SRString(name),
                            bytesRead: SRString(ioStats.read),
                            bytesWritten: SRString(ioStats.write),
                            iconBase64: SRString(icon)
                        )
                    )
                }
            }

            if newProcesses.count >= 5 {
                break
            }
        }
//        newProcesses.sort { max($0.bytesRead, $0.bytesWritten) > max($1.bytesRead, $1.bytesWritten) }
        return newProcesses
    }
}

private func getProcessDiskIOStats(pid: Int32) -> (read: String, write: String)? {
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
    let readString = formatBytes(bytesRead)
    let bytesWritten = Int(usage.ri_diskio_byteswritten)
    let writtenString = formatBytes(bytesWritten)

    return (read: readString, write: writtenString)
}

private func formatBytes(_ bytes: Int) -> String {
    if bytes > 1000 * 1024 * 1024 {
        return String(format: "%.1f GB/s", Double(bytes) / (1024 * 1024 * 1024))
    } else if bytes > 100 * 1024 {
        return String(format: "%.1f MB/s", Double(bytes) / (1024 * 1024))
    } else {
        return String(format: "%.1f KB/s", Double(bytes) / 1024)
    }
}

class DiskUtility {
    // TODO: Fix erroneous free and total disk space value
    static func getDiskInfo() -> DiskInfo? {
        let bsdName = findMainMacintoshHDBSDName() ?? ""
        guard let mountPoint = getMountPoint(forBSDName: bsdName),
              let totalSpace = getTotalDiskSpace(at: mountPoint),
              let freeSpace = getFreeDiskSpace(at: mountPoint),
              let ioStats = getDiskIOStats(bsdName: bsdName)
        else {
            return nil
        }

        return DiskInfo(totalSpace: Int(totalSpace), freeSpace: Int(freeSpace), bytesRead: Int(ioStats.read), bytesWritten: Int(ioStats.write))
    }

    private static func getMountPoint(forBSDName bsdName: String) -> String? {
        let session = DASessionCreate(kCFAllocatorDefault)
        guard let session else { return nil }

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
        getDiskSpace(at: path, key: FileAttributeKey.systemSize)
    }

    private static func getFreeDiskSpace(at path: String) -> Int64? {
        getDiskSpace(at: path, key: FileAttributeKey.systemFreeSize)
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

        let partitionLevel = bsdName.filter { "0" ... "9" ~= $0 }.count

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
    guard let session else { return nil }

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

@_cdecl("get_disk_info")
func getDiskInfo() -> DiskInfo? {
    DiskUtility.getDiskInfo()
}

@_cdecl("get_disk_processes")
func getDiskProcesses() -> SRObjectArray {
    let diskMonitor = DiskMonitor()
    let topProcesses = diskMonitor.getDiskProcessIOStats()
    return SRObjectArray(topProcesses)
}
