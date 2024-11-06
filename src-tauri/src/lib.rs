use tauri::{Builder, Manager, State};
use std::sync::Mutex;
use serde::Serialize;
use evtx;

const DEFAULT_PAGE_SIZE: usize = 10;

#[derive(Default)]
struct AppState {
    events: Mutex<Vec<String>>,
    page_size: Mutex<usize>

}

#[derive(Default, Debug, Serialize)]
struct PageResult {
    events: Vec<String>,
    page_num: usize,
    page_size: usize,
    total_events: usize
}

#[tauri::command]
async fn select_page(selected: usize, state: State<'_, AppState>) -> Result<PageResult, ()> {
    let page_size = *state.page_size.lock().unwrap();
    let events = state.events.lock().unwrap();
    let start_idx = (selected - 1) * page_size;
    let end_idx = start_idx + page_size;
    let res = PageResult {
        events: events[start_idx..end_idx].to_vec(),
        page_num: selected,
        page_size: page_size,
        total_events: events.len(),
    };
    Ok(res)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn load_evtx(selected: String, state: State<'_, AppState >) -> Result<PageResult, ()> {
    let mut parser = evtx::EvtxParser::from_path(selected).unwrap();
    let events: Vec<String> = parser.records_json().map(|r| {
        r.unwrap().data
    })  
    .collect();
    *state.events.lock().unwrap() = events.clone();
    Ok(PageResult {
        events: events[0..DEFAULT_PAGE_SIZE].to_vec(),
        page_num: 1,
        page_size: DEFAULT_PAGE_SIZE,
        total_events: events.len()
    })

}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            app.manage(AppState {
                events: Mutex::new(vec![]),
                page_size: Mutex::new(DEFAULT_PAGE_SIZE)
            });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_evtx, select_page])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
