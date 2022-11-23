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
  stateMessage = "";
  turn: StateEnum = StateEnum.BLACK;
  board: Piece[][] = [];

  /**
   * 初期化
   */
  ngOnInit(): void {
    for (let i = 0; i < 8; i++) {
      this.board[i] = [];
      for (let j = 0; j < 8; j++) {
        this.board[i][j] = new Piece(i, j);
      }
    }
    this.board[3][4].state = StateEnum.WHITE;
    this.board[4][3].state = StateEnum.WHITE;
    this.board[3][3].state = StateEnum.WHITE;
    this.board[4][4].state = StateEnum.BLACK;
  }

  /**
   * 石を置ける場所を選択された際のハンドラ
   * @param piece
   */
  select(piece: Piece): void {
    console.log(`Turn: ${this.turn}`);
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
      // 石を置ける場所がどこかにあるか確認しどこにもなければパスする
      if (this.canPutAll().length === 0) {
        console.log("石を置く場所がどこにもないのでパス", this.turn);
        this.changeTurn();
        if (this.canPutAll().length === 0) {
          console.log("石を置く場所がどこにもないのでゲーム終了", this.turn);
          this.turnMessage = MessageConst.GAME_OVER;
          this.countPieces();
        }
      }
    } else {
      console.log('can not put');
      this.stateMessage = MessageConst.CANNOT_PUT;
    }
  }

  private async selectByEnemy(): Promise<void> {
      if (this.turn === StateEnum.BLACK) {
        return;
      }

      await new Promise((r) => setTimeout(r, 500));

      // 石を置ける可能性がある箇所をリストアップする
      const candidates = this.canPutAll();
      // 置ける可能性のある個所からランダムで1つを選択する
      const floor = Math.floor(Math.random() * candidates.length);
      console.log(`length: ${candidates.length}, floor: ${floor}`);

      if (candidates.length === 0) {
        return;
      }

      const piece = candidates[floor];
      // 石を置く
      console.log("敵が石を置く");
      this.select(piece);
  }

  private countPieces(): void {
    let numBlack = 0;
    let numWhite = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const state = this.board[i][j].state;
        if (state === StateEnum.BLACK) {
          numBlack++;
        } else if (state === StateEnum.WHITE) {
          numWhite++;
        }
      }
    }
    let wonMessage: string;
    if (numWhite < numBlack) {
      wonMessage = "黒の勝ち。";
    } else if (numBlack < numWhite) {
      wonMessage = "白の勝ち。";
    } else {
      wonMessage = "同点。"
    }
    this.stateMessage = `黒${numBlack} - 白${numWhite}。${wonMessage}`;
  }

  /**
   * 石を置ける場所があるか判定する
   */
  private canPutAll(): Piece[] {
    console.log("canPutAll");
    const candidates: Piece[] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = new Piece(i, j);
        if (this.canPut(piece)) {
          candidates.push(piece);
        }
      }
    }
    return candidates;
  }

  /**
   * 黒と白の手番を変える
   */
  private changeTurn(): void {
    console.log("changeTurn");
    if (this.turn === StateEnum.BLACK) {
      this.turn = StateEnum.WHITE;
      this.turnMessage = MessageConst.WHITE_TURN;
    } else if (this.turn === StateEnum.WHITE) {
      this.turn = StateEnum.BLACK;
      this.turnMessage = MessageConst.BLACK_TURN;
    }
    console.log(`次は${this.turn}です`);

    // 相手が石を置く
    this.selectByEnemy();
  }

  /**
   * 石が置けるか判定する
   * @param piece
   * @returns
   */
  private canPut(piece: Piece): boolean {
    console.log("canPut");

    // すでに石がある場所には置けない
    if (this.board[piece.x][piece.y] && this.board[piece.x][piece.y].state !== StateEnum.NONE) {
      return false;
    }

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

  /**
   * 指定された方向で挟めるか判定する
   * @param piece
   * @param xDirection
   * @param yDirection
   * @returns
   */
  private canPutForDirection(piece: Piece, xDirection: number, yDirection: number): boolean {
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
      // 途中に意思がない場所があったら置けないと判断
      if (!this.board[beyondX][beyondY] || this.board[beyondX][beyondY].state === StateEnum.NONE) {
        return false;
      }
      // 延長線上に自分の意思がある場合は置けると判断
      if (this.board[beyondX][beyondY].state === this.turn) {
        return true;
      }
      time++;
      beyondX = piece.x + xDirection * time;
      beyondY = piece.y + yDirection * time;
    }

    return false;
  }

  /**
   * 挟んでいる石を裏返す
   * @param piece
   */
  private flipPiece(piece: Piece): void {
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

  /**
   * 特定の方向で挟んでいる石を裏返す
   * @param piece
   * @param xDirection
   * @param yDirection
   * @returns
   */
  private flipForDirection(piece: Piece, xDirection: number, yDirection: number): void {
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
  private insideBoard(x: number, y: number): boolean {
    if (x < 0 || 7 < x || y < 0 || 7 < y) {
      return false;
    }
    return true;
  }
}
