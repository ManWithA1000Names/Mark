import notify from "../components/notifications";

const $bottom = document.getElementById("bottom")!;
const $button = document.querySelector("#bottom button")!;
const $button_text_span = document.querySelector("#bottom button span") as HTMLSpanElement;

export let locked_at_bottom = false;

export const toggle = () => {
  locked_at_bottom = !locked_at_bottom;
  if (locked_at_bottom) {
    $button_text_span.innerText = "Unlock (b)";
    $button.classList.add("locked");
    $bottom.scrollIntoView({ behavior: "smooth" });
    notify("Scrolling to the end on file change.", "info");
  } else {
    $button_text_span.innerText = "Lock at bottom (b)";
    $button.classList.remove("locked");
    notify("Not scrolling to the end on file change.", "info");
  }
};

export const init = () => {
  $button.addEventListener("click", toggle);
};
