import notify from "../components/notifications/";
import * as bridge from "../helpers/bridge";

export const init = () => {
  bridge.on.failedToWatch((event) => {
    console.log("RECEIVED: failed-to-watch");
    console.log(event);
    notify(event.payload, "error");
  });

  bridge.on.failedToUnwatch((event) => {
    console.log("RECEIVED: failed-to-unwatch");
    console.log(event);
    notify(event.payload, "info");
  });
};
