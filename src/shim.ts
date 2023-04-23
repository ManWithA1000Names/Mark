import { invoke } from "@tauri-apps/api";

export function shim() {
  shim_as();
  shim_imgs();
}

function shim_as() {
  const as = document.querySelectorAll("a")!;
  for (let i = 0; i < as.length; i++) {
    as[i].addEventListener("click", (e) => {
      e.preventDefault();
      invoke("open_link", { link: as[i].href });
    });
  }
}

function shim_imgs() {
  const imgs = document.querySelectorAll("img");
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].addEventListener("click", () => {
      invoke("open_link", { link: imgs[i].src });
    });
  }
}
