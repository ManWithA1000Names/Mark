import * as shim from "./lib/shim";
import * as listen from "./lib/listen";
import * as keyboard from "./lib/keyboard";
import * as locked from "./lib/lock-at-bottom";
import * as filesmanager from "./lib/files-manager";
import * as switching from "./lib/switch-to-changing";

window.addEventListener("DOMContentLoaded", () => {
  shim.init();
  listen.init();
  locked.init();
  keyboard.init();
  switching.init();
  filesmanager.init();
  console.log("APPLICATION STARTED!");
});
