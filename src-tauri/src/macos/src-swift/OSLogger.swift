import Foundation
import OSLog

@available(macOS 11.0, *)
class OSLogger {
    private let logger: Logger
    
    /// Creates a new logger instance with the specified tag value
    ///
    ///  - parameters:
    ///       * tag: `String` value used to tag log messages
    init(tag: String) {
        logger = Logger(
            subsystem: "sys-scope-macos",
            category: tag
        )
    }
    
    func debug(_ message: String) {
        logger.debug("\(message, privacy: .public)")
    }
    
    func info(_ message: String) {
        logger.info("\(message, privacy: .public)")
    }
    
    func error(_ message: String) {
        logger.error("\(message, privacy: .public)")
    }
    
}
