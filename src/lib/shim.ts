import notify from "../components/notifications";
import * as bridge from "../helpers/bridge";

export const init = () => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.matches("a")) {
      e.preventDefault();
      bridge.fn
        .openBrowser((target as HTMLAnchorElement).href)
        .then(() => {
          notify("Opened the link", "success");
        })
        .catch((e) => {
          console.error(e);
          notify("Failed to open the link", "error");
        });
    } else if (target.matches("img")) {
      bridge.fn
        .openBrowser((target as HTMLImageElement).src)
        .then(() => notify("Opened the image", "success"))
        .catch((e) => {
          console.error(e);
          notify("Failed to open the image", "error");
        });
    }
  });
};
