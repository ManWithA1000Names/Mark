import Links from "./links";
import * as fp from "./filepicker";
import { checkKey } from "./utils";
import { invoke } from "@tauri-apps/api";
import * as locked from "./lock-at-bottom";

const hasMods = (e: KeyboardEvent) => e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;

const handle_scroll_left = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "h") return false;

  document.documentElement.scrollBy({
    top: 0,
    left: -100,
    behavior: "smooth",
  });

  return true;
};

const handle_scroll_right = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "l") return false;

  document.documentElement.scrollBy({
    top: 0,
    left: 100,
    behavior: "smooth",
  });

  return true;
};

const handle_scroll_up = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "k") return false;

  document.documentElement.scrollBy({
    top: -100,
    left: 0,
    behavior: "smooth",
  });

  return true;
};

const handle_scroll_down = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "j") return false;

  document.documentElement.scrollBy({
    top: 100,
    left: 0,
    behavior: "smooth",
  });

  return true;
};

const handle_scroll_page_up = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "u") return false;

  document.documentElement.scrollBy({
    top: window.innerHeight / -2,
    behavior: "smooth",
  });

  return true;
};
const handle_scroll_page_down = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "d") return false;
  document.documentElement.scrollBy({
    top: window.innerHeight / 2,
    behavior: "smooth",
  });
  return true;
};

const handle_scroll_to_top = (e: KeyboardEvent) => {
  if (!checkKey(e, "g")) return false;
  document.querySelector("main")?.scrollIntoView({ behavior: "smooth" });
  return true;
};

const handle_scroll_to_bottom = (e: KeyboardEvent) => {
  if (!checkKey(e, "G", "shiftKey")) return false;
  document.getElementById("bottom")?.scrollIntoView({ behavior: "smooth" });
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

    if (checkKey(e, "H", "shiftKey")) return fp.nextFile();
    if (checkKey(e, "L", "shiftKey")) return fp.prevFile();

    if (handle_scroll_up(e)) return;
    if (handle_scroll_down(e)) return;
    if (handle_scroll_left(e)) return;
    if (handle_scroll_right(e)) return;
    if (handle_scroll_page_up(e)) return;
    if (handle_scroll_page_down(e)) return;
    if (handle_scroll_to_top(e)) return;
    if (handle_scroll_to_bottom(e)) return;

    if (checkKey(e, "o")) {
      mode = "link";
      Links.show();
    }

    if (checkKey(e, "q")) return invoke("exit");

    if (checkKey(e, "b")) return locked.toggle();

    // idk...
  });
};
