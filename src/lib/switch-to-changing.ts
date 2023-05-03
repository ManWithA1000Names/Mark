import notify from "../components/notifications";

const $button = document.getElementById("switch-to-changed-button") as HTMLButtonElement;
const $text = $button.querySelector("span") as HTMLSpanElement;

export let switch_to_changing = false;

export const toggle = () => {
  switch_to_changing = !switch_to_changing;
  if (switch_to_changing) {
    $button.classList.add("locked");
    $text.innerText = "Dont switch to changing file";
    notify("Switching to changing files", "info");
  } else {
    $button.classList.remove("locked");
    $text.innerText = "Switch to changing file";
    notify("Not switching to changing files", "info");
  }
};

export const init = () => {
  $button.addEventListener("click", toggle);
};
