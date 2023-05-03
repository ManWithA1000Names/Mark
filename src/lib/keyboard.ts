import * as fp from "./filepicker";
import * as locked from "./lock-at-bottom";
import * as bridge from "../helpers/bridge";
import * as switching from "./switch-to-changing";

import Links from "./links";
import { checkKey } from "../helpers/utils";

let MODE: "default" | "link" | "shortcut_guide" = "default";

const $bottom = document.querySelector("footer")!;
const $edit_button = document.getElementById("edit-file-button")!;
const $shortcut_guide = document.getElementById("shortcut-guide")!;

const scroll_left = () => {
  document.documentElement.scrollBy({ left: -100, behavior: "smooth" });
};

const scroll_right = () => {
  document.documentElement.scrollBy({ left: 100, behavior: "smooth" });
};

const scroll_up = () => {
  document.documentElement.scrollBy({ top: -100, behavior: "smooth" });
};

const scroll_down = () => {
  document.documentElement.scrollBy({ top: 100, behavior: "smooth" });
};

const scroll_page_up = () => {
  document.documentElement.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
};

const scroll_page_down = () => {
  document.documentElement.scrollBy({ top: window.innerHeight, behavior: "smooth" });
};

const scroll_to_top = () => {
  document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
};

const scroll_to_bottom = () => $bottom.scrollIntoView({ behavior: "smooth" });

const setLinkMode = () => {
  MODE = "link";
  Links.show();
};

const toggleShortcutGuide = () => {
  if ($shortcut_guide.hidden) {
    MODE = "shortcut_guide";
    $shortcut_guide.removeAttribute("hidden");
  } else {
    MODE = "default";
    $shortcut_guide.setAttribute("hidden", "true");
  }
};

const linkMode = (e: KeyboardEvent) => {
  if (checkKey(e, "Escape")) {
    MODE = "default";
    return Links.hide();
  }

  return Links.on_keydown(e);
};

const shortcutGuideMode = (e: KeyboardEvent) => {
  if (checkKey(e, "?", "shiftKey") || checkKey(e, "Escape")) toggleShortcutGuide();
};

export const init = () => {
  document.addEventListener("keydown", (e) => {
    if (MODE === "link") return linkMode(e);
    if (MODE === "shortcut_guide") return shortcutGuideMode(e);

    if (checkKey(e, "0", "ctrlKey")) return fp.openRecentFile(0);
    if (checkKey(e, "1", "ctrlKey")) return fp.openRecentFile(1);
    if (checkKey(e, "2", "ctrlKey")) return fp.openRecentFile(2);
    if (checkKey(e, "Escape") && !fp.$filepicker.hidden) return fp.hide();

    if ((e.target as HTMLElement).matches?.("input")) return;

    if (checkKey(e, "f")) return fp.show();
    if (checkKey(e, "c")) return fp.closeActiveFile();

    if (checkKey(e, "H", "shiftKey")) return fp.prevFile();
    if (checkKey(e, "L", "shiftKey")) return fp.nextFile();
    if (checkKey(e, "ArrowLeft", "shiftKey")) return fp.prevFile();
    if (checkKey(e, "ArrowRight", "shiftKey")) return fp.nextFile();

    if (checkKey(e, "k")) return scroll_up();
    if (checkKey(e, "j")) return scroll_down();
    if (checkKey(e, "h")) return scroll_left();
    if (checkKey(e, "l")) return scroll_right();
    if (checkKey(e, "u")) return scroll_page_up();
    if (checkKey(e, "d")) return scroll_page_down();

    if (checkKey(e, "g")) return scroll_to_top();
    if (checkKey(e, "G", "shiftKey")) return scroll_to_bottom();

    if (checkKey(e, "o")) return setLinkMode();
    if (checkKey(e, "b")) return locked.toggle();
    if (checkKey(e, "q")) return bridge.fn.exit();
    if (checkKey(e, "s")) return switching.toggle();
    if (checkKey(e, "e")) return $edit_button?.click();
    if (checkKey(e, "?", "shiftKey")) return toggleShortcutGuide();
  });
};
