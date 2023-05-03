import Links from "./links";
import * as fp from "./filepicker";
import { checkKey } from "./utils";
import { invoke } from "@tauri-apps/api";
import * as locked from "./lock-at-bottom";
import * as switching from "./switch-to-changing";

const $shortcut_guide = document.getElementById("shortcut-guide")!;
const $edit_button = document.getElementById("edit-file-button")!;

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
    top: -window.innerHeight,
    behavior: "smooth",
  });

  return true;
};
const handle_scroll_page_down = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "d") return false;
  document.documentElement.scrollBy({
    top: window.innerHeight,
    behavior: "smooth",
  });
  return true;
};

const handle_scroll_to_top = (e: KeyboardEvent) => {
  if (!checkKey(e, "g")) return false;
  document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  return true;
};

const $bottom = document.querySelector("footer")!;
const handle_scroll_to_bottom = (e: KeyboardEvent) => {
  if (!checkKey(e, "G", "shiftKey")) return false;
  console.log($bottom);
  $bottom.scrollIntoView({ behavior: "smooth" });
  return true;
};

let mode: "default" | "link" | "shortcut_guide" = "default";

const toggleShortcutGuide = () => {
  if ($shortcut_guide.hidden) {
    mode = "shortcut_guide";
    $shortcut_guide.removeAttribute("hidden");
  } else {
    mode = "default";
    $shortcut_guide.setAttribute("hidden", "true");
  }
};

export const init = () => {
  document.addEventListener("keydown", (e) => {
    if (mode === "link") {
      if (checkKey(e, "Escape")) {
        mode = "default";
        return Links.hide();
      }
      return Links.on_keydown(e);
    } else if (mode === "shortcut_guide") {
      if (checkKey(e, "?", "shiftKey") || checkKey(e, "Escape")) toggleShortcutGuide();
      return;
    }

    if (checkKey(e, "Escape") && !fp.$filepicker.hidden) return fp.hide();
    if (checkKey(e, "0", "ctrlKey")) return fp.openRecentFile(0);
    if (checkKey(e, "1", "ctrlKey")) return fp.openRecentFile(1);
    if (checkKey(e, "2", "ctrlKey")) return fp.openRecentFile(2);

    if ((e.target as HTMLElement).matches?.("input")) return;

    if (e.key === "f") return fp.show();
    if (e.key === "c") return fp.closeActiveFile();

    if (checkKey(e, "H", "shiftKey")) return fp.prevFile();
    if (checkKey(e, "L", "shiftKey")) return fp.nextFile();
    if (checkKey(e, "ArrowLeft", "shiftKey")) return fp.prevFile();
    if (checkKey(e, "ArrowRight", "shiftKey")) return fp.nextFile();

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

    if (checkKey(e, "e")) return $edit_button?.click();

    if (checkKey(e, "?", "shiftKey")) return toggleShortcutGuide();

    if (checkKey(e, "s")) return switching.toggle();

    // idk...
  });
};
