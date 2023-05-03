import styles from "./styles.module.css";

const $recentFilesRoot = document.getElementById("recent-files-root")!;

export default function render(recentFiles: string[]) {
  if (recentFiles.length === 0) {
    $recentFilesRoot.innerHTML = "";
    return;
  }
  const $h4 = document.createElement("h4");
  $h4.innerText = "Recent files:";

  const $ul = document.createElement("ul");
  $ul.style.borderBottom = "1px solid var(--github-gray)";
  $ul.style.padding = "8px";
  $ul.classList.add(styles.search_result_list);

  recentFiles.forEach((file, index) => {
    const $li = document.createElement("li");
    const $button = document.createElement("button");
    $button.id = `recent-file-${file}`;
    $button.classList.add(styles.recent_files_button);
    const $span = document.createElement("span");
    $span.innerText = file;
    $button.appendChild($span);
    const $kbd = document.createElement("kbd");
    $kbd.innerText = `CTRL + ${index}`;
    $button.appendChild($kbd);
    $li.appendChild($button);
    $ul.appendChild($li);
  });

  $recentFilesRoot.replaceChildren($h4);
  $recentFilesRoot.appendChild($ul);
}
