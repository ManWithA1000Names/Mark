import type { BackendFile, SearchResults } from "../../helpers/bridge";
import styles from "./styles.module.css";

let previous_selection = 0;
const $root = document.getElementById("search-results-root");

export function render(
  resulsts: SearchResults,
  selected: number,
  openFiles: BackendFile[],
  currentFile: BackendFile
) {
  if (!$root) return;

  previous_selection = selected;

  const $ul = document.createElement("ul");
  $ul.classList.add(styles.search_result_list);

  resulsts.forEach((result, index) => {
    const spans = result.file.split("").map((letter, index) => {
      const $span = document.createElement("span");
      if (result.indices.includes(index)) {
        $span.classList.add(styles.active_letter);
      }
      $span.innerText = letter;
      return $span;
    });

    const $li = document.createElement("li");
    if (index == selected) {
      $li.classList.add(styles.active_selection);
    }

    const $button = document.createElement("button");
    $button.id = `search-result-${index}`;
    if (currentFile.file === result.file) {
      $button.disabled = true;
      $button.style.cursor = "not-allowed";
    }

    if (!!openFiles.find((f) => f.file === result.file)) {
      const $span = document.createElement("span");
      $span.append(...spans);
      const $div = document.createElement("div");
      $div.innerText = "open";
      $div.classList.add(styles.open_badge);
      $button.append($span, $div);
      if (currentFile.file === result.file) {
        const $div2 = document.createElement("div");
        $div2.innerText = "active";
        $div2.classList.add(styles.active_badge);
        $button.appendChild($div2);
        $button.classList.add(styles.active);
      } else {
        $button.classList.add(styles.open);
      }
    } else {
      $button.append(...spans);
    }

    $li.appendChild($button);
    $ul.appendChild($li);
  });
  $root.replaceChildren($ul);
}

export const renderSelectionChange = <T extends number>(selected: T) => {
  const $prev_btn = document.getElementById(`search-result-${previous_selection}`);
  if (!$prev_btn) return;
  const $prev_li = $prev_btn.parentNode as HTMLLIElement;
  $prev_li.classList.remove(styles.active_selection);
  const $btn = document.getElementById(`search-result-${selected}`)!;
  const $li = $btn.parentNode as HTMLLIElement;
  $li.classList.add(styles.active_selection);
  $li.scrollIntoView({ behavior: "smooth" });
  previous_selection = selected;
};

export default render;
