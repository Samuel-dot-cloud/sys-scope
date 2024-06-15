import Foundation
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
                print("The space: \(space)")
                return space
            }
        } catch {
            print("Error retrieving disk space for \(path): \(error.localizedDescription)")
        }
        return nil
    }
    
    //TODO: Fix the below logic to get stats
    private static func getDiskIOStats(bsdName: String) -> (read: Int64, write: Int64)? {
            var disk = IOServiceGetMatchingService(kIOMasterPortDefault, IOBSDNameMatching(kIOMasterPortDefault, 0, bsdName))
            guard disk != 0 else { return nil }
            defer { IOObjectRelease(disk) }
            
            var parent = disk
            while IOObjectConformsTo(disk, kIOBlockStorageDeviceClass) == 0 {
                let error = IORegistryEntryGetParentEntry(disk, kIOServicePlane, &parent)
                if error != KERN_SUCCESS || parent == 0 { return nil }
                IOObjectRelease(disk)
                disk = parent
            }
            
            guard IOObjectConformsTo(disk, kIOBlockStorageDeviceClass) != 0 else { return nil }
            
            guard let props = IORegistryEntryCreateCFProperty(disk, "Statistics" as CFString, kCFAllocatorDefault, 0)?.takeUnretainedValue() as? [String: AnyObject] else {
                return nil
            }
            
            let bytesRead = props["Bytes (Read)"] as? Int64 ?? 0
            let bytesWritten = props["Bytes (Write)"] as? Int64 ?? 0
            
            return (read: bytesRead, write: bytesWritten)
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
