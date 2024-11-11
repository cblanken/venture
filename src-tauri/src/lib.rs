use evtx;
use serde::{Serialize, Deserialize};
use serde_json::{json, Value, Map, to_string, from_str};
use std::cmp::min;
use std::sync::Mutex;
use tauri::{Builder, Manager, State};

const DEFAULT_PAGE_SIZE: usize = 10;

type Event = Map<String, Value>;

#[derive(Default)]
struct AppState {
    events: Mutex<Vec<Event>>,
    page_size: Mutex<usize>,
}

#[derive(Default, Debug, Serialize)]
struct PageResult {
    events: Vec<Event>,
    page_num: usize,
    page_size: usize,
    total_events: usize,
}


#[derive(Default, Debug, Deserialize)]
struct Filter {
    column_name: String,
    pattern: String
}

///
/// To minimize data processing, we will only convert the single page of results into 
/// `serde_json` Objeccts on demand.
/// 
async fn filter_events(page:Vec<Event>, filters: Vec<Filter>) -> Vec<Event> {
 page

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
        page_size,
        total_events: events.len(),
    };
    Ok(res)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn load_evtx(selected: String, state: State<'_, AppState>) -> Result<PageResult, ()> {
    let mut parser = evtx::EvtxParser::from_path(selected).unwrap();
    let events: Vec<Event> = parser.records_json_value()
        .map(|r| {
            // We're flattening the the Event object here to make
            // EvetData and System data on the same level
            let mut data: Event = r.unwrap()
                .data["Event"]
                .as_object_mut()
                .unwrap()
                .to_owned();
            let mut e: Event = data["System"]
                .clone()
                .as_object_mut()
                .unwrap()
                .to_owned();

            if data.contains_key("EventData") {
                e.append(&mut data["EventData"].as_object_mut().unwrap_or(&mut Map::new()));
            }

            e
        })
        .collect();
    // This is needed for lil baby evtx files.
    let page_size = min(events.len(), DEFAULT_PAGE_SIZE);
    state.events.lock().unwrap().clone_from(&events);
    Ok(PageResult {
        events: events[0..page_size].to_vec(),
        page_num: 1,
        page_size,
        total_events: events.len(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            app.manage(AppState {
                events: Mutex::new(vec![]),
                page_size: Mutex::new(DEFAULT_PAGE_SIZE),
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
