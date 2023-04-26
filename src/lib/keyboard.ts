import Links from "./links";

const hasMods = (e: KeyboardEvent) =>
  e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;

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

const handle_link_mode = (e: KeyboardEvent) => {
  if (hasMods(e)) return;
  if (e.key !== "o") return;
  Links.show();
  return true;
};

export const init = () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      Links.hide();
      return;
    }
    if ((e.target as HTMLElement).matches("input")) return;

    if (Links.on_keydown(e)) return;

    if (handle_scroll_left(e)) return;
    if (handle_scroll_right(e)) return;
    if (handle_scroll_up(e)) return;
    if (handle_scroll_down(e)) return;
    if (handle_scroll_page_up(e)) return;
    if (handle_scroll_page_down(e)) return;
    if (handle_link_mode(e)) return;

    // idk...
  });
};
