import * as shim from "./lib/shim";
import * as keyboard from "./lib/keyboard";
import * as filesmanager from "./lib/files-manager";
import * as locked from "./lib/lock-at-bottom";
import * as listen from "./lib/listen";
import * as switching from "./lib/switch-to-changing";

import notify from "./components/notifications";

window.addEventListener("DOMContentLoaded", () => {
  shim.init();
  listen.init();
  locked.init();
  keyboard.init();
  switching.init();
  filesmanager.init();
  notify("success", "success", 7000);
  notify("error", "error", 6000);
  notify("info", "info", 5000);
  console.log("APPLICATION STARTED!");
});
