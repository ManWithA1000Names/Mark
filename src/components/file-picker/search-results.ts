import { Payloads } from "../../types";
import styles from "./styles.module.css";

let previous_selection = 0;
const root = document.getElementById("search-results-root");

export function render(resulsts: Payloads.SearchResults, selected: number) {
  if (!root) return;
  previous_selection = selected;
  let html = `<ul class="${styles.search_result_list}">`;

  resulsts.forEach((result, index) => {
    const spans = result.file
      .split("")
      .map(
        (letter, index) =>
          `<span class="${
            result.indices.includes(index) ? styles.active_letter : ""
          }">${letter}</span>`
      )
      .join("");

    html += `<li class="${index === selected ? styles.active_selection : ""}">
      <button id="search-result-${index}">${spans}</button>
    </li>
    `;
  });

  html += "</ul>";
  root.innerHTML = html;
}

export const renderSelectionChange = (selected: number) => {
  const prev_btn = document.getElementById(
    `search-result-${previous_selection}`
  )!;
  const prev_li = prev_btn.parentNode as HTMLLIElement;
  prev_li.classList.remove(styles.active_selection);
  const btn = document.getElementById(`search-result-${selected}`)!;
  const li = btn.parentNode as HTMLLIElement;
  li.classList.add(styles.active_selection);
  li.scrollIntoView({ behavior: "smooth" });
  previous_selection = selected;
};

export default render;
