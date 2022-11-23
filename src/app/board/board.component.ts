import { Component, OnInit } from '@angular/core';

import { Piece } from '../piece';
import { MessageConst, StateEnum } from '../stateenum';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  turnMessage: string = MessageConst.BLACK_TURN;
  stateMessage: string = "";

  turn: StateEnum = StateEnum.BLACK;

  board: Piece[][] = [];

  ngOnInit(): void {
    for (let i = 0; i < 8; i++) {
      this.board[i] = [];
      for (let j = 0; j < 8; j++) {
        this.board[i][j] = new Piece(i, j);
      }
    }
    this.board[3][4].state = StateEnum.WHITE;
    this.board[4][3].state = StateEnum.WHITE;
    this.board[3][3].state = StateEnum.BLACK;
    this.board[4][4].state = StateEnum.BLACK;
  }

  select(piece: Piece): void {
    console.log(`BoardComponent (x, y)=(${piece.x}, ${piece.y})`);

    if (this.canPut(piece)) {
      console.log('canPut');
      this.stateMessage = ""
      // 新しく石を置く
      piece.state = this.turn;
      this.board[piece.x][piece.y] = piece;
      // 挟んでいる石を裏返す
      this.flipPiece(piece);
      // 黒と白の交代
      this.changeTurn();
    } else {
      console.log('can not put');
      this.stateMessage = MessageConst.CANNOT_PUT;
    }

  }

  changeTurn(): void {
    if (this.turn === StateEnum.BLACK) {
      this.turn = StateEnum.WHITE;
      this.turnMessage = MessageConst.WHITE_TURN;
    } else if (this.turn === StateEnum.WHITE) {
      this.turn = StateEnum.BLACK;
      this.turnMessage = MessageConst.BLACK_TURN;
    }
  }

  canPut(piece: Piece): boolean {
    // 置こうとしている場所の周囲8方向を探索
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // 置こうとしている場所はスキップ
        if (i === 0 && j === 0) {
          continue;
        }
        // 1方向でも置ける場所があればその場所にはおいてよい
        const result = this.canPutForDirection(piece, i, j);
        if (result) {
          return true;
        }
      }
    }
    return false;
  }

  canPutForDirection(piece: Piece, xDirection: number, yDirection: number): boolean {
    // 隣りの石の座標
    const nextX = piece.x + xDirection;
    const nextY = piece.y + yDirection;

    // 隣りが盤面に収まっていなかったら置けないと判断
    if (!this.insideBoard(nextX, nextY)) {
      return false;
    }

    // 隣りの石が同じ色もしくはまだ石がない場合は置けないと判断
    const nextPiece = this.board[piece.x + xDirection][piece.y + yDirection];
    if (this.turn ===  nextPiece.state || nextPiece.state === StateEnum.NONE) {
      return false;
    }

    // 与えられた方向に延長していって自分の色の石があった場合は置けると判断
    let time = 2;
    let beyondX = piece.x + xDirection * time;
    let beyondY = piece.y + yDirection * time;
    while(this.insideBoard(beyondX, beyondY)) {
      if (this.board[beyondX][beyondY].state === this.turn) {
        return true;
      }
      time++;
      beyondX = piece.x + xDirection * time;
      beyondY = piece.y + yDirection * time;
    }

    return false;
  }

  flipPiece(piece: Piece): void {
    // 置こうとしている場所の周囲8方向を探索
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // 置こうとしている場所はスキップ
        if (i === 0 && j === 0) {
          continue;
        }
        // 1方向でも置ける場所があればその場所にはおいてよい
        this.flipForDirection(piece, i, j);
      }
    }
  }

  flipForDirection(piece: Piece, xDirection: number, yDirection: number): void {
    const canPut = this.canPutForDirection(piece, xDirection, yDirection);
    if (!canPut) {
      return;
    }

    let time = 1;
    let beyondX = piece.x + xDirection * time;
    let beyondY = piece.y + yDirection * time;
    while(this.insideBoard(beyondX, beyondY)) {
      const beyondPiece = this.board[beyondX][beyondY];
      // 挟める部分を超えたら停止
      if (this.turn === beyondPiece.state) {
        break;
      }
      // 挟める部分の中ですでに石がおいてあれば色を変える
      if (beyondPiece.state === StateEnum.BLACK || beyondPiece.state === StateEnum.WHITE) {
        beyondPiece.state = this.turn;
      }
      time++;
      beyondX = piece.x + xDirection * time;
      beyondY = piece.y + yDirection * time;
    }
  }

  /**
   * 盤面に収まっているか判定
   * @param x
   * @param y
   * @returns
   */
  insideBoard(x: number, y: number): boolean {
    if (x < 0 || 7 < x || y < 0 || 7 < y) {
      return false;
    }
    return true;
  }
}
