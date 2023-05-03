import type { BackendFile } from "../lib/types";

const $currentFileRoot = document.querySelector("article")!;
const $fileNameRoot = document.getElementById("file-name")!;

export default function render(file: BackendFile) {
  $currentFileRoot.innerHTML = file.content;
  $fileNameRoot.innerText = file.file;
}
