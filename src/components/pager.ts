const $pager = document.getElementById("file-pager") as HTMLDivElement;

export const render = (index: number, total: number, onNext: () => void, onPrev: () => void) => {
  if (total > 1) {
    const $btn = document.createElement("button");
    const $btn2 = document.createElement("button");
    $btn.innerText = "←";
    $btn2.innerText = "→";
    $btn.setAttribute("title", "key: H");
    $btn2.setAttribute("title", "key: L");
    $btn.addEventListener("click", onPrev);
    $btn2.addEventListener("click", onNext);
    $pager.replaceChildren($btn, `${index + 1}/${total}`, $btn2);
  } else {
    $pager.innerText = `${index + 1}/${total}`;
  }
};

export default render;
