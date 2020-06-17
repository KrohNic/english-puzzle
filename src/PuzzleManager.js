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
    this.fillAnswButton = document.querySelector(".fill_button");
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

    this.lines[this.curLineNumber].classList.add(Consts.BOARD_ACTIVE_CLASS);
    this.piecesMaker.makeNewLine(this.curLineNumber, this.getSentence());
    this.fillAnswButton.classList.remove(Consts.TRANSPARENT_CLASS);

    window.addEventListener("resize", () => this.resizeHandler());
  }

  showCheckButton() {
    this.checkButton.classList.remove(Consts.TRANSPARENT_CLASS);
    this.fillAnswButton.classList.add(Consts.TRANSPARENT_CLASS);
  }

  showFillButton() {
    this.fillAnswButton.classList.remove(Consts.TRANSPARENT_CLASS);
    this.checkButton.classList.add(Consts.TRANSPARENT_CLASS);
  }

  checkAnswer() {
    const pieces = this.lines[this.curLineNumber].children;
    const sentence = this.getSentence();
    const words = sentence.split(" ");
    let answer = true;

    words.forEach((word, i) => {
      const wordOnPiece = pieces[i].dataset.word;
      const isWordRight = wordOnPiece === word;

      answer = answer && isWordRight;

      if (isWordRight)
        this.piecesMaker.redrawWord(wordOnPiece, Consts.TEXT_GREEN);
      else this.piecesMaker.redrawWord(wordOnPiece, Consts.TEXT_RED);
    });

    return answer;
  }

  checkBtnHandler() {
    const isRightAnswer = this.checkAnswer();

    if (!isRightAnswer) return;

    if (this.curLineNumber === Consts.SENTENCE_COUNT - 1) {
      alert("Congratulations!");
      return;
    }

    this.piecesMaker.redrawLine(this.curLineNumber);
    this.lines[this.curLineNumber].classList.remove(Consts.BOARD_ACTIVE_CLASS);
    this.curLineNumber += 1;
    this.lines[this.curLineNumber].classList.add(Consts.BOARD_ACTIVE_CLASS);
    this.actions.setLine(this.lines[this.curLineNumber]);
    this.piecesMaker.makeNewLine(this.curLineNumber, this.getSentence());
    this.showFillButton();
  }

  changeCheckToContinueButton() {
    this.checkButton.textContent = Consts.CONTINUE_BTN_NAME;
  }

  changeContinueButtonToCheck() {
    this.checkButton.textContent = Consts.CHECK_BTN_NAME;
  }

  fillAnswer() {
    const curPieces = this.piecesMaker.linesData[this.curLineNumber].piecesData;
    curPieces.forEach(piece =>
      this.lines[this.curLineNumber].append(piece.elem)
    );
    this.piecesMaker.updateLocksConnections();
    this.showCheckButton();
    this.changeCheckToContinueButton();
  }

  pieceMovedHandler() {
    if (this.respawn.children.length) {
      this.showFillButton();
    } else {
      this.changeContinueButtonToCheck();
      this.showCheckButton();
    }
  }

  setHandlers() {
    this.img.addEventListener("load", () => this.imgLoadHandler());
    this.checkButton.addEventListener("click", () => this.checkBtnHandler());
    this.fillAnswButton.addEventListener("click", () => this.fillAnswer());
    document.body.addEventListener("pieceMoved", () =>
      this.pieceMovedHandler()
    );
  }
}
