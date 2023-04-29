import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { BackendFile } from "../types";

import * as fp from "./filepicker";

/* import { checkKey } from "./utils"; */

/* const keyboardShortcuts = (e: KeyboardEvent) => { */
/*   if (checkKey(e, "Escape") && !fp.$filepicker.hidden) return fp.hide(); */
/*   if (checkKey(e, "0", "ctrlKey")) return fp.openRecentFile(0); */
/*   if (checkKey(e, "1", "ctrlKey")) return fp.openRecentFile(1); */
/*   if (checkKey(e, "2", "ctrlKey")) return fp.openRecentFile(2); */

/*   console.log(e.target); */
/*   if ((e.target as HTMLElement).matches?.("input")) return; */

/*   if (e.key === "f") return fp.show(); */
/*   if (e.key === "c") return fp.closeActiveFile(); */
/* }; */

/* Setup */
export const init = () => {
  fp.$input.addEventListener("input", fp.on.input);
  fp.$form.addEventListener("submit", fp.on.submit);
  fp.$input.addEventListener("keydown", fp.on.inputKeydown);

  /* document.addEventListener("keydown", keyboardShortcuts); */

  document
    .getElementById("search-results-root")!
    .addEventListener("click", fp.handleClick.searchResult);

  document
    .getElementById("recent-files-root")!
    .addEventListener("click", fp.handleClick.recentFile);

  document
    .getElementById("file-picker-button")!
    .addEventListener("click", fp.handleClick.openClose);

  document.getElementById("edit-file-button")!.addEventListener("click", fp.handleClick.edit);

  listen<BackendFile>("file-changed", fp.on.fileChanged);

  invoke<BackendFile[]>("init_inputs").then(fp.initialize).catch(console.error);
};

/**
 * FILE MANAGER
 * - current file / how to render it.
 * - the file picker and how to render it.
 * - the logic fow how to swap files next/prev.
 * - how many files are loaded.
 * - Recent files (not loaded).
 * - logic to add / remove files.
 * - logic to handle input search / completion.
 * - All the error handeling.
 */
