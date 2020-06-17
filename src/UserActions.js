import { Consts } from "./Consts.js";

export default class UserActions {
  constructor(playground, board, line, respawn, piecesManager) {
    this.playground = playground;
    this.board = board;
    this.activeLine = line;
    this.respawn = respawn;
    this.pieceMovedEvent = new Event("pieceMoved");

    this.isDragging = false;
    this.draggedEl = null;
    this.pieceOnRight = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragLength = 0;
    this.piecesManager = piecesManager;

    this.setHandlers();
  }

  resetPiecePosition(piece) {
    const style = piece.style;

    style.left = "0px";
    style.top = "0px";
    style.marginLeft = "0px";
  }

  resetLinePiecesMargin() {
    _.forEach(this.activeLine.children, piece => {
      piece.style.marginLeft = "0px";
    });
  }

  isMouseOver(elem, event) {
    return (
      event.pageY > elem.offsetTop &&
      event.pageY < elem.offsetTop + elem.offsetHeight &&
      event.pageX > elem.offsetLeft &&
      event.pageX < elem.offsetLeft + elem.offsetWidth
    );
  }

  getPieceMouseOverOrLefter(event) {
    return _.find(this.activeLine.children, piece => {
      return (
        event.pageY > piece.offsetTop &&
        event.pageY < piece.offsetTop + piece.offsetHeight &&
        event.pageX < piece.offsetLeft + piece.offsetWidth
      );
    });
  }

  freeSpaceForDragged(event) {
    const pieceOnRight = this.getPieceMouseOverOrLefter(event);

    if (pieceOnRight == this.pieceOnRight) return;

    this.pieceOnRight = pieceOnRight;
    this.resetLinePiecesMargin();

    if (pieceOnRight)
      pieceOnRight.style.marginLeft = `${this.draggedEl.offsetWidth}px`;
  }

  moveTo(newParentEl, piece) {
    this.resetPiecePosition(piece);

    newParentEl.append(piece);
    this.piecesManager.updateLocksConnections();

    if (newParentEl === this.activeLine)
      document.body.dispatchEvent(this.pieceMovedEvent);
  }

  insertDraggedBefore(piece) {
    piece.before(this.draggedEl);
    this.piecesManager.updateLocksConnections();
  }

  setLine(line) {
    this.activeLine = line;
  }

  dragPiece(event) {
    const top = event.y - this.dragStartY;
    const left = event.x - this.dragStartX;

    this.draggedEl.style.top = `${top}px`;
    this.draggedEl.style.left = `${left}px`;

    this.freeSpaceForDragged(event);

    if (this.isMouseOver(this.activeLine, event)) {
      this.activeLine.classList.add("board--line-hover");
    } else if (this.isMouseOver(this.respawn, event)) {
      this.respawn.classList.add("respawn-active");
    } else {
      this.activeLine.classList.remove("board--line-hover");
      this.respawn.classList.remove("respawn-active");
    }
  }

  dropPiece(event) {
    this.resetPiecePosition(this.draggedEl);
    this.resetLinePiecesMargin();

    const pieceOnRight = this.getPieceMouseOverOrLefter(event);

    if (pieceOnRight) this.insertDraggedBefore(pieceOnRight);
    else if (this.isMouseOver(this.activeLine, event))
      this.moveTo(this.activeLine, this.draggedEl);
    else if (this.isMouseOver(this.respawn, event))
      this.moveTo(this.respawn, this.draggedEl);

    this.activeLine.classList.remove("board--line-hover");
    this.respawn.classList.remove("respawn-active");
    this.draggedEl.classList.remove("piece-active");

    this.draggedEl = null;
    this.pieceOnRight = null;
    this.isDragging = false;
  }

  mouseDownOnPiece(event) {
    if (!event.target.classList.contains(Consts.CLASS_NAME)) return;
    if (
      !event.target.parentElement.classList.contains("board--line-active") &&
      !event.target.parentElement.classList.contains("respawn")
    )
      return;

    this.draggedEl = event.target;
    this.dragStartX = event.x - event.target.offsetLeft;
    this.dragStartY = event.y - event.target.offsetTop;
    this.dragLength = 0;
  }

  mouseMovePiece(event) {
    if (!this.draggedEl) return;

    if (!this.isDragging) {
      this.dragLength += Math.sqrt(event.movementX ** 2 + event.movementY ** 2);

      if (this.dragLength > Consts.DRAG_ERROR) this.setDraggingModeOn();
      else return;
    }

    this.dragPiece(event);
  }

  mouseUpOnPiece(event) {
    if (!this.draggedEl) return;

    if (this.isDragging) return this.dropPiece(event);

    if (this.draggedEl.parentElement === this.activeLine) {
      this.moveTo(this.respawn, this.draggedEl);
    } else {
      this.moveTo(this.activeLine, this.draggedEl);
    }

    this.draggedEl = false;
  }

  mouseLeaveHandler(event) {
    if (!this.draggedEl) return;

    this.dropPiece(event);
  }

  setDraggingModeOn() {
    this.isDragging = true;
    this.moveTo(this.respawn, this.draggedEl);
    this.draggedEl.classList.add("piece-active");
  }

  setHandlers() {
    this.playground.addEventListener("mousedown", e =>
      this.mouseDownOnPiece(e)
    );
    document.body.addEventListener("mousemove", e => this.mouseMovePiece(e));
    document.body.addEventListener("mouseup", e => this.mouseUpOnPiece(e));
    document.body.addEventListener("mouseleave", e =>
      this.mouseLeaveHandler(e)
    );
  }
}
