use crossbeam_channel::Receiver;
use notify::RecursiveMode;
use notify::{RecommendedWatcher, Watcher};
use std::collections::{HashMap, HashSet};
use std::io;
use std::path::PathBuf;

use crate::emit;

pub struct TheAllMightyWatcher {
    watching: HashMap<PathBuf, Option<HashSet<PathBuf>>>,
    watcher: RecommendedWatcher,
    events: Receiver<Result<notify::Event, notify::Error>>,
    new_inputs: Receiver<PathBuf>,
    remove_inputs: Receiver<PathBuf>,
    app: tauri::AppHandle,
}

impl TheAllMightyWatcher {
    pub fn new(
        new_inputs: Receiver<PathBuf>,
        remove_inputs: Receiver<PathBuf>,
        app: tauri::AppHandle,
    ) -> Result<Self, notify::Error> {
        let (events_tx, events) = crossbeam_channel::unbounded();
        let watcher = RecommendedWatcher::new(events_tx, Default::default())?;

        Ok(Self {
            watching: Default::default(),
            watcher,
            events,
            new_inputs,
            remove_inputs,
            app,
        })
    }

    pub fn input(&mut self, input: PathBuf) -> std::io::Result<()> {
        if input.is_file() {
            // SAFETY: unwrap is fine, because we are sure the input is a file.
            let parent = input.parent().unwrap().canonicalize()?;
            match self.watching.get_mut(&parent) {
                Some(None) => { /* this means that all md files in the dir are tacked any way. */ }
                Some(Some(set)) => {
                    set.insert(input);
                }
                None => {
                    let mut set = HashSet::new();
                    set.insert(input);
                    self.watcher
                        .watch(&parent, RecursiveMode::NonRecursive)
                        .map_err(|_| {
                            io::Error::new(
                                io::ErrorKind::PermissionDenied,
                                "Could not watch input.",
                            )
                        })?;
                    self.watching.insert(parent, Some(set));
                }
            };
        } else if input.is_dir() {
            let parent = input.canonicalize()?;
            match self.watching.get_mut(&parent) {
                Some(None) => {}
                None | Some(Some(_)) => {
                    self.watcher
                        .watch(&parent, RecursiveMode::NonRecursive)
                        .map_err(|_| {
                            io::Error::new(
                                io::ErrorKind::PermissionDenied,
                                "Could not watch input.",
                            )
                        })?;
                    self.watching.insert(parent, None);
                }
            }
        } else {
            return Err(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                "Input must be either a file or a directory.",
            ));
        }

        Ok(())
    }

    pub fn inputs(&mut self, inputs: Vec<PathBuf>) {
        for input in inputs.into_iter() {
            if let Err(e) = self.input(input.clone()) {
                crate::log_error!(e);
                emit::failed_to_watch(&self.app, input);
            };
        }
    }

    pub fn remove(&mut self, path: PathBuf) {
        if path.is_file() {
            let Ok(ref parent) = path.parent().unwrap().canonicalize() else {
                return;
            };
            if let Some(Some(files)) = self.watching.get_mut(parent) {
                files.remove(&path);
            }
        } else if path.is_dir() {
            let Ok(ref path) = path.canonicalize() else {
                return;
            };
            self.watching.remove(path);
        }
    }

    pub fn spawn(mut self) {
        std::thread::spawn(move || loop {
            if let Ok(event) = self.events.try_recv() {
                self.handle_event(event);
            }
            if let Ok(path) = self.new_inputs.try_recv() {
                if let Err(e) = self.input(path.clone()) {
                    crate::log_error!(e);
                    emit::failed_to_watch(&self.app, path);
                };
            }
            if let Ok(path) = self.remove_inputs.try_recv() {
                self.remove(path)
            }
        });
    }

    fn handle_event(&self, event: Result<notify::Event, notify::Error>) {
        let Ok(event) = event else {
            return;
        };

        let notify::EventKind::Modify(notify::event::ModifyKind::Data(_)) = event.kind else {
            return;
        };

        'outer: for path in &event.paths {
            for (key, value) in &self.watching {
                if !path.starts_with(key) {
                    continue;
                }
                if let Some(set) = value {
                    if set.contains(path) {
                        emit::file_changed(&self.app, path);
                        continue 'outer;
                    }
                } else if path.extension().map(|ext| ext == "md").unwrap_or_default() {
                    emit::file_changed(&self.app, path);
                    continue 'outer;
                }
            }
        }
    }
}
