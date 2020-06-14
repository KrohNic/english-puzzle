import { Consts } from "./Consts.js";

export default class PiecesMaker {
  constructor(respawn, lineElArr, img) {
    this.respawn = respawn;
    this.lineElArr = lineElArr;
    this.img = img;
    this.linesData = [];
    this.boardW;
    this.boardH;
    this.canvasH;
    this.rightR;
    this.leftR;
    this.rightLockOffset;
    this.leftLockOffset;
    this.rightLockW;
    this.leftLockW;
    this.lockGap;
  }

  addLeftLock(ctx) {
    ctx.arc(
      this.leftLockOffset,
      this.canvasH / 2,
      this.leftR,
      0,
      Math.PI * 2,
      true
    );
  }

  addRightLock(ctx, textRectEnd) {
    ctx.arc(
      textRectEnd + this.rightLockOffset,
      this.canvasH / 2,
      this.rightR,
      0,
      Math.PI * 2,
      false
    );
  }

  addText(ctx, word, textRectStart, textRectW) {
    ctx.font = `900 ${this.canvasH}px Consolas`;

    const offsetY = Consts.PIECE_COEFS.textYoffset * this.canvasH;
    const requiredW = ctx.measureText(word).width;
    const margin = (textRectW - requiredW) / 2;

    if (margin > 0) textRectStart += margin;

    ctx.fillText(word, textRectStart, offsetY, textRectW);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Consts.PIECE_COEFS.textStroke * this.canvasH;
    ctx.strokeText(word, textRectStart, offsetY, textRectW);
  }

  addBg(ctx, bgParams) {
    ctx.drawImage(this.img, bgParams.x, bgParams.y, this.boardW, this.boardH);
  }

  fillFirstPiece(canvas, textRectW, bgParams, word) {
    const ctx = canvas.getContext("2d");
    const textRectStart = 0;
    const textRectEnd = textRectW;

    canvas.width = textRectW + this.rightLockW;
    canvas.height = this.canvasH;
    canvas.classList.add(Consts.CLASS_NAME_FIRST);

    ctx.rect(0, 0, textRectEnd, this.canvasH);
    this.addRightLock(ctx, textRectEnd);
    ctx.clip();

    this.addBg(ctx, bgParams);
    this.addText(ctx, word, textRectStart, textRectW);

    return canvas;
  }

  fillMiddlePiece(canvas, textRectW, bgParams, word) {
    const ctx = canvas.getContext("2d");
    const textRectStart = this.leftLockW;
    const textRectEnd = this.leftLockW + textRectW;

    canvas.width = this.leftLockW + textRectW + this.rightLockW;
    canvas.height = this.canvasH;
    this.addLeftLock(ctx);

    ctx.rect(0, 0, textRectEnd, this.canvasH);
    this.addRightLock(ctx, textRectEnd);
    ctx.clip();

    this.addBg(ctx, bgParams);
    this.addText(ctx, word, textRectStart, textRectW);

    return canvas;
  }

  fillLastPiece(canvas, textRectW, bgParams, word) {
    const ctx = canvas.getContext("2d");
    const textRectStart = this.leftLockW;
    const textRectEnd = this.leftLockW + textRectW;

    canvas.width = this.leftLockW + textRectW;
    canvas.height = this.canvasH;
    this.addLeftLock(ctx);
    canvas.classList.add(Consts.CLASS_NAME_LAST);

    ctx.rect(0, 0, textRectEnd, this.canvasH);
    ctx.clip();

    this.addBg(ctx, bgParams);
    this.addText(ctx, word, textRectStart, textRectW);

    return canvas;
  }

  makeElement(word) {
    const canvas = document.createElement("canvas");

    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.classList.add(Consts.CLASS_NAME);
    canvas.dataset.word = word;

    return canvas;
  }

  getLetterWidth(boardW, sentence, wordsCount) {
    const closedLockW = this.rightLockW + this.lockGap;
    const locksCount = wordsCount - 1;
    const widthForLetters = boardW - closedLockW * locksCount;
    const lettersInSentence = sentence.length - locksCount;
    return widthForLetters / lettersInSentence;
  }

  randOrderRespawn(pieces) {
    const piecesToDistribute = [...pieces];

    while (piecesToDistribute.length) {
      const j = Math.floor(Math.random() * piecesToDistribute.length);
      this.respawn.append(piecesToDistribute[j].elem);
      piecesToDistribute.splice(j, 1);
    }
  }

