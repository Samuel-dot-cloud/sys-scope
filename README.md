# SysScope

SysScope is a macOS system monitoring application built using Tauri. It provides detailed system information, including battery, CPU, memory and disk stats, together with the various running processes specific to those stats.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

## Installation

To install SysScope, follow these steps:

1. **Download** the latest release from the [releases](https://github.com/Samuel-dot-cloud/sys-scope/releases) page.
2. **Run** the installer and follow the on-screen instructions.
3. **Launch** SysScope from your Applications folder after installation.

If you prefer building the app from source:

### Prerequisites

Ensure you have the following installed:

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/en)
- [Xcode](https://developer.apple.com/xcode/)

### Buid from source

```bash
# Clone the repository
git clone https://github.com/Samuel-dot-cloud/sys-scope.git

# Navigate to the project directory
cd sys-scope

# Install dependencies
yarn

# Build and run the app
yarn tauri dev
```

## Usage

Once installed, SysScope provides a clean and intuitive interface for monitoring system resources. Launch the app and you'll see real-time information about:

- **Battery**: Current charge level, cycle counts, and apps/processes consuming battery.
- **Disk**: Available and used disk space, and apps/processes writing to and from disk.
- **Memory**: Real time memory usage, and apps/processes consuming memory.
- **CPU**: CPU load, usage, and apps/processes consuming CPU.

Click on each category to get a more detailed view of the corresponding processes and resources being used.

## Contributing

Contributions are welcome! To contribute to SysScope:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature'`.
4. Push to your branch: `git push origin feature-name`.
5. Open a pull request with a detailed description of your changes.

Feel free to submit bug reports and pull requests through [Github Issues](https://github.com/Samuel-dot-cloud/sys-scope/issues).

## License

SysScope is released under the MIT license.

## Changelog

### v1.0.0 - Initial Release (2024-02-24)

- Real-time monitoring of battery, CPU, memory and disk info.
- User friendly interface.
