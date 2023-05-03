import notify from "../components/notifications";

const $bottom = document.querySelector("footer") as HTMLDivElement;
const $button = document.getElementById("snap-to-bottom-button") as HTMLButtonElement;
const $text = $button.querySelector("span") as HTMLSpanElement;

export let locked_at_bottom = false;

export const toggle = () => {
  locked_at_bottom = !locked_at_bottom;
  if (locked_at_bottom) {
    $text.innerText = "Unsnap";
    $button.classList.add("locked");
    $bottom.scrollIntoView({ behavior: "smooth" });
    notify("Scrolling to the end on file change.", "info");
  } else {
    $text.innerText = "Snap to bottom";
    $button.classList.remove("locked");
    notify("Not scrolling to the end on file change.", "info");
  }
};

export const init = () => {
  $button.addEventListener("click", toggle);
};
