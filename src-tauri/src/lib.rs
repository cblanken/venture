use evtx;
use serde::{Serialize, Deserialize};
use serde_json::{Value, Map};
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
struct Column {
    name: String,
    selected: bool,
    filter: String
}

///
/// To minimize data processing, we will only convert the single page of results into 
/// `serde_json` Objeccts on demand.
/// 
fn filter_events(page:Vec<Event>, filtered_columns: Vec<Column>) -> Vec<Event> {
println!("{filtered_columns:?}");
 page
    .into_iter()
    .filter(|e| {
        for c in &filtered_columns {
            if e.contains_key(&c.name) {
                if let Some(val) = e[&c.name].as_str() {
                    return c.filter.contains(val);
                }
            }
        }   
        false
    })
    .collect()

}
///
/// Sorts the Page by a given column before passing back.
/// 
/// This is nested with [[filter_events]]
/// 
fn sort_events(page:Vec<Event>, sort_column:Column) -> Vec<Event> {
    let mut sorted = page.clone();
    sorted.sort_by(|a, b| {
        if let Some(a_val) = a.get(&sort_column.name) {
            match b.get(&sort_column.name) {
                Some(b_val) => {
                    let a_str = a_val.as_str().unwrap();
                    let b_str = b_val.as_str().unwrap();
                    return a_str.cmp(b_str);
                },
                None => { return std::cmp::Ordering::Equal; }
            }
        }
        std::cmp::Ordering::Equal
    });
    sorted
}


#[tauri::command]
async fn select_page(selected: usize, filtered_columns:Vec<Column>, state: State<'_, AppState>) -> Result<PageResult, ()> {
    let page_size = *state.page_size.lock().unwrap();
    let events = state.events.lock().unwrap();
    let filtered_events = match filtered_columns.len() {
        0 => events.to_vec(),
        _ => {filter_events(events.to_vec(), filtered_columns)}
    }; 
    let start_idx = (selected - 1) * page_size;
    let end_idx = min(start_idx + page_size, filtered_events.len());
    let res = PageResult {
        events: filtered_events[start_idx..end_idx].to_vec(),
        page_num: selected,
        page_size,
        total_events: filtered_events.len(),
    };
    drop(events);
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
                e.append(
                    data["EventData"]
                    .as_object_mut()
                    .unwrap_or(&mut Map::new())
                );
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
