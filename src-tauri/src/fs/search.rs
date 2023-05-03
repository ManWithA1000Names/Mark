use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use ignore::Walk;

#[derive(Default)]
pub struct FsFuzzySearcher {
    paths: Vec<String>,
    matcher: SkimMatcherV2,
}

#[derive(serde::Serialize)]
pub struct SearchResult {
    pub score: i64,
    pub indices: Vec<usize>,
    pub file: String,
}

pub type SearchResults = Vec<SearchResult>;

impl FsFuzzySearcher {
    pub fn new() -> std::io::Result<Self> {
        let mut s = Self::default();
        s.index()?;
        Ok(s)
    }

    pub fn index(&mut self) -> std::io::Result<()> {
        self.paths = Walk::new(std::env::current_dir()?)
            .flatten()
            .filter_map(|entry| {
                let path = entry.path();
                if path.is_file() && path.extension().map(|ext| ext == "md").unwrap_or_default() {
                    return Some(format!("{}", path.display()));
                }
                None
            })
            .collect();
        Ok(())
    }

    pub fn search<S: AsRef<str>>(&self, input: S) -> SearchResults {
        let mut results = self
            .paths
            .iter()
            .enumerate()
            .map(|(i, item)| {
                let result = self
                    .matcher
                    .fuzzy_indices(item, input.as_ref())
                    .unwrap_or_default();
                SearchResult {
                    score: result.0,
                    indices: result.1,
                    file: self.paths[i].clone(),
                }
            })
            .collect::<Vec<_>>();
        // Sort by match scores, DESCENDING
        results.sort_by(|a, b| b.score.cmp(&a.score));
        results
    }
}
