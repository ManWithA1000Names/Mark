import type { Event } from "@tauri-apps/api/event";
import type { BackendFile, SearchResults } from "../helpers/bridge";

import * as render from "../components";
import * as bridge from "../helpers/bridge";

import notify from "../components/notifications";

import { checkKey, wrap } from "../helpers/utils";
import { locked_at_bottom } from "./lock-at-bottom";
import { switch_to_changing } from "./switch-to-changing";
import { RenderedObservable } from "../helpers/observable";

const DEFAULT_CURRENT_FILE: BackendFile = {
  file: "no file selected",
  content: "No content.",
};

const recentFiles: string[] = [];
const openFiles: BackendFile[] = [];

const $bottom = document.querySelector("footer") as HTMLDivElement;
export const $form = document.querySelector("form") as HTMLFormElement;
export const $input = document.querySelector("input") as HTMLInputElement;
export const $filepicker = document.getElementById("file-picker-root") as HTMLDivElement;

export const activeFile$ = new RenderedObservable(DEFAULT_CURRENT_FILE, render.activeFile);
export const activeIndex$ = new RenderedObservable(-1, (index) => {
  render.filePager(index, openFiles.length, nextFile, prevFile);
  activeFile$.value = index < 0 ? DEFAULT_CURRENT_FILE : openFiles[index];
});
export const selected$ = new RenderedObservable(0, render.selectionChange);
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
  return bridge.fn
    .search(input)
    .then((results) => {
      selected$.value = 0;
      searchResults$.value = results;
    })
    .catch((e) => {
      console.error(e);
      notify("Failed to execute search!", "error");
    });
};

export const nextFile = () => {
  if (openFiles.length === 0) return;
  const index = wrap(activeIndex$.value + 1, 0, openFiles.length - 1);
  if (index === activeIndex$.value) return;
  activeIndex$.value = index;
};

export const prevFile = () => {
  if (openFiles.length === 0) return;
  const index = wrap(activeIndex$.value - 1, 0, openFiles.length - 1);
  if (index === activeIndex$.value) return;
  activeIndex$.value = index;
};

export const openRecentFile = (index: number) => {
  if (index < 0 || index >= recentFiles.length) return;
  setActiveFile(recentFiles[index]);
  removeRecentFile(recentFiles[index], index);
  hide();
};

export const setActiveFile = (file: string) => {
  if (file === activeFile$.value.file) return;
  let index = openFiles.findIndex((f) => f.file === file);

  if (index >= 0) {
    activeIndex$.value = index;
  } else {
    bridge.fn
      .newFile(file)
      .then((f) => {
        openFiles.push(f);
        activeIndex$.value = openFiles.length - 1;
        removeRecentFile(f.file);
      })
      .catch((e) => {
        console.error(e);
        notify("Failed to open the file!", "error");
      });
  }
};

export const closeActiveFile = () => {
  if (openFiles.length === 0) return;
  const file = activeFile$.value.file;

  bridge.emit.removeFile(file);
  addRecentFile(file);

  const index = openFiles.findIndex((f) => f.file === file);
  const length = openFiles.length;
  openFiles.splice(index, 1);
  if (activeIndex$.value === length - 1) {
    activeIndex$.value -= 1;
  } else {
    activeIndex$.rerender();
  }

  if (activeIndex$.value < 0) show();
};

export const initialize = (files: BackendFile[]) => {
  if (files.length === 0) {
    show();
  } else {
    for (const file of files) openFiles.push(file);
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
    bridge.fn
      .open(activeFile$.value.file)
      .then(() => {
        notify("Opened file with system default application.", "success");
      })
      .catch((e) => {
        console.error(e);
        notify("Failed to open file for editing!", "error");
      });
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
    if (e.code === "Tab") e.preventDefault();
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
    const index = openFiles.findIndex((f) => f.file === e.payload.file);
    index >= 0 ? (openFiles[index] = e.payload) : openFiles.push(e.payload);
    if (switch_to_changing) {
      activeIndex$.value = index >= 0 ? index : openFiles.length - 1;
    } else if (index === activeIndex$.value) {
      activeIndex$.rerender();
    }
    if (locked_at_bottom) $bottom.scrollIntoView({ behavior: "smooth" });
  };
}
