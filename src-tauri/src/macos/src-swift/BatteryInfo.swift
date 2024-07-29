import Foundation
import SwiftRs
import IOKit.ps

public class BatteryInfo: NSObject {
    var powerSource: SRString
    
    var timeToFull: Int
    var timeToEmpty: Int
    
    var currentCapacity: Int
    var maxCapacity: Int
    var designCapacity: Int
    
    var cycleCount: Int
    var designCycleCount: Int
    
    var acPowered: Bool
    var isCharging: Bool
    var isCharged: Bool
    var amperage: Int
    var voltage: Double
    var watts: Double
    var temperature: Double
    
    var charge: Double
    var health: Double
    
    override init() {
        self.powerSource = SRString("-----")
        self.timeToFull = 0
        self.timeToEmpty = 0
        self.currentCapacity = 0
        self.maxCapacity = 0
        self.designCapacity = 0
        self.cycleCount = 0
        self.designCycleCount = 0
        self.acPowered = false
        self.isCharging = false
        self.isCharged = false
        self.amperage = 0
        self.voltage = 0.0
        self.watts = 0.0
        self.temperature = 0.0
        self.charge = 0.0
        self.health = 0.0
    }
}

class BatteryProcess: NSObject {
    let pid: Int
    let name: SRString
    let power: Double
    let iconBase64: SRString
    
    init(pid: Int, name: SRString, power: Double, iconBase64: SRString) {
        self.pid = pid
        self.name = name
        self.power = power
        self.iconBase64 = iconBase64
    }
}

class BatteryInfoFetcher {
    private let service: io_service_t
    
    init() {
        self.service = IOServiceGetMatchingService(kIOMasterPortDefault, IOServiceMatching("AppleSmartBattery"))
    }
    
    deinit {
        IOServiceClose(service)
        IOObjectRelease(service)
    }
    
    //TODO: Find fix for wrong battery health value
    public func fetchBatteryInfo() -> BatteryInfo {
        let batteryInfo = BatteryInfo()
        
        guard service != 0 else {
            print("No service found for AppleSmartBattery. Exiting function.")
            return batteryInfo
        }
        
        fetchPowerSourceInfo(for: batteryInfo)
        fetchBatteryProperties(for: batteryInfo)
        
        let factor: CGFloat = batteryInfo.isCharging ? 1 : -1
        let watts: CGFloat = (CGFloat(batteryInfo.amperage) * CGFloat(batteryInfo.voltage)) / 1000 * factor
        batteryInfo.watts = Double(watts)
        
        let health: Double = (Double(batteryInfo.maxCapacity) / Double(batteryInfo.designCapacity)) * 100.0
        batteryInfo.health = health
        
        let charge: Double = (Double(batteryInfo.currentCapacity) / Double(batteryInfo.maxCapacity)) * 100.0
        batteryInfo.charge = charge
        
        return batteryInfo
    }
    
    private func fetchPowerSourceInfo(for batteryInfo: BatteryInfo) {
        let snapshot = IOPSCopyPowerSourcesInfo().takeRetainedValue()
        let sources = IOPSCopyPowerSourcesList(snapshot).takeRetainedValue() as Array
        
        for ps in sources {
            if let info = IOPSGetPowerSourceDescription(snapshot, ps).takeUnretainedValue() as? [String: Any] {
                batteryInfo.powerSource = SRString(info[kIOPSPowerSourceStateKey] as? String ?? "AC Power")
                batteryInfo.timeToEmpty = info[kIOPSTimeToEmptyKey] as? Int ?? 0
                batteryInfo.timeToFull = info[kIOPSTimeToFullChargeKey] as? Int ?? 0
            }
        }
    }
    
    private func fetchBatteryProperties(for batteryInfo: BatteryInfo) {
        batteryInfo.currentCapacity = getIntValue("CurrentCapacity" as CFString)
        batteryInfo.maxCapacity = getIntValue("MaxCapacity" as CFString)
        batteryInfo.designCapacity = getIntValue("DesignCapacity" as CFString)
        
        batteryInfo.cycleCount = getIntValue("CycleCount" as CFString)
        batteryInfo.designCycleCount = getIntValue("DesignCycleCount9C" as CFString)
        
        batteryInfo.acPowered = getBoolValue("ExternalConnected" as CFString)
        batteryInfo.isCharging = getBoolValue("IsCharging" as CFString)
        batteryInfo.isCharged = getBoolValue("FullyCharged" as CFString)
        
        batteryInfo.amperage = getIntValue("Amperage" as CFString)
        batteryInfo.voltage = getDoubleValue("Voltage" as CFString) / 1000.0
        batteryInfo.temperature = getDoubleValue("Temperature" as CFString) / 100.0
    }
    
    private func getIntValue(_ property: CFString) -> Int {
        return IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Int ?? 0
    }
    
    private func getStringValue(_ property: CFString) -> String {
        return IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? String ?? "-----"
    }
    
    private func getBoolValue(_ property: CFString) -> Bool {
        return IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Bool ?? false
    }
    
    private func getDoubleValue(_ property: CFString) -> Double {
        return IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Double ?? 0.0
    }
}

@_cdecl("fetch_battery_info")
public func fetchBatteryInfo() -> BatteryInfo {
    //    let diskMonitor = DiskMonitor()
    //    let array = DiskMonitor.getDiskProcessIOStats()
    //    print("The array: \(array)")
    
    //        let diskMonitor = DiskMonitor()
    //        diskMonitor.startMonitoring()
    
    let fetcher = BatteryInfoFetcher()
    return fetcher.fetchBatteryInfo()
}

@_cdecl("get_top_battery_processes")
func getTopBatteryProcesses() -> SRObjectArray {
    let command = "/usr/bin/top"
    let arguments = ["-o", "power", "-l", "2", "-n", "5", "-stats", "pid,command,state,power"]
    
    guard let output = runProcess(path: command, args: arguments) else {
        return SRObjectArray([])
    }
    
    // Parse the output
    var processInfo: [BatteryProcess] = []
    let lines = output.split(separator: "\n")
    for line in lines {
        let regex = try! NSRegularExpression(pattern: #"^\s*(\d+)\s+(\S+.*\S+)\s+(\w+)\s+([\d.]+)\s*$"#, options: [])
        let nsLine = line as NSString
        if let match = regex.firstMatch(in: String(line), options: [], range: NSRange(location: 0, length: nsLine.length)) {
            let pid = Int(nsLine.substring(with: match.range(at: 1)))!
            let processName = nsLine.substring(with: match.range(at: 2))
            let power = Double(nsLine.substring(with: match.range(at: 4)))!
            
            if power > 0 {
                let iconBase64 = getProcessIconBase64(for: processName) ?? ""
                let topProcess = BatteryProcess(pid: pid, name: SRString(processName), power: power, iconBase64: SRString(iconBase64))
                processInfo.append(topProcess)
            }
        }
    }
    
    processInfo.sort { $0.power > $1.power}
    return SRObjectArray(processInfo)
}


