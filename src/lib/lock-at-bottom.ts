const $bottom = document.getElementById("bottom")!;
const $button = document.querySelector("#bottom button")!;
const $button_text_span = document.querySelector("#bottom button span") as HTMLSpanElement;

export let locked_at_bottom = false;

export const toggle = () => {
  console.log("what");
  locked_at_bottom = !locked_at_bottom;
  if (locked_at_bottom) {
    $button_text_span.innerText = "Unlock";
    $button.classList.add("locked");
    $bottom.scrollIntoView({ behavior: "smooth" });
  } else {
    $button_text_span.innerText = "Lock at bottom";
    $button.classList.remove("locked");
  }
};

export const init = () => {
  $button.addEventListener("click", toggle);
};
