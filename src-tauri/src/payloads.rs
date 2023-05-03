use std::io;
use std::path::Path;

#[derive(serde::Serialize, Clone, Debug)]
pub struct BackendFile {
    file: String,
    content: String,
}

impl BackendFile {
    pub fn new<P: AsRef<Path>>(file: P) -> io::Result<Self> {
        let content = &std::fs::read_to_string(file.as_ref())?;
        Ok(Self {
            content: markdown::to_html_with_options(
                content,
                &markdown::Options {
                    compile: markdown::CompileOptions {
                        allow_dangerous_html: true,
                        ..markdown::CompileOptions::default()
                    },
                    ..markdown::Options::gfm()
                },
            )
            .unwrap(),
            file: file.as_ref().display().to_string(),
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
