import { listen } from "@tauri-apps/api/event";

import notify from "../components/notifications/";

export const init = () => {
  listen<string>("failed-to-watch", (event) => {
    console.log("RECEIVED: failed-to-watch");
    console.log(event);
    notify(event.payload, "error");
  });

  listen<string>("failed-to-unwatch", (event) => {
    console.log("RECEIVED: failed-to-unwatch");
    console.log(event);
    notify(event.payload, "info");
  });
};
