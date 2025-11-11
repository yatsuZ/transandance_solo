import { Ball, Paddle, Point } from "./geometry.js";
import { InputHandler } from "./input.js";

export type PlayerSide = "L" | "R";
type PlayerType = "IA" | "HUMAN" | "UNDEFINED";

export abstract class Player {
  public readonly side: PlayerSide;
  public readonly paddle: Paddle;
  public readonly name: string;
  public typePlayer : PlayerType = "UNDEFINED";
  public score: number = 0;
  protected playerCard: HTMLElement | null = null;

  constructor(side: PlayerSide, canvasDimension: {height: number, width: number}, speed: number, name: string)
  {
    this.side = side;
    this.name = name ?? (side === "L" ? "Player 1" : "Player 2");

    this.paddle = new Paddle(side, canvasDimension, speed, 20);
    const idBalise : string = (this.side == "L" ? 'player-Left-Card-Match': 'player-Right-Card-Match')
    this.playerCard = document.getElementById(idBalise);
    if (this.playerCard === null) {
      console.error(`Pas reussi a recuperer ${idBalise}`);
      this.playerCard as null;
    }
    else this.playerCard as HTMLElement

  }

  onResize(newDimensions: { width: number; height: number }) {
    this.paddle.resize(newDimensions);
  }

  abstract update(...args: any[]): void;

  // cree une methode qui mets a joure les information de la page match
  public add_to_update()
  {
    if (this.playerCard == null) return;
    // Récupérer les sous-éléments
    const nameElement = this.playerCard.querySelector('.player-name') as HTMLElement | null;
    const typeElement = this.playerCard.querySelector('.player-type') as HTMLElement | null;
    const avatarElement = this.playerCard.querySelector('.player-avatar') as HTMLImageElement | null;
    const scoreElement = this.playerCard.querySelector('.player-score')?.querySelector('span') as HTMLElement | null;

    if (!nameElement || !typeElement || !avatarElement || !scoreElement)
      return console.error('Impossible de trouver tous les éléments nécessaires dans la carte du joueur');

    // Mettre à jour le texte
    nameElement.textContent = this.name;
    typeElement.textContent = this.typePlayer;
    scoreElement.textContent = "0";

    // Mettre à jour la photo de profil
    if (avatarElement) {
      avatarElement.src = this.typePlayer === "HUMAN" 
        ? "./static/util/icon/profile.png" 
        : "./static/util/icon/profile_robot.png";
    }
  }

  public add_score()
  {
    this.score++;
    if (this.playerCard === null) return;

    const scoreElement = this.playerCard.querySelector('.player-score')?.querySelector('span') as HTMLElement | null;
    if (!scoreElement)
      return console.error(`Impossible de trouver l'éléments nécessaires dans la carte du joueur pour update le score.`);
    scoreElement.textContent = this.score.toString();
  }

  public get_score(){
    return this.score;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class PlayerHuman extends Player {
  private input: InputHandler;

  constructor(side: "L" | "R", canvasDimension: {height: number, width: number}, speed: number, name: string)
  {
    super(side, canvasDimension, speed, name);
    this.typePlayer = "HUMAN";
    this.input = new InputHandler(side);
    this.add_to_update()

    const movementElement = this.playerCard?.querySelector('.player-controls')?.querySelector('span') as HTMLImageElement | null;
    if (!movementElement)
      console.error(`Impossible de trouver l'éléments nécessaires dans la carte du joueur pour update le score.`);
    else
    {
      const upAndDownKey = this.input.getDisplayKeys();
      movementElement.textContent = `${upAndDownKey.up} / ${upAndDownKey.down}`;
    }
  }

  update() {
    if (this.input.upPressed) this.paddle.moveUp();
    if (this.input.downPressed) this.paddle.moveDown();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class PlayerAI extends Player {
  constructor(side: "L" | "R", canvasDimension: {height: number, width: number}, speed: number, name: string)
  {
    super(side, canvasDimension, speed, name);
    this.typePlayer = "IA";
    this.add_to_update();
    const movementElement = this.playerCard?.querySelector('.player-controls')?.querySelector('span') as HTMLImageElement | null;
    if (!movementElement)
      console.error(`Impossible de trouver l'éléments nécessaires dans la carte du joueur pour update le score.`);
    else
      movementElement.textContent = `Parkinson`;
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
