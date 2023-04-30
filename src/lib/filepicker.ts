import type { BackendFile, SearchResults } from "../types";
import { emit, Event } from "@tauri-apps/api/event";

import { checkKey, wrap } from "./utils";
import { search } from "./search";
import { RenderedObservable } from "./observable";
import * as render from "../components";
import { invoke } from "@tauri-apps/api";
import { locked_at_bottom } from "./lock-at-bottom";

const DEFAULT_CURRENT_FILE: BackendFile = {
  file: "no file selected",
  content: "No content.",
};

const recentFiles: string[] = [];
const openFiles = new Map<string, BackendFile>();

const keyToIndex = (file: string) => Array.from(openFiles.keys()).indexOf(file);
const indexToKey = (index: number) => Array.from(openFiles.keys())[index];

const $bottom = document.getElementById("bottom") as HTMLDivElement;
const $pager = document.getElementById("file-pager") as HTMLDivElement;
export const $form = document.querySelector("form") as HTMLFormElement;
export const $input = document.querySelector("input") as HTMLInputElement;
export const $filepicker = document.getElementById("file-picker-root") as HTMLDivElement;

//TODO: active index is all over the place, thus we need to replace openFiles with an array of sorts.
export const activeIndex$ = new RenderedObservable(0, (index) => {
  $pager.innerText = `${index + 1}/${openFiles.size}`;
});
export const selected$ = new RenderedObservable(0, render.selectionChange);
export const activeFile$ = new RenderedObservable(DEFAULT_CURRENT_FILE, render.activeFile);
export const searchResults$ = new RenderedObservable<SearchResults>([], (res) => {
  render.searchResults(res, selected$.value, openFiles, activeFile$.value);
});

const addRecentFile = (file: string) => {
  if (recentFiles.length === 3) {
    recentFiles[2] = recentFiles[1];
    recentFiles[1] = recentFiles[0];
    recentFiles[0] = file;
  } else {
    recentFiles.unshift(file);
  }
};

const removeRecentFile = (file: string, index?: number) => {
  const i = index ?? recentFiles.indexOf(file);
  if (i < 0) return;
  recentFiles.splice(i, 1);
};

const __search = async (input: string = "") => {
  return search(input)
    .then((results) => {
      selected$.value = 0;
      searchResults$.value = results;
    })
    .catch(console.error);
};

export const nextFile = () => {
  if (openFiles.size === 0) return;

  let index = keyToIndex(activeFile$.value.file);
  index = wrap(index + 1, 0, openFiles.size - 1);
  activeIndex$.value = index;
  const key = indexToKey(index);
  const file = openFiles.get(key)!;
  if (file.file !== activeFile$.value.file) {
    activeFile$.value = file;
  }
};

export const prevFile = () => {
  if (openFiles.size === 0) return;

  let index = keyToIndex(activeFile$.value.file);
  index = wrap(index - 1, 0, openFiles.size - 1);
  activeIndex$.value = index;
  const key = indexToKey(index);
  const file = openFiles.get(key)!;
  if (file.file !== activeFile$.value.file) {
    activeFile$.value = file;
  }
};

export const openRecentFile = (index: number) => {
  if (index < 0 || index >= recentFiles.length) return;
  setActiveFile(recentFiles[index]);
  removeRecentFile(recentFiles[index], index);
  hide();
};

export const setActiveFile = (file: string) => {
  console.log("what??");
  if (file === activeFile$.value.file) return;
  console.log("what?");
  if (openFiles.has(file)) {
    activeIndex$.value = keyToIndex(file);
    activeFile$.value = openFiles.get(file)!;
  } else {
    invoke<BackendFile>("open_file", { file })
      .then((f) => {
        activeFile$.value = f;
        openFiles.set(f.file, f);
        activeIndex$.value++;
        removeRecentFile(f.file);
      })
      .catch(console.error);
  }
};

export const closeActiveFile = () => {
  // There is no file to close.
  if (openFiles.size === 0) return;

  const file = activeFile$.value.file;
  emit("remove-file", file);

  addRecentFile(file);
  openFiles.delete(file);

  activeFile$.value = openFiles.values().next()?.value || DEFAULT_CURRENT_FILE;
  if (openFiles.size === 0) show();
};

