import Fetcher from "./Fetcher/Fetcher.js";
import PuzzleManager from "./PuzzleManager.js";

export default class App {
  constructor() {
    this.levelInput = switcherLevel.querySelector("input");
    this.pageInput = switcherPage.querySelector("input");
    this.puzzleMgr = null;

    this.imgSrc = "./assets/2big.jpg";

    this.setHandlers();
  }

  loadNewPage() {
    const level = this.levelInput.value;
    const page = this.pageInput.value;
    const callback = data => {
      this.puzzleMgr = new PuzzleManager(this.imgSrc, data);
    };

    Fetcher.getWords(level, page, callback);
  }

  switcherClickHandler(targetSwitcher) {
    if (!targetSwitcher.classList.contains("switcher--button")) return;

    const inputEl = targetSwitcher.parentNode.querySelector("input");
    const savedValue = inputEl.value;

    if (targetSwitcher.classList.contains("switcher--button_increment"))
      inputEl.stepUp();
    else inputEl.stepDown();

    inputEl.setAttribute("prevvalue", inputEl.value);

    if (inputEl.value !== savedValue) this.loadNewPage();
  }

  switcherChangeHandler(event, maxValue) {
    const originalValue = +event.target.getAttribute("prevvalue");
    const newValue = Number.parseInt(event.target.value);

    if (!newValue || newValue < 0 || newValue > maxValue)
      event.target.value = originalValue;
    else event.target.setAttribute("prevvalue", event.target.value);

    this.loadNewPage();
  }

  setHandlers() {
    const switcherLevel = document.querySelector(".switcher_level");
    const switcherPage = document.querySelector(".switcher_page");

    switcherLevel.addEventListener("click", e => {
      this.switcherClickHandler(e.target);
    });

    switcherPage.addEventListener("click", e => {
      this.switcherClickHandler(e.target);
    });

    this.levelInput.addEventListener("change", e => {
      this.switcherChangeHandler(e, values.CARDS_GROUPS_LENGTH);
    });

    this.pageInput.addEventListener("change", e => {
      this.switcherChangeHandler(e, values.CARDS_PAGES_LENGTH);
    });
  }
}
