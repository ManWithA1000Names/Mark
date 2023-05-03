use crate::payloads;
use std::path::Path;
use tauri::Manager;

macro_rules! emit {
    ($app: expr, $event: expr, $payload: expr) => {{
        if let Err(e) = $app.emit_all($event, $payload) {
            crate::log_error!(e);
        }
    }};
}

pub(crate) use emit;

pub fn file_changed<P: AsRef<Path>>(app: &tauri::AppHandle, file: P) {
    match payloads::BackendFile::new(file.as_ref()) {
        Err(e) => {
            crate::log_error!(e);
            failed_to_read(app, file.as_ref());
        }
        Ok(payload) => emit!(app, "file-changed", payload),
    }
}

pub fn failed_to_read<P: AsRef<Path>>(app: &tauri::AppHandle, file: P) {
    emit!(app, "failed-to-read", file.as_ref())
}

pub fn failed_to_watch<P: AsRef<Path>>(app: &tauri::AppHandle, file: P) {
    emit!(app, "failed-to-watch", file.as_ref());
}

pub fn failed_to_unwatch<P: AsRef<Path>>(app: &tauri::AppHandle, file: P) {
    emit!(app, "failed-to-unwatch", file.as_ref())
}

pub fn watcher_failed(app: &tauri::AppHandle) {
    emit!(app, "watcher-failed", "Watcher failed to initialize.");
}
