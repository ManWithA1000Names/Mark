const NUMBER_OF_LETTERS_IN_ALPHABET = 26;
const A_IN_ASCII = 97;

class Links {
  private picking_link = false;
  private currentLinkID = "";
  private isAlpha = /[a-z]/;
  private num_of_links: number = 0;
  private id_length = 0;

  private IDlength(): number {
    const res = Math.ceil(Math.log(this.num_of_links) / Math.log(NUMBER_OF_LETTERS_IN_ALPHABET));
    this.id_length = res;
    return res;
  }

  private generateID(index: number, idLength: number) {
    if (index === 0) {
      return "a".repeat(idLength);
    }

    let id = "";
    while (index > 0) {
      const remainder = index % NUMBER_OF_LETTERS_IN_ALPHABET;
      id = String.fromCharCode(A_IN_ASCII + remainder) + id;
      index = Math.floor(index / NUMBER_OF_LETTERS_IN_ALPHABET);
    }

    const paddingLength = idLength - id.length;
    const padding = "a".repeat(paddingLength);

    return padding + id;
  }

  private reverseID(id: string, idLength: number) {
    const paddedId = id.padStart(idLength, "a");
    let num = 0;

    for (let i = 0; i < paddedId.length; i++) {
      const digit = paddedId.charCodeAt(i) - A_IN_ASCII;
      num += digit * Math.pow(NUMBER_OF_LETTERS_IN_ALPHABET, paddedId.length - i - 1);
    }

    return num;
  }

  private unpopulate_link_hints() {
    const anchors = this.getAnchors();
    for (let i = 0; i < anchors.length; i++) {
      anchors[i].querySelector("kbd")?.remove();
    }
  }

  private hideLinkHints() {
    if (this.currentLinkID.length === 0) return;
    const anchors = this.getAnchors();
    for (let i = 0; i < anchors.length; i++) {
      const spans = anchors[i].getElementsByTagName("span");
      for (let j = 0; j < this.currentLinkID.length; j++) {
        if (spans[j].innerText === this.currentLinkID[j]) {
          spans[j].classList.add("active-letter");
        }
      }
    }
  }

  private getAnchors() {
    const anchors = document.getElementsByTagName("a");
    this.num_of_links = anchors.length;
    return anchors;
  }

  private showLinkHints() {
    this.picking_link = true;

    const anchors = this.getAnchors();
    this.IDlength();
    for (let i = 0; i < anchors.length; i++) {
      const id = this.generateID(i, this.id_length);
      const kbd = document.createElement("kbd");
      kbd.style.right = this.id_length * -10 + "px";
      for (const letter in id.split("")) {
        const span = document.createElement("span");
        span.innerText = letter;
        kbd.appendChild(span);
      }
      anchors[i].appendChild(kbd);
    }
  }

  public hide() {
    if (!this.picking_link) return;
    this.unpopulate_link_hints();
    this.picking_link = false;
    this.id_length = 0;
    this.num_of_links = 0;
    this.currentLinkID = "";
  }

  public show() {
    this.showLinkHints();
  }

  public on_keydown(e: KeyboardEvent): boolean {
    if (!this.picking_link) return false;
    if (e.shiftKey) return false;
    if (e.metaKey) return false;
    if (e.ctrlKey) return false;
    if (e.altKey) return false;

    if (!this.isAlpha.test(e.key)) return false;

    this.currentLinkID += e.key;

    if (this.currentLinkID.length == this.id_length) {
      const anchors = this.getAnchors();
      anchors[this.reverseID(this.currentLinkID, this.id_length)]?.click();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    } else {
      this.hideLinkHints();
    }

    return true;
  }
}

export default new Links();
