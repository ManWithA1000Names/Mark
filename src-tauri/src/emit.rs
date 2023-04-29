use tauri::Manager;

macro_rules! emit {
    ($app: expr, $event: expr, $payload: expr) => {{
        if let Err(e) = $app.emit_all($event, $payload) {
            eprintln!("[ERROR]: {:?}", e);
        }
    }};
}

pub(crate) use emit;

pub fn file_changed<P: AsRef<std::path::Path>>(app: &tauri::AppHandle, file: P) {
    match payload::FileChanged::new(file.as_ref()) {
        Err(e) => {
            eprintln!("[ERROR]: {:?}", e);
            failed_to_read(app, file);
        }
        Ok(payload) => {
            println!("[EMITTING]: FILE-CHANGED -> {:?}", payload);
            emit!(app, "file-changed", payload);
        }
    }
}

pub fn failed_to_read<P: AsRef<std::path::Path>>(app: &tauri::AppHandle, file: P) {
    println!("[EMITTING]: FAILED-TO-READ -> {:?}", file.as_ref());
    emit!(
        app,
        "failed-to-read",
        payload::FailedToRead::new(file.as_ref())
    )
}

pub fn failed_to_open_link(app: &tauri::AppHandle) {
    emit!(app, "failed-to-open-link", ());
}

pub fn failed_to_watch<P: AsRef<std::path::Path>>(app: &tauri::AppHandle, file: P) {
    println!("[EMITTING]: FAILED-TO-WATCH -> {:?}", file.as_ref());
    emit!(
        app,
        "failed-to-watch",
        payload::FailedToWatch::new(file.as_ref())
    );
}

pub fn no_files(app: &tauri::AppHandle) {
    println!("[EMITTING]: NO-FILES");
    emit!(app, "no-files", ());
}

pub mod payload {
    use std::io;
    use std::path::Path;

    #[derive(serde::Serialize, Clone, Debug)]
    pub struct FileChanged<P: AsRef<Path>> {
        file: P,
        content: String,
    }

    impl<P: AsRef<Path>> FileChanged<P> {
        pub fn new(file: P) -> io::Result<Self> {
            let content = std::fs::read_to_string(file.as_ref())?;
            Ok(Self {
                content: markdown::to_html_with_options(
                    &content,
                    &markdown::Options {
                        compile: markdown::CompileOptions {
                            allow_dangerous_html: true,
                            ..markdown::CompileOptions::default()
                        },
                        ..markdown::Options::gfm()
                    },
                )
                .unwrap(),
                file,
            })
        }
    }

    #[derive(serde::Serialize, Clone, Debug)]
    pub struct FailedToRead<'a> {
        file: &'a Path,
    }

    impl<'a> FailedToRead<'a> {
        pub fn new(file: &'a Path) -> Self {
            Self { file }
        }
    }

    #[derive(serde::Serialize, Clone, Debug)]
    pub struct FailedToWatch<'a> {
        file: &'a Path,
    }

    impl<'a> FailedToWatch<'a> {
        pub fn new(file: &'a Path) -> Self {
            Self { file }
        }
    }
}
