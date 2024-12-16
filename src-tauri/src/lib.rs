use evtx;
use serde::{Serialize, Deserialize};
use serde_json::{Value, Map};
use std::cmp::min;
use std::sync::Mutex;
use tauri::{Builder, Manager, State};


///
/// We gotta choose _something_ to give them by default.:w
/// 
const DEFAULT_PAGE_SIZE: usize = 10;

///
/// Alias for an individual event Object.
/// 
type Event = Map<String, Value>;

///
/// What the backend needs to keep track of, aka
/// the loaded events.
/// 
#[derive(Default)]
struct AppState {
    events: Mutex<Vec<Event>>,
    column_names: Mutex<Vec<String>>
}


///
/// What gets passed back to the frontend
/// after loading events. The `page_size` isn't
/// strictly necessary as the frontend tracks that,
/// but it's a solid confirmation that the two are
/// aligned.
/// 
#[derive(Default, Debug, Serialize)]
struct PageResult {
    events: Vec<Event>,
    // Option because we only send with the file load
    column_names: Option<Vec<String>>,
    page_num: usize,
    page_size: usize,
    total_events: usize,
}

///
/// The container for sorting info.
/// 
#[derive(Debug, Deserialize)]
struct SortBy {
    column: Column,
    ascending: bool
}

///
/// Necessary for handling filtering and
/// sorting. The `selected` value, while not used,
/// is for parity with the JS representation of the
/// type.
/// 
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
fn filter_events(events:Vec<Event>, filtered_columns: Vec<Column>) -> Vec<Event> {
println!("{filtered_columns:?}");
 events
    .into_iter()
    .filter(|event| {
        filtered_columns
            .iter()
            .all(|c| {
                if event.contains_key(&c.name) {
                    // We need to check the value's type.
                    let val = &event[&c.name];
                    match val {
                        serde_json::Value::Bool(b) => {
                            // This should only be a single situation,
                            // but an important one: the `Flagged` Column.
                            return b == &c.filter.parse::<bool>().unwrap();

                        },
                        serde_json::Value::Number(n) => {
                            // int or float?
                            // Check int first because it could fail
                            if let Some(i) = n.as_i64() {
                                return i == c.filter.parse::<i64>().unwrap()
                            }
                            if let Some(f) = n.as_f64() {
                                return f != c.filter.parse::<f64>().unwrap()
                            }
                            return false;
                        },
                        serde_json::Value::String(s) => {
                            // Normalize to lowercase and search for anything that
                            // contains the string, not exact matches
                            return s.to_lowercase().contains(&c.filter.to_lowercase())
                        }
                        _ => { return false; }
                    }
                }
                // If the Event doesn't have the column, drop it
                return false;
            })
    })
    .collect()

}


#[tauri::command]
async fn select_page(selected: usize, page_size: usize, filtered_columns:Vec<Column>, sort_by: Option<SortBy>, state: State<'_, AppState>) -> Result<PageResult, ()> {
    let mut events = state.events.lock().unwrap();
    // We sort the events inplace if there's a sort column
    if let Some(sb) = &sort_by {
        let c = &sb.column;
        events.sort_by(|a, b| {
        if let Some(a_val) = a.get(&c.name) {
            match b.get(&c.name) {
                Some(b_val) => {
                    match a_val {
                        Value::String(s) => {
                            return s.as_str().cmp(b_val.as_str().unwrap());
                        },
                        Value::Number(n) => {
                            return n.as_u64().unwrap().cmp(&b_val.as_u64().unwrap());
                        }
                        _ => { 
                            return std::cmp::Ordering::Equal; 
                        }
                    }
                },
                None => { return std::cmp::Ordering::Equal; }
            }
        }
        std::cmp::Ordering::Equal
        });

        // Now, if the `sort_by` was descending, flip it.
        if !sb.ascending {
            events.reverse();
        }

    }

    let filtered_events = match filtered_columns.len() {
        0 => events.to_vec(),
        _ => {filter_events(events.to_vec(), filtered_columns)}
    }; 


    let start_idx = match (selected - 1) * page_size >= filtered_events.len() {
        true => 0,
        false => (selected - 1) * page_size
    };
    let end_idx = min(start_idx + page_size, filtered_events.len());
    let res = PageResult {
        events: filtered_events[start_idx..end_idx].to_vec(),
        column_names: None,
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

            // Process #attributes objects
            // Why is this a for loop inside a map?
            // It feels more semantic because it's an iterative process
            // more than a wholesale transformation.
            for (k, v) in e.clone() {
               if v.is_object() {
                let v_obj: &Map<String, Value> = v.as_object().unwrap();
                if v_obj.contains_key("#attributes") {
                   let v_attrs = v_obj.get("#attributes")
                    .unwrap()
                    .as_object()
                    .unwrap();

                   for (attr, val) in v_attrs {
                    let new_key = format!("{k}.{attr}");
                    e.insert(new_key, val.clone());
                   }
                   // Remove original #attributes key
                   e.remove(&k);
                }

               } 
            };

            // Inject the "Flagged" Column
            e.insert("Flagged".to_string(), serde_json::Value::Bool(false));

            e
        })
        .collect();
    // This is needed for lil baby evtx files.
    let page_size = min(events.len(), DEFAULT_PAGE_SIZE);

    // Here we will collect all columns (keys)
    // From the events to make sure nothing's missed
    // This is a heavy step, but one that can't really
    // be missed since some events have unique columns,
    // and because we're paginating, we need all the
    // known columns up front.
    let mut column_names: Vec<String> = Vec::new();
    for event in events.clone() {
        let mut new_columns: Vec<String> = event.keys()
            .filter(|&k| !column_names.contains(k))
            .map(|k| k.to_owned())
            .collect();
        column_names.append(&mut new_columns);
    }

    // Set our state after processing data from events and
    // column names
    state.events.lock().unwrap().clone_from(&events);
    state.column_names.lock().unwrap().clone_from(&column_names);
    Ok(PageResult {
        events: events[0..page_size].to_vec(),
        column_names: Some(column_names),
        page_num: 1,
        page_size,
        total_events: events.len(),
    })
}

#[tauri::command]
async fn flag_event(event_id: u64, state: State<'_, AppState>) -> Result<(),()> {

    println!("Flag Request: {event_id}");
    let mut events = state.events.lock().unwrap();
    
    let new_events = events
    .iter_mut()
    .map(|e| {
        let record_id = e.get("EventRecordID").unwrap().as_u64().unwrap();
        if record_id == event_id {
            println!("Found {record_id}");
            let flag_state = e.get("Flagged").unwrap().as_bool().unwrap();
            e.insert("Flagged".to_string(), serde_json::Value::Bool(!flag_state));
        }
        e.to_owned()
    })
    .collect::<Vec<Map<String, Value>>>();

    drop(events);
    state.events.lock().unwrap().clone_from(&new_events);

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            app.manage(AppState {
                events: Mutex::new(vec![]),
                column_names: Mutex::new(vec![])
            });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_evtx, select_page, flag_event])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
