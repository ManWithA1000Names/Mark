import { listen } from "@tauri-apps/api/event";
import { FilesManager } from "./lib/files-manager";

import * as shim from "./lib/shim";
import * as keyboard from "./lib/keyboard";

listen("failed-to-read", (event) => {
  console.log("RECEIVED: failed-to-read");
  console.log(event);
});

listen("failed-to-watch", (event) => {
  console.log("RECEIVED: failed-to-watch");
  console.log(event);
});

listen("no-files", (event) => {
  console.log("RECEIVED: no-files");
  console.log(event);
});

window.addEventListener("DOMContentLoaded", () => {
  shim.init();
  keyboard.init();
  FilesManager.getInstance();

  console.log("APPLICATION STARTED!");
});
