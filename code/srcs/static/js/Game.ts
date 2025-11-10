import { Ball } from './game/geometry.js';
import { Player, PlayerAI, PlayerHuman } from './game/player.js';
import { Field } from './game/field.js';

export type ConfigMatch = {mode : "PvP" | "PvIA" | "IAvP" | "IAvIA", name: [string, string]};

// modifier pong game 1 pour afficher les bonne info dans la page match 
// Pouvoir prendre en parametre le nom des joueur 
// Faire un mode human vs human

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private field: Field;
  private ball: Ball;

  private playerLeft: Player;
  private playerRight: Player;

  private animationId: number | null = null;
  private shouldStop: boolean = false;


  constructor(canvasId: string, config: ConfigMatch)
  {
    console.log("une nouvelle partie est fais.")
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    // 💡 On passe width et height au constructeur
    this.field = new Field(this.canvas);

    const dim = this.field.getDimensions();
    const vitesse_paddel = dim.height / 150.333;
    if (config.mode == "PvIA")
    {
      this.playerLeft = new PlayerHuman("L", dim, vitesse_paddel, config.name[0]);
      this.playerRight = new PlayerAI("R", dim, vitesse_paddel, config.name[1]);
    }else if (config.mode == "IAvP")
    {
      this.playerLeft = new PlayerAI("L", dim, vitesse_paddel, config.name[0]);
      this.playerRight = new PlayerHuman("R", dim, vitesse_paddel, config.name[1]);

    }else if (config.mode == "IAvIA")
    {
      this.playerLeft = new PlayerAI("L", dim, vitesse_paddel, config.name[0]);
      this.playerRight = new PlayerAI("R", dim, vitesse_paddel, config.name[1]);
    }
    else
    {
      this.playerLeft = new PlayerHuman("L", dim, vitesse_paddel, config.name[0]);
      this.playerRight = new PlayerHuman("R", dim, vitesse_paddel, config.name[1]);
    }
    this.ball = new Ball(dim);

    window.addEventListener("resize", () => this.handleResize());
    this.loop();
  }

  private handleResize() {
    const dim = this.field.getDimensions();
    this.playerLeft.onResize(dim);
    this.playerRight.onResize(dim);
    this.ball.resize(dim);

    const baseFontSize = dim.height / 14.8;
    this.ctx.font = `${baseFontSize}px Joystix Mono`;

  }

  private update() {
    if (this.playerLeft.typePlayer == "HUMAN")
      this.playerLeft.update();
    else
      this.playerLeft.update(this.ball);

    if (this.playerRight.typePlayer == "HUMAN")
      this.playerRight.update();
    else
      this.playerRight.update(this.ball);

    this.ball.update(this.field.width, this.field.height);

    if (this.ball.collidesWith(this.playerLeft.paddle) || this.ball.collidesWith(this.playerRight.paddle))
      this.ball.bounce();

    if (this.ball.x < 0) {
      this.playerRight.add_score();
      this.ball.reset(this.field.width, this.field.height);
    } else if (this.ball.x > this.field.width) {
      this.playerLeft.add_score();
      this.ball.reset(this.field.width, this.field.height);
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.field.width, this.field.height);
    this.field.draw(this.ctx);
    this.ball.draw(this.ctx);
    this.playerLeft.paddle.draw(this.ctx);
    this.playerRight.paddle.draw(this.ctx);

    const baseFontSize = this.field.height / 14.8;
    this.ctx.font = `${baseFontSize}px Joystix Mono`;
    this.ctx.fillStyle = 'rgb(0,255,76)'; // couleur du texte
    this.ctx.textAlign = 'center';        // centrage horizontal
    this.ctx.textBaseline = 'top';        // aligne le haut du texte
    this.ctx.fillText(`${this.playerLeft.get_score()} - ${this.playerRight.get_score()}`, this.field.width / 2, 30);
  }

  private loop() {
    const activePage = document.querySelector('.active') as HTMLElement | null;
    let whyStop:string | undefined = undefined ;

    this.update();
    this.draw();

    if (this.playerLeft.get_score() >= 3 || this.playerRight.get_score() >= 3)
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

      const winnerNameEl = resultPage.querySelector<HTMLParagraphElement>('#winner-name');
      const player1NameEl = resultPage.querySelector<HTMLSpanElement>('#player1-name');
      const player1ScoreEl = resultPage.querySelector<HTMLSpanElement>('#player1-score');
      const player2NameEl = resultPage.querySelector<HTMLSpanElement>('#player2-name');
      const player2ScoreEl = resultPage.querySelector<HTMLSpanElement>('#player2-score');

      const winnerName = this.playerLeft.get_score() > this.playerRight.get_score() ? this.playerLeft.name : this.playerRight.name;

      if (winnerNameEl) winnerNameEl.textContent = winnerName;
      if (player1NameEl) player1NameEl.textContent = this.playerLeft.name;
      if (player1ScoreEl) player1ScoreEl.textContent = this.playerLeft.get_score().toString();
      if (player2NameEl) player2NameEl.textContent = this.playerRight.name;
      if (player2ScoreEl) player2ScoreEl.textContent = this.playerRight.get_score().toString();
    }
  }

  public getWinnerAndLooser(): null | {"Winner": Player, "Looser": Player}
  {
    if (this.shouldStop == false) return (console.log("Le match nest pas fini on ne peut pas avoir de Vainquer ou Perdant"), null);
    return this.playerLeft.get_score() > this.playerRight.get_score() ? 
    {"Winner" : this.playerLeft, "Looser": this.playerRight} : 
    {"Winner" : this.playerRight, "Looser": this.playerLeft};

  }
}
