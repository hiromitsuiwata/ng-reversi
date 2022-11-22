import { Component, OnInit } from '@angular/core';

import { Piece } from '../Piece';
import { StateEnum } from '../stateenum';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

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

}
