import Foundation
import IOKit.ps
import SwiftRs

private let batteryProcessRegex = try! NSRegularExpression(
    pattern: #"^\s*(\d+)\s+(\S+.*\S+)\s+(\w+)\s+([\d.]+)\s*$"#,
    options: []
)

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
        powerSource = SRString("-----")
        timeToFull = 0
        timeToEmpty = 0
        currentCapacity = 0
        maxCapacity = 0
        designCapacity = 0
        cycleCount = -1
        designCycleCount = -1
        acPowered = false
        isCharging = false
        isCharged = false
        amperage = 0
        voltage = 0.0
        watts = 0.0
        temperature = 0.0
        charge = 0.0
        health = 0.0
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
    let logger = OSLogger(tag: "BatteryInfoFetcher")

    init() {
        service = IOServiceGetMatchingService(kIOMasterPortDefault, IOServiceMatching("AppleSmartBattery"))
    }

    deinit {
        IOServiceClose(service)
        IOObjectRelease(service)
    }

    // TODO: Find fix for wrong battery health value
    public func fetchBatteryInfo() -> BatteryInfo {
        autoreleasepool {
            let batteryInfo = BatteryInfo()

            guard service != 0 else {
                logger.error("No service found for AppleSmartBattery. Exiting function.")
                return batteryInfo
            }

            fetchBatteryProperties(for: batteryInfo)
            fetchPowerSourceInfo(for: batteryInfo)

            let factor: CGFloat = batteryInfo.isCharging ? 1 : -1
            let watts: CGFloat = (CGFloat(batteryInfo.amperage) * CGFloat(batteryInfo.voltage)) / 1000 * factor
            batteryInfo.watts = Double(watts)

            if batteryInfo.maxCapacity > 0, batteryInfo.designCapacity > 0 {
                let health: Double = (Double(batteryInfo.maxCapacity) / Double(batteryInfo.designCapacity)) * 100.0
                batteryInfo.health = health
            }

            if batteryInfo.charge == 0.0, batteryInfo.currentCapacity > 0, batteryInfo.maxCapacity > 0 {
                let charge: Double = (Double(batteryInfo.currentCapacity) / Double(batteryInfo.maxCapacity)) * 100.0
                batteryInfo.charge = charge
            }

            return batteryInfo
        }
    }

    private func fetchPowerSourceInfo(for batteryInfo: BatteryInfo) {
        let snapshot = IOPSCopyPowerSourcesInfo().takeRetainedValue()
        let sources = IOPSCopyPowerSourcesList(snapshot).takeRetainedValue() as Array

        for ps in sources {
            if let info = IOPSGetPowerSourceDescription(snapshot, ps).takeUnretainedValue() as? [String: Any] {
                batteryInfo.timeToEmpty = info[kIOPSTimeToEmptyKey] as? Int ?? 0
                batteryInfo.timeToFull = info[kIOPSTimeToFullChargeKey] as? Int ?? 0

                if let currentCapacity = info[kIOPSCurrentCapacityKey] as? Int,
                   let maxCapacity = info[kIOPSMaxCapacityKey] as? Int,
                   maxCapacity > 0
                {
                    batteryInfo.charge = (Double(currentCapacity) / Double(maxCapacity)) * 100.0
                }

                let powerSourceState = info[kIOPSPowerSourceStateKey] as? String
                batteryInfo.powerSource = SRString(
                    resolvePowerSourceLabel(powerSourceState: powerSourceState, batteryInfo: batteryInfo)
                )
            }
        }
    }

    private func fetchBatteryProperties(for batteryInfo: BatteryInfo) {
        batteryInfo.currentCapacity = getOptionalIntValue("AppleRawCurrentCapacity" as CFString)
            ?? getIntValue("CurrentCapacity" as CFString)
        batteryInfo.maxCapacity = getOptionalIntValue("NominalChargeCapacity" as CFString)
            ?? getOptionalIntValue("AppleRawMaxCapacity" as CFString)
            ?? getIntValue("MaxCapacity" as CFString)
        batteryInfo.designCapacity = getIntValue("DesignCapacity" as CFString)

        if let cycleCount = getOptionalIntValue("CycleCount" as CFString) {
            batteryInfo.cycleCount = cycleCount
        }

        if let designCycleCount = getOptionalIntValue("DesignCycleCount9C" as CFString) {
            batteryInfo.designCycleCount = designCycleCount
        }

        batteryInfo.acPowered = getBoolValue("ExternalConnected" as CFString)
        batteryInfo.isCharging = getBoolValue("IsCharging" as CFString)
        batteryInfo.isCharged = getBoolValue("FullyCharged" as CFString)

        batteryInfo.amperage = getIntValue("Amperage" as CFString)
        batteryInfo.voltage = getDoubleValue("Voltage" as CFString) / 1000.0
        batteryInfo.temperature = getDoubleValue("Temperature" as CFString) / 100.0
    }

    private func getIntValue(_ property: CFString) -> Int {
        IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Int ?? 0
    }

    private func getOptionalIntValue(_ property: CFString) -> Int? {
        guard let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0) else {
            return nil
        }

        return value.takeRetainedValue() as? Int
    }

    private func getStringValue(_ property: CFString) -> String {
        IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? String ?? "-----"
    }

    private func getBoolValue(_ property: CFString) -> Bool {
        IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Bool ?? false
    }

    private func getDoubleValue(_ property: CFString) -> Double {
        IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0).takeRetainedValue() as? Double ?? 0.0
    }

    private func getDictionaryValue(_ property: CFString) -> [String: Any]? {
        guard let value = IORegistryEntryCreateCFProperty(service, property, kCFAllocatorDefault, 0) else {
            return nil
        }

        return value.takeRetainedValue() as? [String: Any]
    }

    private func resolvePowerSourceLabel(powerSourceState: String?, batteryInfo: BatteryInfo) -> String {
        let isBatteryPower = powerSourceState == kIOPSBatteryPowerValue || !batteryInfo.acPowered
        if isBatteryPower {
            return "Battery"
        }

        let adapterDetails = getDictionaryValue("AdapterDetails" as CFString)
            ?? getDictionaryValue("AppleRawAdapterDetails" as CFString)
        let baseLabel = buildExternalPowerLabel(from: adapterDetails)

        if batteryInfo.isCharging {
            return "\(baseLabel) (Charging)"
        }

        return baseLabel
    }

    private func buildExternalPowerLabel(from adapterDetails: [String: Any]?) -> String {
        guard let adapterDetails else {
            return "External Power"
        }

        let description = normalizeAdapterDescription(adapterDetails["Description"] as? String)
        let watts = adapterDetails["Watts"] as? Int

        if let description, let watts, watts > 0 {
            return "\(description) (\(watts)W)"
        }

        if let description {
            return description
        }

        if let watts, watts > 0 {
            return "External Power (\(watts)W)"
        }

        return "External Power"
    }

    private func normalizeAdapterDescription(_ description: String?) -> String? {
        guard let description else {
            return nil
        }

        let normalized = description.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if normalized.isEmpty {
            return nil
        }

        switch normalized {
        case "pd charger":
            return "USB-C PD Charger"
        default:
            return normalized
                .split(separator: " ")
                .map { $0.prefix(1).uppercased() + $0.dropFirst() }
                .joined(separator: " ")
        }
    }
}

@_cdecl("fetch_battery_info")
public func fetchBatteryInfo() -> BatteryInfo {
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

    var processInfo: [BatteryProcess] = []
    let lines = output.split(separator: "\n")

    for line in lines {
        let nsLine = line as NSString
        if let match = batteryProcessRegex.firstMatch(in: String(line), options: [], range: NSRange(location: 0, length: nsLine.length)) {
            guard let pid = Int(nsLine.substring(with: match.range(at: 1))),
                  let power = Double(nsLine.substring(with: match.range(at: 4)))
            else {
                break
            }
            let processName = nsLine.substring(with: match.range(at: 2))

            if power > 0 {
                let iconBase64 = getProcessIconBase64(for: processName) ?? ""
                let topProcess = autoreleasepool { () -> BatteryProcess in
                    return BatteryProcess(
                        pid: pid,
                        name: SRString(processName),
                        power: power,
                        iconBase64: SRString(iconBase64)
                    )
                }
                processInfo.append(topProcess)
            }

            if processInfo.count >= 5 {
                break
            }
        }
    }

    if processInfo.count > 1 {
        processInfo.sort { $0.power > $1.power }
    }

    let result = SRObjectArray(processInfo)
    processInfo.removeAll(keepingCapacity: false)
    return result
}
