import * as shim from "./lib/shim";
import * as keyboard from "./lib/keyboard";
import * as filesmanager from "./lib/files-manager";
import * as locked from "./lib/lock-at-bottom";
import * as listen from "./lib/listen";

import notify from "./components/notifications";

window.addEventListener("DOMContentLoaded", () => {
  shim.init();
  listen.init();
  locked.init();
  keyboard.init();
  filesmanager.init();
  notify("success", "success");
  notify("error", "error");
  notify("info", "info");
  console.log("APPLICATION STARTED!");
});
