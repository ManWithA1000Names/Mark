import { invoke } from "@tauri-apps/api";
import notify from "../components/notifications";

export const init = () => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.matches("a")) {
      e.preventDefault();
      invoke("open_link", { link: (target as HTMLAnchorElement).href })
        .then(() => {
          notify("Opened the link", "success");
        })
        .catch((e) => {
          console.error(e);
          notify("Failed to open the link", "error");
        });
      return;
    }

    if (target.matches("img")) {
      invoke("open_link", { link: (target as HTMLImageElement).src })
        .then(() => notify("Opened the image", "success"))
        .catch((e) => {
          console.error(e);
          notify("Failed to open the image", "error");
        });
    }
  });
};
