import { Ball, Paddle, Point } from "./geometry.js";
import { InputHandler } from "./input.js";

export type PlayerSide = "L" | "R";

export abstract class Player {
  public readonly side: PlayerSide;
  public readonly paddle: Paddle;
  public readonly name: string;
  public score: number = 0;

  constructor(side: PlayerSide, canvasDimension: {height: number, width: number}, speed: number, name?: string)
  {
    this.side = side;
    this.name = name ?? (side === "L" ? "Player 1" : "Player 2");

    this.paddle = new Paddle(side, canvasDimension, speed, 20);
  }

  onResize(newDimensions: { width: number; height: number }) {
    this.paddle.resize(newDimensions);
  }

  abstract update(...args: any[]): void; // méthode abstraite (différente pour IA/Humain)
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class PlayerHuman extends Player {
  private input: InputHandler;

  constructor(side: "L" | "R", canvasDimension: {height: number, width: number}, speed: number, name?: string)
  {
    super(side, canvasDimension, speed, name);
    this.input = new InputHandler();
  }

  update() {
    if (this.input.upPressed) this.paddle.moveUp();
    if (this.input.downPressed) this.paddle.moveDown();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class PlayerAI extends Player {
  constructor(side: "L" | "R", canvasDimension: {height: number, width: number}, speed: number, name?: string)
  {
    super(side, canvasDimension, speed, name);
  }

  update(ball: Ball) {
    const center = this.paddle.position.y + this.paddle.height / 2;

    const errorMargin = Math.random() * (this.paddle.height - this.paddle.height / 3 ) * 3; 

    if (center < ball.y - 20 + errorMargin) {
        this.paddle.position.y += this.paddle.getSpeed();
    } else if (center > ball.y + 20 + errorMargin) {
        this.paddle.position.y -= this.paddle.getSpeed();
    }
  }
}