  getBgLineStartY(lineNumber) {
    const linesGap = Consts.PIECE_COEFS.linesGap * this.boardH;
    return lineNumber * (this.canvasH + linesGap);
  }

  getBgStartX(pieceIndex, prevBgStartX, textWidth) {
    if (pieceIndex === 0) return prevBgStartX + textWidth + this.lockGap;

    return prevBgStartX + textWidth + this.lockGap + this.leftLockW;
  }

  fillPiece(baseEl, word, textWidth, wordIndex, wordsCount, bgX, bgY) {
    const bgPosition = {
      x: -bgX,
      y: -bgY
    };

    if (wordIndex === 0) {
      this.fillFirstPiece(baseEl, textWidth, bgPosition, word);
    } else if (wordIndex === wordsCount - 1) {
      this.fillLastPiece(baseEl, textWidth, bgPosition, word);
    } else {
      this.fillMiddlePiece(baseEl, textWidth, bgPosition, word);
    }
  }

  makeNewLine(lineNumber, sentence) {
    const linePiecesData = [];
    const wordsArr = sentence.split(" ");
    const letterW = this.getLetterWidth(this.boardW, sentence, wordsArr.length);
    const bgY = this.getBgLineStartY(lineNumber);
    let bgX = 0;

    wordsArr.forEach((word, i) => {
      const textWidth = letterW * word.length;
      const element = this.makeElement(word);

      this.fillPiece(element, word, textWidth, i, wordsArr.length, bgX, bgY);
      bgX = this.getBgStartX(i, bgX, textWidth);

      linePiecesData.push({
        elem: element,
        index: i,
        word: word
      });
    });

    this.linesData.push({
      piecesData: linePiecesData,
      sentence: sentence
    });
    this.randOrderRespawn(linePiecesData);
  }

  static isNotLockContainsBorder(leftPiece, rightPiece) {
    return (
      !leftPiece.classList.contains(Consts.CLASS_NAME_LAST) &&
      !rightPiece.classList.contains(Consts.CLASS_NAME_FIRST)
    );
  }

  updateLocksConnections() {
    this.lineElArr.forEach(line => {
      if (!line.children.length) return;

      let offsetX = 0;

      line.children[0].style.left = `0px`;

      for (let i = 1; i < line.children.length; i += 1) {
        if (
          PiecesMaker.isNotLockContainsBorder(
            line.children[i - 1],
            line.children[i]
          )
        ) {
          offsetX -= this.rightLockW;
        }

        offsetX += this.lockGap;
        line.children[i].style.left = `${offsetX}px`;
      }
    });
  }

  initSizes(boardW, boardH, lineH) {
    this.boardW = boardW;
    this.boardH = boardH;
    this.canvasH = lineH;
    this.rightR = Consts.PIECE_COEFS.rightLockRadius * lineH;
    this.leftR = Consts.PIECE_COEFS.leftLockRadius * lineH;
    this.rightLockOffset = Consts.PIECE_COEFS.rightLockOffset * lineH;
    this.leftLockOffset = Consts.PIECE_COEFS.leftLockOffset * lineH;
    this.rightLockW = this.rightR + this.rightLockOffset;
    this.leftLockW = this.leftR + this.leftLockOffset;
    this.lockGap = Consts.PIECE_COEFS.lockGap * lineH;
  }

  resizePieces(boardW, boardH, lineH) {
    this.initSizes(boardW, boardH, lineH);

    this.linesData.forEach((lineDataItem, lineNumber) => {
      const wordsCount = lineDataItem.piecesData.length;
      const letterW = this.getLetterWidth(
        this.boardW,
        lineDataItem.sentence,
        wordsCount
      );
      const bgY = this.getBgLineStartY(lineNumber);
      let bgX = 0;

      lineDataItem.piecesData.forEach(piece => {
        const textWidth = letterW * piece.word.length;

        this.fillPiece(
          piece.elem,
          piece.word,
          textWidth,
          piece.index,
          wordsCount,
          bgX,
          bgY
        );
        bgX = this.getBgStartX(piece.index, bgX, textWidth);
      });

      this.updateLocksConnections();
    });
  }
}
