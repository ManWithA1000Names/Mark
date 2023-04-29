// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crossbeam_channel::Sender;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};
// use tauri::Manager;

mod emit;
mod fs_search;
mod watcher;

use fs_search::{FsFuzzySearcher, SearchResults};

struct SearcherState(Arc<Mutex<Option<FsFuzzySearcher>>>);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn exit() {
    std::process::exit(0);
}

#[tauri::command]
fn search_files(
    state: tauri::State<SearcherState>,
    input: &str,
) -> Result<SearchResults, &'static str> {
    if let Some(ref searcher) = *state.0.lock().unwrap() {
        println!("Searching...");
        Ok(searcher.search(input))
    } else {
        Err("Loading...")
    }
}

#[tauri::command]
fn open_file<'a>(
    file: &'a str,
    tx: tauri::State<Sender<PathBuf>>,
) -> Result<emit::payload::FileChanged<&'a str>, &'static str> {
    let buf = PathBuf::from(file);
    if let Err(e) = tx.try_send(buf) {
        println!("[ERROR]: {:?}", e);
    }
    emit::payload::FileChanged::new(file).map_err(|_| "Failed to open file")
}

#[tauri::command]
fn edit_file(file: &str) -> Result<(), &'static str> {
    opener::open(file).map_err(|_| "Failed to topen file in the system default program")
}

fn validate_arg(arg: String) -> PathBuf {
    if arg == "--help" || arg == "-h" {
        println!("Mark v0.1.0\n");
        println!("Usage: mark [FLAGS] FILES/DIRS...\n");
        println!("Mark the easy, fast, crossplatform markdown viewer.");
        println!("Mark opens, reads and keeps track of changes made to the files and or directories you give it,");
        println!("and renders out the markdown for your viewing pleasure :)");
        std::process::exit(0);
    }

    let buf = PathBuf::from(&arg);

    if buf.is_dir() {
        return buf;
    } else if let Some(ext) = buf.extension() {
        if ext == "md" {
            return buf;
        }
    }

    eprintln!(
        "[ERROR]: Argument: '{}' does not seem to be a file or directory.",
        arg
    );
    std::process::exit(1);
}

// fn handle_new_file_dir_with_wacther(
//     event: tauri::Event,
//     app: &tauri::AppHandle,
//     tx: &Sender<PathBuf>,
// ) {
//     let Some(payload) = event.payload() else {
//         return;
//     };
//     if let Err(e) = tx.try_send(PathBuf::from(payload)) {
//         eprintln!("[ERROR]: {:?}", e);
//     } else {
//         emit::file_changed(app, payload);
//     }
// }

// fn handle_new_file_dir_no_watcher(event: tauri::Event, app: &tauri::AppHandle) {
//     let Some(payload) = event.payload() else {
//         return;
//     };
//     emit::file_changed(app, payload);
// }

#[derive(Clone, Debug, serde::Serialize)]
struct InitialFile {
    file: PathBuf,
    content: String,
}

#[tauri::command]
fn init_inputs(state: tauri::State<Vec<PathBuf>>) -> Vec<InitialFile> {
    let mut v = Vec::new();
    for input in state.iter() {
        match std::fs::read_to_string(input) {
            Err(e) => eprintln!("[ERROR]: {:?}", e),
            Ok(ref payload) => v.push(InitialFile {
                content: markdown::to_html_with_options(
                    payload,
                    &markdown::Options {
                        compile: markdown::CompileOptions {
                            allow_dangerous_html: true,
                            ..markdown::CompileOptions::default()
                        },
                        ..markdown::Options::gfm()
                    },
                )
                .unwrap(),
                file: input.to_owned(),
            }),
        };
    }
    v
}

#[tauri::command]
fn open_link(app: tauri::AppHandle, link: String) {
    if let Err(e) = opener::open_browser(link) {
        eprintln!("[ERROR]: {:?}", e);
        emit::failed_to_open_link(&app);
    }
}

fn main() {
    let mut inputs = std::env::args()
        .skip(1)
        .map(validate_arg)
        .collect::<Vec<PathBuf>>();

    inputs.push(PathBuf::from("/home/quri/dev/external/Mark/README.md"));

    let search_state = SearcherState(Arc::new(Mutex::new(None)));
    let mutex2 = search_state.0.clone();
    std::thread::spawn(move || {
        // If someone panicked holding the lock we are fucked.
        let mut lock = mutex2.lock().unwrap();
        *lock = Some(FsFuzzySearcher::new().unwrap());
    });

    let (tx, rx) = crossbeam_channel::unbounded();
    tauri::Builder::default()
        .manage(inputs.clone())
        .manage(search_state)
        .manage(tx)
        .setup(move |app| {
            match watcher::TheAllMightyWatcher::new(rx, app.handle()) {
                Ok(mut watcher) => {
                    watcher.inputs(inputs);
                    watcher.spawn();
                }
                Err(e) => {
                    eprintln!("[ERROR]: {:?}", e);
                }
            };

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            exit,
            init_inputs,
            open_link,
            search_files,
            open_file,
            edit_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
