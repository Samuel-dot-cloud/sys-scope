#![cfg(target_os = "macos")]

use swift_rs::swift;

pub type NSObject = *mut std::ffi::c_void;

swift!(pub fn set_transparent_titlebar(window: &NSObject));