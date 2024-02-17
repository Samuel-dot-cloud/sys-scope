import Foundation
import SwiftRs
import IOKit.ps

public class BatteryInfo: NSObject {
    var name: String?
    
    var timeToFull: Int?
    var timeToEmpty: Int?
    
    var manufacturer: String?
    var manufactureDate: String?
    
    var currentCapacity: Int?
    var maxCapacity: Int?
    var designCapacity: Int?
    
    var cycleCount: Int?
    var designCycleCount: Int?
    
    var acPowered: Bool?
    var isCharging: Bool?
    var isCharged: Bool?
    var amperage: Int?
    var voltage: Double?
    var watts: Double?
    var temperature: Double?
    
    var charge: Double?
    var health: Double?
    var timeLeft: String?
    var timeRemaining: Int?
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
    
    func getIntValue(_ property: CFString) -> Int? {
        print("Attempting to get Int value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Int {
            print("Successfully got Int value for \(property): \(value)")
            return value
        }
        print("Could not get Int value for property: \(property)")
        return nil
    }
    
    func getStringValue(_ property: CFString) -> String? {
        print("Attempting to get String value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? String {
            print("Successfully got String value for \(property): \(value)")
            return value
        }
        print("Could not get String value for property: \(property)")
        return nil
    }
    
    func getBoolValue(_ property: CFString) -> Bool? {
        print("Attempting to get Bool value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Bool {
            print("Successfully got Bool value for \(property): \(value)")
            return value
        }
        print("Could not get Bool value for property: \(property)")
        return nil
    }
    
    func getDoubleValue(_ property: CFString) -> Double? {
        print("Attempting to get Double value for property: \(property)")
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Double {
            print("Successfully got Double value for \(property): \(value)")
            return value
        }
        print("Could not get Double value for property: \(property)")
        return nil
    }
    
    
    print("Fetching power source information...")
    let snapshot = IOPSCopyPowerSourcesInfo().takeRetainedValue()
    let sources = IOPSCopyPowerSourcesList(snapshot).takeRetainedValue() as Array
    
    for ps in sources {
        let info = IOPSGetPowerSourceDescription(snapshot, ps).takeUnretainedValue() as! Dictionary<String, Any>
        print("Processing power source: \(info)")
        
        batteryInfo.name = info[kIOPSNameKey] as? String
        batteryInfo.timeToEmpty = info[kIOPSTimeToEmptyKey] as? Int
        batteryInfo.timeToFull = info[kIOPSTimeToFullChargeKey] as? Int
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
    batteryInfo.voltage = getDoubleValue("Voltage" as CFString)! / 1000.0
    
    // Temperature
    batteryInfo.temperature = getDoubleValue("Temperature" as CFString)! / 100.0
    
    // Manufacture
    //    batteryInfo.manufacturer = getStringValue("Manufacturer" as CFString)
    
    // Charge
    if let current = batteryInfo.currentCapacity, let max = batteryInfo.maxCapacity {
        let value = (Double(current) / Double(max)) * 100.0
        batteryInfo.charge = value
    }
    
    // Health
    if let design = batteryInfo.designCapacity, let current = batteryInfo.maxCapacity {
        let value = (Double(current) / Double(design)) * 100.0
        batteryInfo.health = value
    }
    
    // Time left
    if let isCharging = batteryInfo.isCharging, let minutes = isCharging ? batteryInfo.timeToFull : batteryInfo.timeToEmpty, minutes > 0 {
        let value = String(format: "%.2d:%.2d", minutes / 60, minutes % 60)
        batteryInfo.timeLeft = value
    }
    
    // Time remaining
    if let isCharging = batteryInfo.isCharging {
        let value =  isCharging ? batteryInfo.timeToFull : batteryInfo.timeToEmpty
        batteryInfo.timeRemaining = value
    }
    
    
    // Manufacture date
    if let manufactureDateInt = getIntValue("ManufactureDate" as CFString) {
        let day = manufactureDateInt & 31
        let month = (manufactureDateInt >> 5) & 15
        let year = ((manufactureDateInt >> 9) & 127) + 1980
        
        var components = DateComponents()
        components.day = day
        components.month = month
        components.year = year
        
        if let date = Calendar.current.date(from: components) {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "dd-MM-yyyy"
            let dateString = dateFormatter.string(from: date)
            print("The manufacture date: \(dateString)")
            batteryInfo.manufactureDate = dateString
        }
    }
    
    IOServiceClose(service)
    IOObjectRelease(service)
    
    print("The battery info: \(batteryInfo)")
    
    return batteryInfo
}

