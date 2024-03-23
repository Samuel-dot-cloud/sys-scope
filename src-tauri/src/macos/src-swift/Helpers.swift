import Cocoa
import SwiftRs

public protocol Process_p {
    var pid: Int { get }
    var name: SRString { get }
//    var icon: NSImage { get }
}

public class TopProcess: NSObject, Process_p {
    public var pid: Int
    public var name: SRString
    public var usage: Double
//    public var icon: NSImage {
//        get {
//            if let app = NSRunningApplication(processIdentifier: pid_t(self.pid)), let icon = app.icon {
//                return icon
//            }
//            return NSWorkspace.shared.icon(forFile: "/bin/bash")
//        }
//    }
    
    public init(pid: Int, name: SRString, usage: Double) {
        self.pid = pid
        self.name = name
        self.usage = usage
    }
}
