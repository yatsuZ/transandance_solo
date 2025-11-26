import { Ball, Paddle, Point } from "./geometry.js";
import { InputHandler } from "./input.js";
import { PADDLE_SPEED, PADDLE_OFFSET, AI_ERROR_MARGIN_MIN, AI_ERROR_RANGE_DIVISOR, AI_ERROR_MULTIPLIER } from "../game-config.js";

export type PlayerSide = "L" | "R";
type PlayerType = "IA" | "HUMAN" | "UNDEFINED";

export abstract class Player {
  public readonly side: PlayerSide;
  public readonly paddle: Paddle;
  public readonly name: string;
  public typePlayer : PlayerType = "UNDEFINED";
  public score: number = 0;

  protected playerCard: HTMLElement;

  // Éléments DOM récupérés une seule fois pour optimisation
  protected nameElement: HTMLElement | null = null;
  protected typeElement: HTMLElement | null = null;
  protected avatarElement: HTMLImageElement | null = null;
  protected scoreElement: HTMLElement | null = null;
  protected movementElement: HTMLElement | null = null;

  constructor(side: PlayerSide, playerCards:{playerCardL: HTMLElement,playerCardR: HTMLElement}, canvasDimension: {height: number, width: number}, speed: number, name: string)
  {
    this.side = side;
    this.name = name ?? (side === "L" ? "Player 1" : "Player 2");

    this.paddle = new Paddle(side, canvasDimension, speed, PADDLE_OFFSET);

    // Sélection de la carte du joueur
    if (side == "L")
      this.playerCard = playerCards.playerCardL;
    else
      this.playerCard = playerCards.playerCardR;

    // Récupération des sous-éléments DOM UNE SEULE FOIS
    this.initDOMElements();
  }

  /**
   * Initialise tous les éléments DOM nécessaires une seule fois
   * @private
   */
  private initDOMElements(): void {
    if (!this.playerCard) {
      console.error('[Player] Carte du joueur introuvable');
      return;
    }

    this.nameElement = this.playerCard.querySelector('.player-name');
    this.typeElement = this.playerCard.querySelector('.player-type');
    this.avatarElement = this.playerCard.querySelector('.player-avatar');
    this.scoreElement = this.playerCard.querySelector('.player-score')?.querySelector('span') ?? null;
    this.movementElement = this.playerCard.querySelector('.player-controls')?.querySelector('span') ?? null;

    // Vérification que tous les éléments critiques sont présents
    if (!this.nameElement || !this.typeElement || !this.avatarElement || !this.scoreElement) {
      console.error('[Player] Impossible de trouver tous les éléments nécessaires dans la carte du joueur');
    }
  }

  onResize(newDimensions: { width: number; height: number }) {
    this.paddle.resize(newDimensions);
  }

  abstract update(...args: any[]): void;

  /**
   * Met à jour les informations de la carte du joueur dans l'interface
   * Utilise les éléments DOM déjà récupérés (pas de querySelector)
   */
  public add_to_update(): void {
    if (!this.nameElement || !this.typeElement || !this.avatarElement || !this.scoreElement) {
      console.error('[Player] Éléments DOM non initialisés pour la mise à jour');
      return;
    }

    // Mettre à jour le texte
    this.nameElement.textContent = this.name;
    this.typeElement.textContent = this.typePlayer;
    this.scoreElement.textContent = "0";

    // Mettre à jour la photo de profil
    this.avatarElement.src = this.typePlayer === "HUMAN"
      ? "/static/util/icon/profile.png"
      : "/static/util/icon/profile_robot.png";
  }

  /**
   * Incrémente le score du joueur et met à jour l'affichage
   * OPTIMISÉ : Utilise l'élément DOM déjà récupéré (pas de querySelector)
   */
  public add_score(): void {
    this.score++;

    if (!this.scoreElement) {
      console.error('[Player] Élément score non initialisé');
      return;
    }

    this.scoreElement.textContent = this.score.toString();
  }

  public get_score(){
    return this.score;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class PlayerHuman extends Player {
  private input: InputHandler;

  constructor(side: "L" | "R", playerCards:{playerCardL: HTMLElement,playerCardR: HTMLElement}, canvasDimension: {height: number, width: number}, speed: number, name: string)
  {
    super(side, playerCards, canvasDimension, speed, name);
    this.typePlayer = "HUMAN";
    this.input = new InputHandler(side);
    this.add_to_update();

    // Mise à jour des touches de contrôle (utilise l'élément déjà récupéré)
    if (this.movementElement) {
      const upAndDownKey = this.input.getDisplayKeys();
      this.movementElement.textContent = `${upAndDownKey.up} / ${upAndDownKey.down}`;
    } else {
      console.error('[PlayerHuman] Élément de contrôle introuvable');
    }
  }

  update() {
    if (this.input.upPressed) this.paddle.moveUp();
    if (this.input.downPressed) this.paddle.moveDown();
  }

  /**
   * Nettoie les event listeners clavier
   */
  public cleanup(): void {
    this.input.cleanup();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class PlayerAI extends Player {
  constructor(side: "L" | "R", playerCards:{playerCardL: HTMLElement,playerCardR: HTMLElement}, canvasDimension: {height: number, width: number}, speed: number, name: string)
  {
    super(side, playerCards, canvasDimension, speed, name);
    this.typePlayer = "IA";
    this.add_to_update();

    // Mise à jour du texte de contrôle pour l'IA (utilise l'élément déjà récupéré)
    if (this.movementElement) {
      this.movementElement.textContent = `Parkinson`;
    } else {
      console.error('[PlayerAI] Élément de contrôle introuvable');
    }
  }

  update(ball: Ball) {
    const center = this.paddle.position.y + this.paddle.height / 2;

    const errorMargin = Math.random() * (this.paddle.height - this.paddle.height / AI_ERROR_RANGE_DIVISOR) * AI_ERROR_MULTIPLIER;

    if (center < ball.y - AI_ERROR_MARGIN_MIN + errorMargin) {
        this.paddle.position.y += this.paddle.getSpeed();
    } else if (center > ball.y + AI_ERROR_MARGIN_MIN + errorMargin) {
        this.paddle.position.y -= this.paddle.getSpeed();
    }
  }
}
