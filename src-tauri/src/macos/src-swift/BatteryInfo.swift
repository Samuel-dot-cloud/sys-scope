import Foundation
import SwiftRs
import IOKit.ps

public class BatteryInfo: NSObject {
    var name: SRString = SRString("-----")
    
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
    var timeLeft: SRString = SRString("--:--")
    var timeRemaining: Int = 0
}

@_cdecl("fetch_battery_info")
public func fetchBatteryInfo() -> BatteryInfo {
    print("Starting to fetch battery info...")
    let service = IOServiceGetMatchingService(kIOMasterPortDefault, IOServiceMatching("AppleSmartBattery"))
    
    let batteryInfo = BatteryInfo()
    
    guard service != 0 else {
        print("No service found for AppleSmartBattery. Exiting function.")
        IOServiceClose(service)
        IOObjectRelease(service)
        return batteryInfo
    }
    
    print("Service for AppleSmartBattery found.")
    print(service)
    
    func getIntValue(_ property: CFString) -> Int {
        print("Attempting to get Int value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Int {
            print("Successfully got Int value for \(property): \(value)")
            return value
        }
        print("Could not get Int value for property: \(property)")
        return 0
    }
    
    func getStringValue(_ property: CFString) -> String {
        print("Attempting to get String value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? String {
            print("Successfully got String value for \(property): \(value)")
            return value
        }
        print("Could not get String value for property: \(property)")
        return "-----"
    }
    
    func getBoolValue(_ property: CFString) -> Bool {
        print("Attempting to get Bool value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Bool {
            print("Successfully got Bool value for \(property): \(value)")
            return value
        }
        print("Could not get Bool value for property: \(property)")
        return false
    }
    
    func getDoubleValue(_ property: CFString) -> Double {
        print("Attempting to get Double value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Double {
            print("Successfully got Double value for \(property): \(value)")
            return value
        }
        print("Could not get Double value for property: \(property)")
        return 0.0
    }
    
    
    print("Fetching power source information...")
    let snapshot = IOPSCopyPowerSourcesInfo().takeRetainedValue()
    let sources = IOPSCopyPowerSourcesList(snapshot).takeRetainedValue() as Array
    
    for ps in sources {
        let info = IOPSGetPowerSourceDescription(snapshot, ps).takeUnretainedValue() as! Dictionary<String, Any>
        print("Processing power source: \(info)")
        
        batteryInfo.name = SRString(info[kIOPSNameKey] as? String ?? "-----")
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
    print("The current charge value: \(value)")
    
    // Health
    
    let value2 = (Double(batteryInfo.maxCapacity) / Double(batteryInfo.designCapacity)) * 100.0
    batteryInfo.health = value2
    print("The battery health: \(value2)")
    
    
    // Time left
    let minutes = batteryInfo.isCharging ? batteryInfo.timeToFull : batteryInfo.timeToEmpty
    
    if minutes > 0 {
        let value = String(format: "%.2d:%.2d", minutes / 60, minutes % 60)
        batteryInfo.timeLeft = SRString(value)
    }
    
    // Time remaining
    
    let value3 =  batteryInfo.isCharging ? batteryInfo.timeToFull : batteryInfo.timeToEmpty
    batteryInfo.timeRemaining = value3
    print("The time remaining: \(value3)")
    
    // Watts
    let factor: CGFloat = batteryInfo.isCharging ? 1 : -1
    let watts: CGFloat = (CGFloat(batteryInfo.amperage) * CGFloat(batteryInfo.voltage)) / 1000 * factor
    batteryInfo.watts = Double(watts)
    print("The battery wattage: \(Double(watts))")
    
    
    IOServiceClose(service)
    IOObjectRelease(service)
    
    return batteryInfo
}

