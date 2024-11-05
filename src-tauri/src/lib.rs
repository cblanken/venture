use tauri::{Builder, Manager};
use std::path::Path;
use evtx;

#[derive(Default)]
struct AppData {
    current_page: usize,
    events: Vec<String>
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn load_evtx(selected: &Path) -> Vec<String> {
    let mut parser = evtx::EvtxParser::from_path(selected).unwrap();
    parser.records_json().map(|r| {
        r.unwrap().data
    })  
    .collect()   
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            app.manage(AppData {
                current_page: 0,
                events: vec![]
            });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_evtx])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
