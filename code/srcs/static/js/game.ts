import { Ball } from './game/geometry.js';
import { PlayerAI, PlayerHuman } from './game/player.js';

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: PlayerHuman;
  private ai: PlayerAI;
  private ball: Ball;

  private playerScore = 0;
  private aiScore = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.player = new PlayerHuman("L", {height: this.canvas.height, width: this.canvas.width}, 6);
    this.ai = new PlayerAI("R", {height: this.canvas.height, width: this.canvas.width}, 3);

    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 8, 4, 3);

    this.loop();
  }

  private update() {
    // Mouvements joueur
    this.player.update();

    // IA simple
    this.ai.update(this.ball);

    // Balle
    this.ball.update(this.canvas.width, this.canvas.height);

    // Collisions
    if (this.ball.collidesWith(this.player.paddle) || this.ball.collidesWith(this.ai.paddle))
      this.ball.bounce();

    // Score
    if (this.ball.x < 0) {
      this.aiScore++;
      this.ball.reset(this.canvas.width, this.canvas.height);
    } else if (this.ball.x > this.canvas.width) {
      this.playerScore++;
      this.ball.reset(this.canvas.width, this.canvas.height);
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ball.draw(this.ctx);
    this.player.paddle.draw(this.ctx);
    this.ai.paddle.draw(this.ctx);

    this.ctx.font = '30px monospace';
    this.ctx.fillText(`${this.playerScore} - ${this.aiScore}`, this.canvas.width / 2 - 40, 50);
  }

  private loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
