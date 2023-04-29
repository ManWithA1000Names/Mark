import Links from "./links";
import * as fp from "./filepicker";
import { checkKey } from "./utils";
import { invoke } from "@tauri-apps/api";

const hasMods = (e: KeyboardEvent) => e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;

const handle_scroll_left = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "h") return false;

  return true;
};

const handle_scroll_right = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "l") return false;

  return true;
};
const handle_scroll_up = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "k") return false;

  return true;
};

const handle_scroll_down = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "j") return false;

  return true;
};

const handle_scroll_page_up = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "u") return false;

  return true;
};
const handle_scroll_page_down = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "d") return false;

  return true;
};

let mode: "default" | "link" = "default";

export const init = () => {
  document.addEventListener("keydown", (e) => {
    if (mode === "link") {
      if (checkKey(e, "Escape")) {
        mode = "default";
        return Links.hide();
      }
      if (Links.on_keydown(e)) return;
    }

    if (checkKey(e, "Escape") && !fp.$filepicker.hidden) return fp.hide();
    if (checkKey(e, "0", "ctrlKey")) return fp.openRecentFile(0);
    if (checkKey(e, "1", "ctrlKey")) return fp.openRecentFile(1);
    if (checkKey(e, "2", "ctrlKey")) return fp.openRecentFile(2);

    if ((e.target as HTMLElement).matches?.("input")) return;

    if (e.key === "f") return fp.show();
    if (e.key === "c") return fp.closeActiveFile();

    if (handle_scroll_left(e)) return;
    if (handle_scroll_right(e)) return;
    if (handle_scroll_up(e)) return;
    if (handle_scroll_down(e)) return;
    if (handle_scroll_page_up(e)) return;
    if (handle_scroll_page_down(e)) return;
    if (checkKey(e, "o")) {
      mode = "link";
      Links.show();
    }

    if (checkKey(e,"q")) invoke("exit");

    // idk...
  });
};
