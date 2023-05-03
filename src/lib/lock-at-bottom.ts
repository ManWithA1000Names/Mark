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
    notify("Snapping to bottom.", "info");
  } else {
    $text.innerText = "Snap to bottom";
    $button.classList.remove("locked");
    notify("Not snapping to bottom", "info");
  }
};

export const init = () => {
  $button.addEventListener("click", toggle);
};
