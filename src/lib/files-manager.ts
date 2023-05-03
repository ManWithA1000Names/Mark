import * as bridge from "../helpers/bridge";

import * as fp from "./filepicker";
import notify from "../components/notifications";

export const init = () => {
  fp.$input.addEventListener("input", fp.on.input);
  fp.$form.addEventListener("submit", fp.on.submit);
  fp.$input.addEventListener("keydown", fp.on.inputKeydown);

  document
    .getElementById("recent-files-root")!
    .addEventListener("click", fp.handleClick.recentFile);

  document
    .getElementById("search-results-root")!
    .addEventListener("click", fp.handleClick.searchResult);

  document
    .getElementById("file-picker-button")!
    .addEventListener("click", fp.handleClick.openClose);

  document.getElementById("close-active-file")!.addEventListener("click", fp.closeActiveFile);

  document.getElementById("edit-file-button")!.addEventListener("click", fp.handleClick.edit);

  bridge.on.fileChanged(fp.on.fileChanged);

  bridge.fn
    .initialInputs()
    .then(fp.initialize)
    .catch(() => notify("Failed to retrieve initial inputs!", "error"));
};
