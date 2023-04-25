import { invoke } from "@tauri-apps/api";

class Files {
  private visible = false;
  private input_value = "";
  private input = document.querySelector(
    "#file-picker-root input"
  ) as HTMLInputElement;

  constructor() {
    this.input.addEventListener("input", (e) => {
      this.input_value = (e.target as HTMLInputElement).value;
    });
    document.querySelector("form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.onSubmit();
    });
  }

  private onSubmit() {}

  public currentFile: string = "";

  public show() {
    if (this.visible) return;
    document.getElementById("file-picker-root")?.removeAttribute("hidden");
    // Skip the first event sent to the input a.k.a the keypressed to open the filepicker.
    setTimeout(() => this.input.focus(), 0);
    this.visible = true;
  }
  public hide() {
    if (!this.visible) return;
    document.getElementById("file-picker-root")?.setAttribute("hidden", "true");
    this.input.blur();
    this.visible = false;
  }
  public toggle() {}
  public render() {}
  public isVisible() {
    return this.visible;
  }
}

const files = new Files();

export const init = () => {
  const buttonFilePicker = document.getElementById(
    "file-picker-button"
  ) as HTMLButtonElement;
  const buttonEditFile = document.getElementById(
    "file-picker-button"
  ) as HTMLButtonElement;
  buttonEditFile.addEventListener("click", () => {
    invoke("edit-file", { file: files.currentFile });
  });
  buttonFilePicker.addEventListener("click", () => {
    files.toggle();
  });
};

export default files;
