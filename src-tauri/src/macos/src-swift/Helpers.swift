import AppKit
import Foundation

public func runProcess(path: String, args: [String]) -> String? {
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

public func getProcessIconBase64(for processName: String) -> String? {
    let workspace = NSWorkspace.shared
    let applications = workspace.runningApplications

    if let app = applications.first(where: { $0.localizedName == processName }), let icon = app.icon {
        return convertImageToBase64(icon)
    }

    return convertImageToBase64(workspace.icon(forFile: "/bin/bash"))
}

private func convertImageToBase64(_ image: NSImage) -> String? {
    guard let tiffData = image.tiffRepresentation else { return nil }
    guard let bitmap = NSBitmapImageRep(data: tiffData) else { return nil }
    guard let pngData = bitmap.representation(using: .png, properties: [:]) else { return nil }
    return pngData.base64EncodedString()
}

public extension DiskUtility {
    static func getDeviceIOParent(_ obj: io_registry_entry_t, level: Int) -> io_registry_entry_t? {
        var parent: io_registry_entry_t = 0

        if IORegistryEntryGetParentEntry(obj, kIOServicePlane, &parent) != KERN_SUCCESS {
            IOObjectRelease(parent)
            return nil
        }

        for _ in 1 ... level where IORegistryEntryGetParentEntry(parent, kIOServicePlane, &parent) != KERN_SUCCESS {
            IOObjectRelease(parent)
            return nil
        }

        return parent
    }

    static func getIOProperties(_ entry: io_registry_entry_t) -> NSDictionary? {
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