export const initialize = (files: BackendFile[]) => {
  if (files.length === 0) {
    show();
  } else {
    activeFile$.value = files[0];
    for (const file of files) {
      openFiles.set(file.file, file);
    }
    activeIndex$.value = 0;
  }
};

export const show = () => {
  if (!$filepicker.hidden) return;

  __search();
  $input.value = "";
  render.recentFiles(recentFiles);
  $filepicker.removeAttribute("hidden");
  $filepicker.setAttribute("data-visible", "true");
  setTimeout(() => $input.focus(), 0);
  setTimeout(() => document.addEventListener("click", handleClick.outsideFilepicker), 0);
};

export const hide = () => {
  if ($filepicker.hidden) return;

  $input.blur();
  $filepicker.setAttribute("hidden", "true");
  $filepicker.setAttribute("data-visible", "false");
  document.removeEventListener("click", handleClick.outsideFilepicker);
};

export const toggle = () => ($filepicker.hidden ? show() : hide());

export namespace handleClick {
  export const searchResult = (e: MouseEvent) => {
    let id: string | null = null;
    if ((e.target as HTMLElement).matches("button")) {
      id = (e.target as HTMLButtonElement).id;
    } else if ((e.target as HTMLElement).matches("span")) {
      id = ((e.target as HTMLSpanElement).parentNode as HTMLButtonElement).id;
    }
    if (id === null) return;

    let index = window.parseInt(id.replace("search-result-", ""));
    if (window.isNaN(index)) return;

    const file = searchResults$.value[index].file;
    if (file === activeFile$.value.file) return;
    setActiveFile(file);
    hide();
  };

  export const outsideFilepicker = (e: MouseEvent) => {
    if ($filepicker.hidden) return;
    if (e.target === $filepicker) return;
    if ($filepicker.contains(e.target as HTMLElement)) return;
    hide();
  };

  export const edit = () => {
    invoke("edit_file", { file: activeFile$.value.file }).catch(console.error);
  };

  export const recentFile = (e: MouseEvent) => {
    let id: string | null = null;
    if ((e.target as HTMLElement).matches("button")) {
      id = (e.target as HTMLButtonElement).id;
    } else if ((e.target as HTMLElement).matches("span")) {
      id = ((e.target as HTMLSpanElement).parentNode as HTMLButtonElement).id;
    } else if ((e.target as HTMLElement).matches("kbd")) {
      id = ((e.target as HTMLDivElement).parentNode as HTMLButtonElement).id;
    }
    if (id === null) return;

    setActiveFile(id.replace("recent-file-", ""));
    hide();
  };

  export const openClose = toggle;
}

export namespace on {
  export const input = (e: globalThis.Event) => {
    __search((e.target as HTMLInputElement).value);
  };

  export const inputKeydown = (e: KeyboardEvent) => {
    let amount: number | null = null;
    if (checkKey(e, "ArrowDown") || checkKey(e, "j", "ctrlKey") || checkKey(e, "Tab")) {
      amount = 1;
    } else if (
      checkKey(e, "ArrowUp") ||
      checkKey(e, "k", "ctrlKey") ||
      checkKey(e, "Tab", "shiftKey")
    ) {
      amount = -1;
    }
    if (amount === null) return;
    if (e.code) e.preventDefault();
    selected$.value = wrap(selected$.value + amount, 0, searchResults$.value.length - 1);
  };

  export const submit = (e: SubmitEvent) => {
    e.preventDefault();
    const file = searchResults$.value[selected$.value].file;
    if (file === activeFile$.value.file) return;
    setActiveFile(file);
    hide();
  };

  export const fileChanged = (e: Event<BackendFile>) => {
    openFiles.set(e.payload.file, e.payload);
    if (e.payload.file === activeFile$.value.file) activeFile$.value = e.payload;
    if (locked_at_bottom) $bottom.scrollIntoView({ behavior: "smooth" });
  };
}
