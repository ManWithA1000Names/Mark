import { Payloads } from "../types";

const currentFileRoot = document.querySelector("article")!;
const fileNameRoot = document.getElementById("file-name")!;

export default function render(file: Payloads.File) {
  currentFileRoot.innerHTML = file.content;
  fileNameRoot.innerText = file.file;
}
