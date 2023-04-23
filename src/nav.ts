const nav = {
  open: false,
  elem: document.querySelector("nav")!,
  button: document.getElementById("nav-button")!,
};

function toggle_nav() {
  if (nav.open) {
    // create closed state/classes

    // shrink nav
    nav.elem.classList.remove("w-[25vw]");
    nav.elem.classList.add("pr-1");

    nav.elem.classList.add("w-10");

    // change button position/text
    /* nav.button.classList.remove("float-right"); */
    nav.button.classList.remove("rounded-s-full");

    /* nav.button.classList.add("float-left"); */
    nav.button.classList.add("rounded-e-full");

    nav.button.innerText = ">";
  } else {
    // create open state/classes

    // expand nav
    nav.elem.classList.remove("w-10");
    nav.elem.classList.remove("pr-1");

    nav.elem.classList.add("w-[25vw]");

    // change button position/text
    /* nav.button.classList.remove("float-left"); */
    nav.button.classList.remove("rounded-e-full");

    nav.button.classList.add("float-right");
    nav.button.classList.add("rounded-s-full");

    nav.button.innerText = "<";
  }
  nav.open = !nav.open;
}

export const on_setup = () => {
  nav.button.addEventListener("click", toggle_nav);
};
