import notify from "../components/notifications/";
import * as bridge from "../helpers/bridge";

export const init = () => {
  bridge.on.failedToRead((e) => {
    notify(`Failed to read file: ${e.payload}`, "error", 10000);
  });

  bridge.on.watcherFailed((e) => {
    notify(e.payload, "error", 10000);
  });

  bridge.on.failedToWatch((event) => {
    notify(`Failed to watch: ${event.payload}`, "error", 10000);
  });

  bridge.on.failedToUnwatch((event) => {
    notify(`Failed to unwatch: ${event.payload}`, "info", 10000);
  });
};
