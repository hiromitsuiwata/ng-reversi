import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Piece } from '../piece';
import { StateEnum } from '../stateenum';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent {

  @Input()
  x: number;

  @Input()
  y: number;

  @Input()
  state: StateEnum;

  @Output()
  selectEvent = new EventEmitter<Piece>();

  constructor() {
    this.x = 0;
    this.y = 0;
    this.state = StateEnum.NONE;
  }

  getX() {
    return `${this.x * 40}px`;
  }

  getY() {
    return `${this.y * 40}px`;
  }

  getColor() {
    if (this.state === StateEnum.BLACK) {
      return "#000";
    } else if (this.state === StateEnum.WHITE) {
      return "#FFF";
    } else {
      return "transparent";
    }
  }

  select(): void {
    this.selectEvent.emit(this);
  }
}
