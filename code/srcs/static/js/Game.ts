import { Ball } from './game/geometry.js';
import { Player, PlayerAI, PlayerHuman } from './game/player.js';
import { Field } from './game/field.js';
import { log, updateUrl } from './utils.js';
import { activeAnotherPage } from './spa_redirection.js';
import { SiteManagement } from './SiteManagement.js';
import { DOMElements } from './dom_gestion.js';

export type ConfigMatch = {mode : "PvP" | "PvIA" | "IAvP" | "IAvIA", name: [string, string]};


// modifier pong game 1 pour afficher les bonne info dans la page match 
// Pouvoir prendre en parametre le nom des joueur 
// Faire un mode human vs human

export class PongGame {
  // -------------------------
  // Propriétés
  // -------------------------
  private _DO: DOMElements;
  private field: Field;
  private ball: Ball;
  private playerLeft: Player;
  private playerRight: Player;
  private animationId: number | null = null;
  private shouldStop: boolean = false;
  private inTournament: boolean;

  // -------------------------
  // Constructeur
  // -------------------------
  constructor(DO_of_SiteManagement: DOMElements, config: ConfigMatch, inTournament: boolean = false) {
    this.inTournament = inTournament;
    console.log("Une nouvelle partie est créée.");

    this._DO = DO_of_SiteManagement;

    // Initialisation du terrain et des joueurs
    this.field = new Field(this._DO.canva);
    const dim = this.field.getDimensions();
    const vitessePaddle = dim.height / 150.333;

    switch (config.mode) {
      case "PvIA":
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, vitessePaddle, config.name[0]);
        this.playerRight = new PlayerAI("R", this._DO.matchElement, dim, vitessePaddle, config.name[1]);
        break;
      case "IAvP":
        this.playerLeft = new PlayerAI("L", this._DO.matchElement, dim, vitessePaddle, config.name[0]);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, vitessePaddle, config.name[1]);
        break;
      case "IAvIA":
        this.playerLeft = new PlayerAI("L", this._DO.matchElement, dim, vitessePaddle, config.name[0]);
        this.playerRight = new PlayerAI("R", this._DO.matchElement, dim, vitessePaddle, config.name[1]);
        break;
      default: // PvP
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, vitessePaddle, config.name[0]);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, vitessePaddle, config.name[1]);
    }

    // Initialisation de la balle
    this.ball = new Ball(dim);

    // Gestion du resize
    window.addEventListener("resize", this.resizeHandler);

    // Démarrage de la boucle
    this.loop();
  }

  // -------------------------
  // Gestion du resize
  // -------------------------
  private resizeHandler = () => this.handleResize();

  private handleResize() {
    const dim = this.field.getDimensions();
    this.playerLeft.onResize(dim);
    this.playerRight.onResize(dim);
    this.ball.resize(dim);

    const baseFontSize = dim.height / 14.8;
    this._DO.ctx.font = `${baseFontSize}px Joystix Mono`;
  }

  // -------------------------
  // Update & Draw
  // -------------------------
  private update() {
    if (this.playerLeft.typePlayer === "HUMAN") this.playerLeft.update();
    else this.playerLeft.update(this.ball);

    if (this.playerRight.typePlayer === "HUMAN") this.playerRight.update();
    else this.playerRight.update(this.ball);

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
    const ctx = this._DO.ctx;
    ctx.clearRect(0, 0, this.field.width, this.field.height);

    this.field.draw(ctx);
    this.ball.draw(ctx);
    this.playerLeft.paddle.draw(ctx);
    this.playerRight.paddle.draw(ctx);

    const baseFontSize = this.field.height / 14.8;
    ctx.font = `${baseFontSize}px Joystix Mono`;
    ctx.fillStyle = 'rgb(0,255,76)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.playerLeft.get_score()} - ${this.playerRight.get_score()}`, this.field.width / 2, 30);
  }

  // -------------------------
  // Boucle principale
  // -------------------------
  private loop() {
    this.update();
    this.draw();

    // Vérifier si le match est terminé (3 points)
    if (this.playerLeft.get_score() >= 3 || this.playerRight.get_score() >= 3) {
      this.goToResult();
      this.stop("Le match est terminé normalement.");
    }

    // Continuer la boucle si le jeu n'est pas arrêté
    if (!this.shouldStop) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  }

  // -------------------------
  // Stop & résultat
  // -------------------------
  public stop(whyStop: string = "On a quitté la page match") {
    // Annuler l'animation frame
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Nettoyer l'event listener resize
    window.removeEventListener("resize", this.resizeHandler);

    // Nettoyer les input handlers des joueurs humains
    if (this.playerLeft.typePlayer === "HUMAN")
      (this.playerLeft as PlayerHuman).cleanup();
    if (this.playerRight.typePlayer === "HUMAN")
      (this.playerRight as PlayerHuman).cleanup();

    // Clear le canvas
    const { canva, ctx } = this._DO;
    ctx.clearRect(0, 0, canva.width, canva.height);

    // Logger l'arrêt
    console.log(`✅ Match arrêté : ${whyStop}`);
    this.shouldStop = true;
  }

  private goToResult() {
    const resultPage = this._DO.pages.result;
    activeAnotherPage(resultPage);
    updateUrl(resultPage, this.inTournament ? '/tournament/match' : '/match');

    const winnerName = this.playerLeft.get_score() > this.playerRight.get_score() ? this.playerLeft.name : this.playerRight.name;
    const { winnerNameEl, player1NameEl, player1ScoreEl, player2NameEl, player2ScoreEl } = this._DO.resultElement;

    if (winnerNameEl) winnerNameEl.textContent = winnerName;
    if (player1NameEl) player1NameEl.textContent = this.playerLeft.name;
    if (player1ScoreEl) player1ScoreEl.textContent = this.playerLeft.get_score().toString();
    if (player2NameEl) player2NameEl.textContent = this.playerRight.name;
    if (player2ScoreEl) player2ScoreEl.textContent = this.playerRight.get_score().toString();
  }

  // -------------------------
  // Utilitaire
  // -------------------------
  public getWinnerAndLooser(): { Winner: Player; Looser: Player } | null {
    if (!this.shouldStop) {
      console.log("Le match n'est pas fini, pas de vainqueur ou perdant.");
      return null;
    }
    return this.playerLeft.get_score() > this.playerRight.get_score()
      ? { Winner: this.playerLeft, Looser: this.playerRight }
      : { Winner: this.playerRight, Looser: this.playerLeft };
  }
}