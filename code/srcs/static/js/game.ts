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
  private animationId: number | null = null;
  private shouldStop: boolean = false;

  private playerScore = 0;
  private aiScore = 0;

  constructor(canvasId: string) {
    console.log("une nouvelle partie est fais.")
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    // 💡 On passe width et height au constructeur
    this.field = new Field(this.canvas);

    const dim = this.field.getDimensions();
    this.player = new PlayerHuman("L", dim, 10);
    this.ai = new PlayerAI("R", dim, 5);
    this.ball = new Ball(dim);

    window.addEventListener("resize", () => this.handleResize());
    this.loop();
  }

  private handleResize() {
    const dim = this.field.getDimensions();
    this.player.onResize(dim);
    this.ai.onResize(dim);
    this.ball.resize(dim);

    const baseFontSize = dim.height / 14.8;
    this.ctx.font = `${baseFontSize}px Joystix Mono`;

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

    const baseFontSize = this.field.height / 14.8;
    this.ctx.font = `${baseFontSize}px Joystix Mono`;
    this.ctx.fillStyle = 'rgb(0,255,76)'; // couleur du texte
    this.ctx.textAlign = 'center';        // centrage horizontal
    this.ctx.textBaseline = 'top';        // aligne le haut du texte
    this.ctx.fillText(`${this.playerScore} - ${this.aiScore}`, this.field.width / 2, 30);
  }

  private loop() {
    const activePage = document.querySelector('.active') as HTMLElement | null;
    let whyStop:string | undefined = undefined ;

    this.update();
    this.draw();
    // Vérifie si le jeu est terminé (ex: premier à 3 points)
    if (this.playerScore >= 3 || this.aiScore >= 3)
    {
      this.goToResult();
      whyStop = "Le match c'est fini normalement.";
    }

    if (activePage?.id != "pagesMatch")
      this.stop(whyStop);

    if (this.shouldStop)
      return;
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  public stop(whyStop: string = "On a quitté la page match") {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    alert(`Le match est arrêté car : ${whyStop}`);// ici
    this.shouldStop = true;
    console.log(`une partie est s'arrete. : ${whyStop}`)// ici

  }

  private goToResult() {
    const matchPage = document.getElementById("pagesMatch");
    const resultPage = document.getElementById("pagesResult");

    if (matchPage) {
      matchPage.classList.remove("active");
      matchPage.classList.add("hidden");
    }

    if (resultPage) {
      resultPage.classList.remove("hidden");
      resultPage.classList.add("active");

      // 💡 Injection des infos du match dans la page résultat
      const winnerNameEl = resultPage.querySelector<HTMLParagraphElement>('#winner-name');
      const player1NameEl = resultPage.querySelector<HTMLSpanElement>('#player1-name');
      const player1ScoreEl = resultPage.querySelector<HTMLSpanElement>('#player1-score');
      const player2NameEl = resultPage.querySelector<HTMLSpanElement>('#player2-name');
      const player2ScoreEl = resultPage.querySelector<HTMLSpanElement>('#player2-score');

      const winnerName = this.playerScore > this.aiScore ? this.player.name : this.ai.name;

      if (winnerNameEl) winnerNameEl.textContent = winnerName;
      if (player1NameEl) player1NameEl.textContent = this.player.name;
      if (player1ScoreEl) player1ScoreEl.textContent = this.playerScore.toString();
      if (player2NameEl) player2NameEl.textContent = this.ai.name;
      if (player2ScoreEl) player2ScoreEl.textContent = this.aiScore.toString();
    }
  }
}
