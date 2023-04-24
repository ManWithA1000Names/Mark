/* import { invoke } from "@tauri-apps/api/tauri"; */
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { shim } from "./shim";

/* import { on_setup as nav_setup } from "./nav"; */

/* let greetInputEl: HTMLInputElement | null; */
/* let greetMsgEl: HTMLElement | null; */

/* async function greet() { */
/*   if (greetMsgEl && greetInputEl) { */
/*     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command */
/*     greetMsgEl.textContent = await invoke("greet", { */
/*       name: greetInputEl.value, */
/*     }); */
/*   } */
/* } */

const article = document.querySelector("article")!;
const article_file: HTMLElement = document.querySelector(".article-file")!;
listen("file-changed", (event) => {
  console.log("RECEIVED: file-changed");
  console.log(event);
  article.innerHTML = event.payload.content;
  shim();
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
  /* nav_setup(); */
  invoke<{ file: string; content: string }[]>("init_inputs").then((inputs) => {
    if (inputs.length == 0) {
      // open file picker
    } else {
      for (const input of inputs) {
        article.innerHTML = input.content;
        console.log(input.content);
        article_file.innerText = "file: " + input.file;
        shim();
      }
    }
  });
  console.log("hello");
});
