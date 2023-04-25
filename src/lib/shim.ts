import { invoke } from "@tauri-apps/api";

export const init = () => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.matches("a")) {
      e.preventDefault();
      invoke("open_link", { link: (target as HTMLAnchorElement).href });
      return;
    }

    if (target.matches("img")) {
      invoke("open_link", { link: (target as HTMLImageElement).src });
    }
  });
};
