import AppKit

@_cdecl("set_transparent_titlebar")
public func setTransparentTitlebar(window: NSWindow) {
    window.titlebarAppearsTransparent = true

    // Ensures the window is movable by clicking and dragging anywhere in its background.
    window.isMovableByWindowBackground = true

    let toolbar = NSToolbar(identifier: "window_invisible_toolbar")
    toolbar.showsBaselineSeparator = false
    window.toolbar = toolbar

    window.titleVisibility = .hidden
}
