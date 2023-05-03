use crate::emit;
use crate::fs::search::SearchResults;
use crate::payloads::BackendFile;
use crate::SEARCHER;
use crossbeam_channel::Sender;
use std::path::PathBuf;

#[tauri::command]
pub fn exit() {
    std::process::exit(0);
}

#[tauri::command]
pub fn open(file: &str) -> Result<(), &'static str> {
    opener::open(file).map_err(|_| "Failed to topen file in the system default program")
}

#[tauri::command]
pub fn open_browser(url: &str) -> Result<(), &'static str> {
    opener::open_browser(url).map_err(|_| "Failed to to pen url in your default browser")
}

#[tauri::command]
pub fn search_files(input: &str) -> Result<SearchResults, &'static str> {
    // This is safe, since we are only reading from it, and it is only once written to.
    // So no race conditions.
    Ok(unsafe { SEARCHER.as_ref().ok_or("Still indexing files...")? }.search(input))
}

#[tauri::command]
pub fn new_file<'a>(
    app: tauri::AppHandle,
    file: &'a str,
    tx: tauri::State<Sender<PathBuf>>,
) -> Result<BackendFile, &'static str> {
    if let Err(e) = tx.try_send(PathBuf::from(file)) {
        crate::log_error!(e);
        emit::failed_to_watch(&app, file);
    }
    BackendFile::new(file).map_err(|_| "Failed to open file")
}

#[tauri::command]
pub fn init_inputs(app: tauri::AppHandle, inputs: tauri::State<Vec<PathBuf>>) -> Vec<BackendFile> {
    inputs
        .iter()
        .filter_map(|input| match BackendFile::new(input) {
            Ok(f) => Some(f),
            Err(e) => {
                crate::log_error!(e);
                emit::failed_to_read(&app, input);
                None
            }
        })
        .collect()
}
