use swift_rs::SwiftLinker;

fn main() {
  SwiftLinker::new("10.15")
      .with_package("sys-scope-macos", "src/macos")
      .link();
  tauri_build::build()
}
