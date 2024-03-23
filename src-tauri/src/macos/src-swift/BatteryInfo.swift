import Foundation
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
            print("Successfully got Int value for \(property): \(value)")
            return value
        }
        print("Could not get Int value for property: \(property)")
        return 0
    }
    
    func getStringValue(_ property: CFString) -> String {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? String {
            print("Successfully got String value for \(property): \(value)")
            return value
        }
        print("Could not get String value for property: \(property)")
        return "-----"
    }
    
    func getBoolValue(_ property: CFString) -> Bool {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Bool {
            print("Successfully got Bool value for \(property): \(value)")
            return value
        }
        print("Could not get Bool value for property: \(property)")
        return false
    }
    
    func getDoubleValue(_ property: CFString) -> Double {
        if let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Double {
            print("Successfully got Double value for \(property): \(value)")
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

class BatteryProcessInfoReader: NSObject {
    let logger = OSLogger(tag: "BatteryProcessInfo")
    
    private let queue = DispatchQueue(label: "com.sysscope.BatteryProcessInfoReader", attributes: .concurrent)
    
    func fetchTopBatteryProcesses(completion: @escaping ([TopProcess]) -> Void) {
        queue.async {
            let numberOfProcesses = 5
            
            guard let output = self.executeTopCommand() else {
                DispatchQueue.main.async {
                    completion([])
                }
                return
            }
            
            let processes = self.parseOutput(output)
            let sortedProcesses = self.sortAndLimitProcesses(processes, limit: numberOfProcesses)
            
            DispatchQueue.main.async {
                completion(sortedProcesses)
            }
        }
    }
    
    private func executeTopCommand() -> String? {
        let task = Process()
        task.launchPath = "/usr/bin/top"
        task.arguments = ["-o", "power", "-l", "2", "-n", "5", "-stats", "pid,command,power"]
        
        let outputPipe = Pipe()
        task.standardOutput = outputPipe
        
        do {
            try task.run()
            task.waitUntilExit()
            let outputData = outputPipe.fileHandleForReading.readDataToEndOfFile()
            return String(decoding: outputData.advanced(by: outputData.count/2), as: UTF8.self)
            
        } catch {
            logger.error("Failed to run process: \(error.localizedDescription)")
            return nil
        }
    }
    
    private func parseOutput(_ output: String) -> [TopProcess] {
        var processes: [TopProcess] = []
        
        output.enumerateLines { line, _ in
            let components = line.split(whereSeparator: { $0.isWhitespace }).map(String.init)
            if components.count >= 3,
               let pid = Int(components.first ?? ""),
               let usage = Double(components.last?.filter("01234567890.".contains) ?? "") {
                let name = components.dropFirst().dropLast().joined(separator: " ")
                processes.append(TopProcess(pid: pid, name: SRString(name), usage: usage))
            }
        }
        
        return processes
    }
    
    private func sortAndLimitProcesses(_ processes: [TopProcess], limit: Int) -> [TopProcess] {
        return Array(processes.sorted(by: { $0.usage > $1.usage }).prefix(limit))
    }
}

extension BatteryProcessInfoReader {
    func getTopProcessesSynchronously() -> [TopProcess] {
        let dispatchGroup = DispatchGroup()
        var topProcesses: [TopProcess] = []
        
        dispatchGroup.enter()
        self.fetchTopBatteryProcesses { processes in
            topProcesses = processes
            dispatchGroup.leave()
        }
        
        dispatchGroup.wait()
        return topProcesses
    }
}



