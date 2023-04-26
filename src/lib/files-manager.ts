import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { Payloads } from "../types";
import renderSearchResulsts, {
  renderSelectionChange,
} from "../components/file-picker/search-results";
import renderRecentFiles from "../components/file-picker/recent-files";
import renderCurrentFile from "../components/current-file";

export class FilesManager {
  /* Singleton Pattern */
  private static instance: FilesManager | null = null;

  public static getInstance() {
    if (FilesManager.instance) return FilesManager.instance;
    return (FilesManager.instance = new FilesManager());
  }

  /* HTML Elements */
  private searchForm = document.querySelector("form") as HTMLFormElement;
  private searchInput = document.querySelector("input") as HTMLInputElement;
  private filepickerRoot = document.getElementById(
    "file-picker-root"
  ) as HTMLDivElement;

  /* Private State */
  private openFiles: Map<string, Payloads.File> = new Map();
  private recentFiles: Map<string, Payloads.File> = new Map();
  private showingFilepicker = false;
  private currentFile: Payloads.File = {
    file: "no file selected",
    content: "No content.",
  };
  private selectedSearchResultIndex = 0;
  private searchResults: Payloads.SearchResults = [];

  /* Private Interface */
  private search(input: string) {
    invoke<Payloads.SearchResults>("search_files", { input })
      .then((res) => {
        console.log("what");
        this.searchResults = res;
        this.selectedSearchResultIndex = 0;
        renderSearchResulsts(
          this.searchResults,
          this.selectedSearchResultIndex
        );
      })
      .catch((e) => console.error(e));
  }
  private onSearchSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log("FROM SUBMIT: ", this.selectedSearchResultIndex);
    /* invoke("open-file", { */
    /*   file: this.searchResults[this.selectedSearchResultIndex], */
    /* }).catch(console.error); */
  }
  private selectNextSearchResult() {
    if (this.selectedSearchResultIndex + 1 === this.searchResults.length) {
      this.selectedSearchResultIndex = 0;
    } else {
      this.selectedSearchResultIndex += 1;
    }
    renderSelectionChange(this.selectedSearchResultIndex);
  }
  private selectPreviousSearchResult() {
    if (this.selectedSearchResultIndex - 1 < 0) {
      this.selectedSearchResultIndex = this.searchResults.length - 1;
    } else {
      this.selectedSearchResultIndex -= 1;
    }
    renderSelectionChange(this.selectedSearchResultIndex);
  }

  /* Setup */
  private constructor() {
    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape" && this.showingFilepicker) {
        /* console.log("what"); */
        return this.hideFilepicker();
      }

      if ((e.target as HTMLElement).matches("input")) return;

      if (e.key === "f") {
        return this.showFilepicker();
      }
      if (e.key === "c") {
        return this.closeCurrentFile();
      }
    });

    // Search Result Navigation
    this.searchInput.addEventListener("keydown", (e) => {
      console.log(
        "FROM NAVIGATION",
        e.ctrlKey && e.key === "j" && !e.metaKey && !e.shiftKey && !e.altKey
      );
      if (
        ((e.ctrlKey && e.key === "j") ||
          (!e.ctrlKey && e.key === "ArrowDown") ||
          (!e.ctrlKey && e.key === "Tab")) &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        return this.selectNextSearchResult();
      } else if (
        ((e.ctrlKey && e.key === "k") || (!e.ctrlKey && e.key === "ArrowUp")) &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        return this.selectPreviousSearchResult();
      } else if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.shiftKey &&
        e.key === "Tab"
      ) {
        return this.selectPreviousSearchResult();
      }
    });

    document
      .getElementById("search-results-root")!
      .addEventListener("click", (e) => {
        let id: string | null = null;
        if ((e.target as HTMLElement).matches("button")) {
          id = (e.target as HTMLButtonElement).id;
        } else if ((e.target as HTMLElement).matches("span")) {
          id = ((e.target as HTMLSpanElement).parentNode as HTMLDivElement).id;
        }
        if (id === null) return;
        let index = window.parseInt(id.replace("search-result-", ""));
        if (window.isNaN(index)) return;
        this.selectedSearchResultIndex = index;
      });

    document.addEventListener("click", (e) => {
      if (
        e.target !== this.filepickerRoot &&
        !this.filepickerRoot.contains(e.target as HTMLElement)
      ) {
        this.hideFilepicker();
      }
    });

    this.searchInput.addEventListener("input", (e) => {
      this.search((e.target as HTMLInputElement).value);
    });

    document
      .getElementById("file-picker-button")!
      .addEventListener("click", () => this.toggleFilepicker);

    document
      .getElementById("edit-file-button")!
      .addEventListener("click", () => {
        invoke("edit-file", { file: this.currentFile.file }).catch(
          console.error
        );
      });

    this.searchForm.addEventListener("submit", (e) => this.onSearchSubmit(e));

    listen<Payloads.File>("file-changed", (e) => {
      this.openFiles.set(e.payload.file, e.payload);
      if (e.payload.file === this.currentFile.file) {
        renderCurrentFile(this.currentFile);
      }
    });

    invoke<Payloads.File[]>("init_inputs")
      .then((files) => {
        if (files.length === 0) {
          this.showFilepicker();
        } else {
          this.currentFile = files[0];
          this.recentFiles.set(files[0].file, files[0]);
          renderCurrentFile(files[0]);
          for (const file of files) {
            this.openFiles.set(file.file, file);
          }
        }
      })
      .catch(console.error);
  }

  /* Public Interface */
  public showFilepicker() {
    this.filepickerRoot.removeAttribute("hidden");
    this.filepickerRoot.setAttribute("data-visible", "true");
    this.search("");
    renderRecentFiles(Array.from(this.recentFiles.keys()));
    renderSearchResulsts(this.searchResults, this.selectedSearchResultIndex);
    setTimeout(() => this.searchInput.focus(), 0);
    this.showingFilepicker = true;
  }

  public hideFilepicker() {
    this.filepickerRoot.setAttribute("hidden", "true");
    this.filepickerRoot.setAttribute("data-visible", "false");
    if (document.activeElement === this.searchInput) {
      this.searchInput.blur();
    }
    /* this.searchInput.blur(); */
    this.searchInput.value = "";
    this.searchResults = [];
    this.selectedSearchResultIndex = 0;
    this.showingFilepicker = false;
  }
  public toggleFilepicker() {
    if (this.showingFilepicker) {
      this.hideFilepicker();
    } else {
      this.showFilepicker();
    }
  }
  public closeCurrentFile() {
    if (this.currentFile.file == "no file selected") {
      return;
    }
    invoke("remove-file", { file: this.currentFile.file }).catch(console.error);
    this.openFiles.delete(this.currentFile.file);
    let result = this.openFiles.keys().next();
    if (result.done) {
      this.currentFile = {
        file: "no file selected",
        content: "no content",
      };
      return;
    } else {
      this.currentFile = this.openFiles.get(result.value)!;
    }
  }
}

/**
 * FILE MANAGER
 * - current file / how to render it.
 * - the file picker and how to render it.
 * - the logic fow how to swap files next/prev.
 * - how many files are loaded.
 * - Recent files (not loaded).
 * - logic to add / remove files.
 * - logic to handle input search / completion.
 * - All the error handeling.
 */
