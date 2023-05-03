// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use tauri::Manager;

mod cmds;
mod emit;
mod fs;
mod payloads;

use fs::search::FsFuzzySearcher;
use fs::watcher::TheAllMightyWatcher;

macro_rules! log_error {
    ($error: expr) => {{
        if (atty::is(atty::Stream::Stdout)) {
            eprintln!("\u{001b}[31m[ERROR]\u{001b}[0m: {:?}", $error);
        } else {
            eprintln!("[ERROR]: {:?}", $error);
        }
    }};
}

pub(crate) use log_error;

pub static mut SEARCHER: Option<FsFuzzySearcher> = None;

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

    if buf.is_dir() || buf.extension().map(|ext| ext == "md").unwrap_or_default() {
        return buf;
    }

    log_error!(format!(
        "Argument: '{}' does not seem to be a markdown file or a directory.",
        arg
    ));
    std::process::exit(1);
}

fn main() {
    let mut inputs = std::env::args()
        .skip(1)
        .map(validate_arg)
        .collect::<Vec<PathBuf>>();

    inputs.push("/home/quri/dev/external/Mark/README.md".into());

    std::thread::spawn(move || {
        // We are only once (here \/) writing to searcher, so it is safe to be mutated.
        // So no race confitions.
        unsafe { SEARCHER = FsFuzzySearcher::new().ok() };
    });

    let (tx_inputs, rx_inputs) = crossbeam_channel::unbounded();

    tauri::Builder::default()
        .manage(inputs.clone())
        .manage(tx_inputs)
        .setup(move |app| {
            let handle = app.handle();
            let (tx_remove, rx_remove) = crossbeam_channel::unbounded();
            app.listen_global("remove-file", move |e| {
                if let Some(Ok(string)) = e.payload().map(serde_json::from_str::<String>) {
                    if let Err(e) = tx_remove.try_send(PathBuf::from(&string)) {
                        log_error!(e);
                        emit::failed_to_unwatch(&handle, string);
                    }
                }
            });
            match TheAllMightyWatcher::new(rx_inputs, rx_remove, app.handle()) {
                Ok(mut watcher) => {
                    watcher.inputs(inputs);
                    watcher.spawn();
                }
                Err(e) => {
                    log_error!(e);
                    emit::watcher_failed(&app.handle());
                }
            };

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            cmds::exit,
            cmds::init_inputs,
            cmds::search_files,
            cmds::new_file,
            cmds::open,
            cmds::open_browser,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
