// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use crossbeam_channel::Sender;
use tauri::Manager;

mod emit;
mod watcher;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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

fn handle_new_file_dir_with_wacther(
    event: tauri::Event,
    app: &tauri::AppHandle,
    tx: &Sender<PathBuf>,
) {
    let Some(payload) = event.payload() else {
        return;
    };
    if let Err(e) = tx.try_send(PathBuf::from(payload)) {
        eprintln!("[ERROR]: {:?}", e);
    } else {
        emit::file_changed(app, payload);
    }
}

fn handle_new_file_dir_no_watcher(event: tauri::Event, app: &tauri::AppHandle) {
    let Some(payload) = event.payload() else {
        return;
    };
    emit::file_changed(app, payload);
}

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

    let inputs2 = inputs.clone();

    tauri::Builder::default()
        .manage(inputs2)
        .setup(move |app| {
            let handle = app.handle();

            let (tx, rx) = crossbeam_channel::unbounded();
            match watcher::TheAllMightyWatcher::new(rx, app.handle()) {
                Ok(mut watcher) => {
                    app.listen_global("new-file-dir", move |event| {
                        handle_new_file_dir_with_wacther(event, &handle, &tx);
                    });
                    watcher.inputs(inputs);
                    watcher.spawn();
                }
                Err(e) => {
                    eprintln!("[ERROR]: {:?}", e);
                    app.listen_global("new-file-dir", move |event| {
                        handle_new_file_dir_no_watcher(event, &handle);
                    });
                }
            };

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, init_inputs, open_link])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
