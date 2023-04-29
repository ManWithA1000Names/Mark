import { invoke } from "@tauri-apps/api";
import { SearchResults } from "../types";

export const search = (input: string) => invoke<SearchResults>("search_files", { input });

export default search;
