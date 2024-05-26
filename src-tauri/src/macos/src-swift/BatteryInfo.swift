import Cocoa
import SwiftRs
import IOKit.ps

public class BatteryInfo: NSObject {
    var powerSource: SRString = SRString("-----")
    
    var timeToFull: Int = 0
    var timeToEmpty: Int = 0
    
    var currentCapacity: Int = 0
    var maxCapacity: Int = 0
    var designCapacity: Int = 0
    
    var cycleCount: Int = 0
    var designCycleCount: Int = 0
    
    var acPowered: Bool = false
    var isCharging: Bool = false
    var isCharged: Bool = false
    var amperage: Int = 0
    var voltage: Double = 0.0
    var watts: Double = 0.0
    var temperature: Double = 0.0
    
    var charge: Double = 0.0
    var health: Double = 0.0
}

class TopProcess: NSObject {
    let pid: Int
    let name: SRString
    let power: Double
    let iconBase: SRString
    
    init(pid: Int, name: SRString, power: Double, iconBase: SRString) {
        self.pid = pid
        self.name = name
        self.power = power
        self.iconBase = iconBase
    }
}

@_cdecl("fetch_battery_info")
public func fetchBatteryInfo() -> BatteryInfo {
    let service = IOServiceGetMatchingService(kIOMasterPortDefault, IOServiceMatching("AppleSmartBattery"))
    
    let batteryInfo = BatteryInfo()
    
    guard service != 0 else {
        print("No service found for AppleSmartBattery. Exiting function.")
        IOServiceClose(service)
        IOObjectRelease(service)
        return batteryInfo
    }
    
    func getIntValue(_ property: CFString) -> Int {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Int {
            //            print("Successfully got Int value for \(property): \(value)")
            return value
        }
        print("Could not get Int value for property: \(property)")
        return 0
    }
    
    func getStringValue(_ property: CFString) -> String {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? String {
            //            print("Successfully got String value for \(property): \(value)")
            return value
        }
        print("Could not get String value for property: \(property)")
        return "-----"
    }
    
    func getBoolValue(_ property: CFString) -> Bool {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Bool {
            //            print("Successfully got Bool value for \(property): \(value)")
            return value
        }
        print("Could not get Bool value for property: \(property)")
        return false
    }
    
    func getDoubleValue(_ property: CFString) -> Double {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Double {
            //            print("Successfully got Double value for \(property): \(value)")
            return value
        }
        print("Could not get Double value for property: \(property)")
        return 0.0
    }
    
    
    let snapshot = IOPSCopyPowerSourcesInfo().takeRetainedValue()
    let sources = IOPSCopyPowerSourcesList(snapshot).takeRetainedValue() as Array
    
    for ps in sources {
        let info = IOPSGetPowerSourceDescription(snapshot, ps).takeUnretainedValue() as! Dictionary<String, Any>
        
        
        batteryInfo.powerSource = SRString(info[kIOPSPowerSourceStateKey] as? String ?? "AC power")
        batteryInfo.timeToEmpty = info[kIOPSTimeToEmptyKey] as? Int ?? 0
        batteryInfo.timeToFull = info[kIOPSTimeToFullChargeKey] as? Int ?? 0
    }
    
    // Capacities
    batteryInfo.currentCapacity = getIntValue("CurrentCapacity" as CFString)
    batteryInfo.maxCapacity = getIntValue("MaxCapacity" as CFString)
    batteryInfo.designCapacity = getIntValue("DesignCapacity" as CFString)
    
    // Battery cycles
    batteryInfo.cycleCount = getIntValue("CycleCount" as CFString)
    batteryInfo.designCycleCount = getIntValue("DesignCycleCount9C" as CFString)
    
    // Plug
    batteryInfo.acPowered = getBoolValue("ExternalConnected" as CFString)
    batteryInfo.isCharging = getBoolValue("IsCharging" as CFString)
    batteryInfo.isCharged = getBoolValue("FullyCharged" as CFString)
    
    // Power
    batteryInfo.amperage = getIntValue("Amperage" as CFString)
    batteryInfo.voltage = getDoubleValue("Voltage" as CFString) / 1000.0
    
    // Temperature
    batteryInfo.temperature = getDoubleValue("Temperature" as CFString) / 100.0
    
    
    // Charge
    let value = (Double(batteryInfo.currentCapacity) / Double(batteryInfo.maxCapacity)) * 100.0
    batteryInfo.charge = value
    
    // Health
    
    let value2 = (Double(batteryInfo.maxCapacity) / Double(batteryInfo.designCapacity)) * 100.0
    batteryInfo.health = value2
    
    
    // Watts
    let factor: CGFloat = batteryInfo.isCharging ? 1 : -1
    let watts: CGFloat = (CGFloat(batteryInfo.amperage) * CGFloat(batteryInfo.voltage)) / 1000 * factor
    batteryInfo.watts = Double(watts)
    
    
    IOServiceClose(service)
    IOObjectRelease(service)
    
    return batteryInfo
}

@_cdecl("get_top_battery_processes")
func getTopBatteryProcesses() -> SRObjectArray {
    let command = "/usr/bin/top"
    let arguments = ["-o", "power", "-l", "2", "-n", "5", "-stats", "pid,command,power"]
    
    // Create a process instance
    let process = Process()
    process.executableURL = URL(fileURLWithPath: command)
    process.arguments = arguments
    
    // Create a pipe to capture the output
    let pipe = Pipe()
    process.standardOutput = pipe
    process.standardError = pipe
    
    do {
        try process.run()
    } catch {
        print("Failed to run top command: \(error)")
        return SRObjectArray([])
    }
    
    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    guard let output = String(data: data, encoding: .utf8) else {
        print("Failed to read output")
        return SRObjectArray([])
    }
    
    // Parse the output
    var processInfo: [TopProcess] = []
    let lines = output.split(separator: "\n")
    for line in lines {
        let components = line.split(separator: " ").filter { !$0.isEmpty }
        if components.count >= 3, let pid = Int(components[0]), let power = Double(components[2]), power > 0 {
            let processName = String(components[1])
            let iconBase64 = getProcessIconBase64(for: processName) ?? ""
            let topProcess = TopProcess(pid: pid, name: SRString(processName), power: power, iconBase: SRString(iconBase64))
            processInfo.append(topProcess)
        }
    }
    
    processInfo.sort { $0.power > $1.power}
    return SRObjectArray(processInfo)
}

func getProcessIconBase64(for processName: String) -> String? {
    let workspace = NSWorkspace.shared
    let applications = workspace.runningApplications
    for app in applications {
        if app.localizedName == processName, let icon = app.icon {
            return convertImageToBase64(icon)
        }
    }
    return convertImageToBase64(workspace.icon(forFile: "/bin/bash"))
}

private func convertImageToBase64(_ image: NSImage) -> String? {
    guard let tiffData = image.tiffRepresentation else { return nil }
    guard let bitmap = NSBitmapImageRep(data: tiffData) else { return nil }
    guard let pngData = bitmap.representation(using: .png, properties: [:]) else { return nil }
    return pngData.base64EncodedString()
}


