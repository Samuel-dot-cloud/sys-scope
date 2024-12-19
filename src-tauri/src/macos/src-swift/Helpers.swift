import AppKit
import Foundation

public func runProcess(path: String, args: [String]) -> String? {
    let task = Process()
    task.executableURL = URL(fileURLWithPath: path)
    task.arguments = args

    let outputPipe = Pipe()
    task.standardOutput = outputPipe

    return autoreleasepool {
        do {
            try task.run()
        } catch {
            return nil
        }

        let fileHandle = outputPipe.fileHandleForReading
        defer { fileHandle.closeFile() }

        if let outputData = try? fileHandle.readToEnd() {
            return String(decoding: outputData, as: UTF8.self)
        }
        return nil
    }
}

public func getProcessIconBase64(for processName: String) -> String? {
    let workspace = NSWorkspace.shared
    let applications = workspace.runningApplications

    if let app = applications.first(where: { $0.localizedName == processName }), let icon = app.icon {
        return convertImageToBase64(icon)
    }

    return convertImageToBase64(workspace.icon(forFile: "/bin/bash"))
}

private func convertImageToBase64(_ image: NSImage) -> String? {
    autoreleasepool {
        guard let tiffData = image.tiffRepresentation else { return nil }
        guard let bitmap = NSBitmapImageRep(data: tiffData) else { return nil }
        guard let pngData = bitmap.representation(using: .png, properties: [:]) else { return nil }
        return pngData.base64EncodedString()
    }
}

extension DiskUtility {
    func getDeviceIOParent(_ obj: io_registry_entry_t, level: Int) -> io_registry_entry_t? {
        var parent: io_registry_entry_t = 0

        for currentLevel in 1 ... level {
            if IORegistryEntryGetParentEntry(obj, kIOServicePlane, &parent) != KERN_SUCCESS {
                IOObjectRelease(parent)
                return nil
            }
        }

        return parent
    }

    func getIOProperties(_ entry: io_registry_entry_t) -> NSDictionary? {
        var properties: Unmanaged<CFMutableDictionary>?

        if IORegistryEntryCreateCFProperties(entry, &properties, kCFAllocatorDefault, 0) != kIOReturnSuccess {
            return nil
        }

        defer {
            properties?.release()
        }

        return properties?.takeUnretainedValue()
    }
}
