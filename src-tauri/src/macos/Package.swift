// swift-tools-version: 5.7
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "sys-scope-macos",
    platforms: [
        .macOS(.v10_15), // macOS Catalina. Earliest version that is officially supported by Apple.
    ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "sys-scope-macos",
            type: .static,
            targets: ["sys-scope-macos"]),
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
        .package(url: "https://github.com/brendonovich/swift-rs", branch: "specta"),
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "sys-scope-macos",
            dependencies: [
                .product(name: "SwiftRs", package: "swift-rs")],
            path: "src-swift"
        ),
    ]
)
