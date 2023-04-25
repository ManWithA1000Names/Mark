import Links from "./links";
import FilePicker from "../components/file-picker";
import { invoke } from "@tauri-apps/api";

const hasMods = (e: KeyboardEvent) =>
  e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;

const handle_previous_file = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "H") return false;

  invoke("next-file").catch(() => {
    console.log("no next file");
  });

  return true;
};

const handle_next_file = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "L") return false;

  return true;
};

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

const handle_open_file_picker = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "f") return false;
  FilePicker.show();
  return true;
};

const handle_link_mode = (e: KeyboardEvent) => {
  if (hasMods(e)) return;
  if (e.key !== "o") return;
  Links.show();
  return true;
};

const handle_close_file = (e: KeyboardEvent) => {
  if (hasMods(e)) return false;
  if (e.key !== "c") return false;

  return true;
};

export const init = () => {
  document.addEventListener("keydown", (e) => {
    console.log(e.key);
    if (e.key === "Escape") {
      document.getElementById("file-picker-root")?.removeAttribute("hidden");
      Links.hide();
      FilePicker.hide();
      return;
    }
    if ((e.target as HTMLElement).matches("input")) return;

    if (Links.on_keydown(e)) return;

    if (handle_previous_file(e)) return;
    if (handle_next_file(e)) return;
    if (handle_scroll_left(e)) return;
    if (handle_scroll_right(e)) return;
    if (handle_scroll_up(e)) return;
    if (handle_scroll_down(e)) return;
    if (handle_scroll_page_up(e)) return;
    if (handle_scroll_page_down(e)) return;
    if (handle_open_file_picker(e)) return;
    if (handle_link_mode(e)) return;
    if (handle_close_file(e)) return;

    // idk...
  });
};
