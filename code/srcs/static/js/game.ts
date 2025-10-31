import { Ball } from './game/geometry.js';
import { PlayerAI, PlayerHuman } from './game/player.js';
import { Field } from './game/field.js';

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private field: Field;
  private player: PlayerHuman;
  private ai: PlayerAI;
  private ball: Ball;

  private playerScore = 0;
  private aiScore = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    // 💡 On passe width et height au constructeur
    this.field = new Field(this.canvas);

    const dim = this.field.getDimensions();
    this.player = new PlayerHuman("L", dim, 6);
    this.ai = new PlayerAI("R", dim, 3);
    this.ball = new Ball(dim.width / 2, dim.height / 2, 8, 4, 3);

    window.addEventListener("resize", () => this.handleResize());
    this.loop();
  }

  private handleResize() {
    const dim = this.field.getDimensions();
    this.player.onResize(dim);
    this.ai.onResize(dim);
    this.ball.reset(dim.width, dim.height);
  }

  private update() {
    this.player.update();
    this.ai.update(this.ball);
    this.ball.update(this.field.width, this.field.height);

    if (this.ball.collidesWith(this.player.paddle) || this.ball.collidesWith(this.ai.paddle))
      this.ball.bounce();

    if (this.ball.x < 0) {
      this.aiScore++;
      this.ball.reset(this.field.width, this.field.height);
    } else if (this.ball.x > this.field.width) {
      this.playerScore++;
      this.ball.reset(this.field.width, this.field.height);
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.field.width, this.field.height);
    this.field.draw(this.ctx);
    this.ball.draw(this.ctx);
    this.player.paddle.draw(this.ctx);
    this.ai.paddle.draw(this.ctx);

    this.ctx.font = '30px monospace';
    this.ctx.fillText(`${this.playerScore} - ${this.aiScore}`, this.field.width / 2 - 40, 50);
  }

  private loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
