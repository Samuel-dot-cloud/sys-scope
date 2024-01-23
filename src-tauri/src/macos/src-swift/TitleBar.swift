//
//  TitleBar.swift
//
//
//  Created by Samuel Wahome on 23/01/2024.
//

import AppKit
import SwiftRs

@_cdecl("set_titlebar_style")
public func setTitlebarStyle(window: NSWindow) {
    window.titlebarAppearsTransparent = true

    // Ensures the window is draggable by keeping the title bar area active
    window.isMovableByWindowBackground = true

    let toolbar = NSToolbar(identifier: "window_invisible_toolbar")
    toolbar.showsBaselineSeparator = false
    window.toolbar = toolbar


    // Makes the toolbar draggable
    toolbar.allowsUserCustomization = true
    toolbar.autosavesConfiguration = true

    window.titleVisibility = .hidden
}
