import { Consts } from "./Consts.js";
import PiecesMaker from "./PiecesMaker.js";
import UserActions from "./UserActions.js";

//Pieces creates when img are loaded
export default class PuzzleManager {
  constructor(imageSrc, wordsData) {
    this.wordData = wordsData;
    this.curLineNumber = 0;

    this.playground = document.querySelector(".playground");
    this.board = document.querySelector(".board");
    this.lines = document.querySelectorAll(".board--line");
    this.respawn = document.querySelector(".respawn");
    this.checkButton = document.querySelector(".check_button");
    this.img = new Image();

    this.imgRatio;
    this.lineHeight;
    this.piecesMaker = new PiecesMaker(this.respawn, this.lines, this.img);

    this.actions = new UserActions(
      this.playground,
      this.board,
      this.lines[this.curLineNumber],
      this.respawn,
      this.piecesMaker
    );

    this.setHandlers();
    this.img.src = imageSrc;
  }

  getSentence() {
    let sentence = this.wordData[this.curLineNumber].textExample;
    sentence = sentence.replace(/<b>/, "");
    return sentence.replace(/<\/b>/, "");
  }

  resizeHandler() {
    const boardWidth = this.board.clientWidth;
    const boardHeight = Math.round(boardWidth * this.imgRatio);
    const lineGapsCount = Consts.SENTENCE_COUNT - 1;
    const lineGap = Consts.PIECE_COEFS.linesGap * boardHeight;
    const lineGapSum = lineGapsCount * lineGap;
    this.lineHeight = (boardHeight - lineGapSum) / Consts.SENTENCE_COUNT;

    this.board.style.height = `${boardHeight}px`;
    this.respawn.style.minHeight = `${this.lineHeight}px`;
    this.lines.forEach(line => {
      line.style.height = `${this.lineHeight}px`;
    });

    this.piecesMaker.resizePieces(
      this.board.clientWidth,
      this.board.clientHeight,
      this.lineHeight
    );
  }

  imgLoadHandler() {
    this.imgRatio = this.img.height / this.img.width;
    this.resizeHandler();

    this.lines[this.curLineNumber].classList.add("board--line-active");
    this.piecesMaker.makeNewLine(this.curLineNumber, this.getSentence());

    window.addEventListener("resize", () => this.resizeHandler());
  }

  setHandlers() {
    this.img.addEventListener("load", () => this.imgLoadHandler());
    this.checkButton.addEventListener("click", () => this.checkAnswer());
  }

  checkAnswer() {
    const pieces = this.lines[this.curLineNumber].children;
    const sentence = this.getSentence();
    const words = sentence.split(" ");
    const isRightWord = (word, i) =>
      pieces[i] && pieces[i].dataset.word === word;

    const answer = words.every(isRightWord);

    if (!answer) return;

    if (this.curLineNumber === Consts.SENTENCE_COUNT - 1) {
      alert("Congratulations!");
      return;
    }

    this.lines[this.curLineNumber].classList.remove("board--line-active");
    this.curLineNumber += 1;
    this.lines[this.curLineNumber].classList.add("board--line-active");
    this.actions.setLine(this.lines[this.curLineNumber]);

    this.piecesMaker.makeNewLine(this.curLineNumber, this.getSentence());
  }
}
