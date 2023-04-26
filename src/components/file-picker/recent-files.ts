import styles from "./styles.module.css";

const recentFilesRoot = document.getElementById("recent-files-root")!;

export default function render(recentFile: string[]) {
  const html =
    `
    <h4>Recent files:</h4>
    <ul style="border-bottom: 1px solid var(--github-gray)" class="${styles.search_result_list}">` +
    recentFile
      .map(
        (key, index) =>
          `<li>
              <button class="${styles.recent_files_button}" id="recent-file-${key}">
                  <span>${key}</span>
                  <kbd>CTRL + ${index}</kbd>
              </button>
           </li>`
      )
      .join("") +
    "</ul>";
  recentFilesRoot.innerHTML = html;
}
