/* import { invoke } from "@tauri-apps/api/tauri"; */
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { Payloads } from "./types";

import * as shim from "./lib/shim";
import * as keyboard from "./lib/keyboard";

const article = document.querySelector("article")!;
const fileTitle = document.getElementById("file-name")!;

function file_changed(payload: Payloads.FileChange) {
  article.innerHTML = payload.content;
  fileTitle.innerText = payload.file;
}

listen<Payloads.FileChange>("file-changed", (event) => {
  console.log("RECEIVED: file-changed");
  file_changed(event.payload);
});

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
  invoke<Payloads.FileChange[]>("init_inputs").then((inputs) => {
    if (inputs.length == 0) {
      // open file picker
    } else {
      for (const input of inputs) {
        file_changed(input);
      }
    }
  });
  console.log("APPLICATION STARTED!");
});
