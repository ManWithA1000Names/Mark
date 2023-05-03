// Standardize the api between vite and tauri A.K.A front-end and back-end.

import { invoke } from "@tauri-apps/api";
import { emit as tauriEmit, listen, Event } from "@tauri-apps/api/event";

export type BackendFile = {
  file: string;
  content: string;
};

export type SearchResults = {
  score: number;
  indices: number[];
  file: string;
}[];

export namespace fn {
  export const exit = () => invoke<void>("exit");
  export const initialInputs = () => invoke<BackendFile[]>("init_inputs");

  export const open = (input: string) => invoke<void>("open", { file: input });
  export const newFile = (file: string) => invoke<BackendFile>("new_file", { file });
  export const openBrowser = (url: string) => invoke<void>("open_browser", { url: url });

  export const search = (input: string) => invoke<SearchResults>("search_files", { input });
}

export namespace emit {
  export const removeFile = (file: string) => {
    tauriEmit("remove-file", file);
  };
}

export namespace on {
  export const failedToWatch = (cb: (event: Event<string>) => void) => {
    return listen<string>("failed-to-watch", cb);
  };

  export const failedToUnwatch = (cb: (event: Event<string>) => void) => {
    return listen<string>("failed-to-unwatch", cb);
  };

  export const fileChanged = (cb: (event: Event<BackendFile>) => void) => {
    return listen<BackendFile>("file-changed", cb);
  };
}
