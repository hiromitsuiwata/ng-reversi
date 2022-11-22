import { StateEnum } from "./stateenum";

export class Piece {
  x: number;
  y: number;
  state: StateEnum;

  constructor(x: number, y: number) {
    this.state = StateEnum.NONE;
    this.x = x;
    this.y = y;
  }
}
