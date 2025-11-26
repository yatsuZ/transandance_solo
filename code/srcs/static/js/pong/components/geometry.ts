import { PlayerSide } from "./player";
import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT_RATIO,
  PADDLE_SLOPE,
  BALL_RADIUS_RATIO,
  BALL_SPEED_X_RATIO,
  BALL_SPEED_Y_RATIO,
  COLORS
} from "../game-config.js";

export class Point {
  public x: number;
  public y: number;

  /**
   * Crée un point avec des coordonnées initiales.
   * 
   * @param x - Coordonnée horizontale (par défaut 0)
   * @param y - Coordonnée verticale (par défaut 0)
   */
  constructor();
  /**
   * Crée un point avec des coordonnées initiales.
   * 
   * @param x - Coordonnée horizontale (par défaut 0)
   * @param y - Coordonnée verticale (par défaut 0)
   */
  constructor(x: number, y: number);
  /**
   * Crée un point avec des coordonnées initiales.
   * 
   * @param reference - Un point qui est pris en reference
   */
  constructor(reference: Point);

  constructor(arg1?: number | Point, arg2?: number) {
    if (arg1 instanceof Point) {
      this.x = arg1.x;
      this.y = arg1.y;
    } else if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x = arg1;
      this.y = arg2;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  setY(newY: number) {this.y = newY}
  setX(newX: number) {this.x = newX}

  setPoint(x: number, y: number): void;
  setPoint(reference: Point): void;

  setPoint(arg1: number | Point, arg2?: number): void {
    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.x = arg1;
      this.y = arg2;
    } else if (arg1 instanceof Point) {
      this.x = arg1.x;
      this.y = arg1.y;
    } else {
      throw new Error("Invalid arguments for setPoint");
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////

// position + geometrie + deplacement + dessiner
export class Paddle {
  public position: Point;
  public width: number;
  public height: number;
  private speed: number;
  private offset: number;
  private side: PlayerSide;

  constructor(side: PlayerSide, fieldDimension: { height: number; width: number }, speed: number, offset?: number) {
    this.side = side;
    this.offset = offset ?? 0;
    this.speed = speed;

    this.width = PADDLE_WIDTH;
    this.height = fieldDimension.height / PADDLE_HEIGHT_RATIO;

    const x = side === "L" ? this.offset : fieldDimension.width - this.width - this.offset;
    const y = fieldDimension.height / 2 - this.height / 2;
    this.position = new Point(x, y);
  }

  moveUp() {
    this.position.setY(this.position.y - this.speed);
  }

  moveDown() {
    this.position.setY(this.position.y + this.speed);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.position;
    const { width, height } = this;

    ctx.beginPath();

  if (this.side === "L") {
    // Trapèze plus large à l'intérieur du terrain (droite)
    ctx.moveTo(x, y + height * PADDLE_SLOPE);            // coin haut gauche (descendu)
    ctx.lineTo(x + width, y);                     // coin haut droit (monté)
    ctx.lineTo(x + width, y + height);            // coin bas droit (descendu)
    ctx.lineTo(x, y + height * (1 - PADDLE_SLOPE));      // coin bas gauche (remonté)
  } else {
    // Trapèze plus large à l'intérieur du terrain (gauche)
    ctx.moveTo(x + width, y + height * PADDLE_SLOPE);    // coin haut droit (descendu)
    ctx.lineTo(x, y);                             // coin haut gauche (monté)
    ctx.lineTo(x, y + height);                    // coin bas gauche (descendu)
    ctx.lineTo(x + width, y + height * (1 - PADDLE_SLOPE)); // coin bas droit (remonté)
  }
    // if (this.side === "L") {
    //   // Trapèze pour le joueur de gauche
    //   ctx.moveTo(x, y);                 // coin haut gauche
    //   ctx.lineTo(x + width, y + height * slope);  // haut droit (légèrement descendu)
    //   ctx.lineTo(x + width, y + height * (1 - slope));  // bas droit (légèrement remonté)
    //   ctx.lineTo(x, y + height);        // coin bas gauche
    // } else {
    //   // Trapèze pour le joueur de droite (inversé)
    //   ctx.moveTo(x + width, y);         // coin haut droit
    //   ctx.lineTo(x, y + height * slope);  // haut gauche (descendu)
    //   ctx.lineTo(x, y + height * (1 - slope));  // bas gauche (remonté)
    //   ctx.lineTo(x + width, y + height); // coin bas droit
    // }

    ctx.closePath();
    if (this.side === "L")
      ctx.fillStyle = COLORS.PADDLE_LEFT;
    else if (this.side === "R")
      ctx.fillStyle = COLORS.PADDLE_RIGHT;
    ctx.fill();

  }

  getSpeed(): number {
    return this.speed;
  }

  /**
   * 🔁 Redimensionne le paddle selon les nouvelles dimensions du terrain.
   * Conserve la proportion de la hauteur et la position verticale relative.
   */
  resize(newDimensions: { width: number; height: number }) {
    const prevHeight = this.height;
    const prevY = this.position.y;

    // recalcul des dimensions proportionnelles
    this.height = newDimensions.height / PADDLE_HEIGHT_RATIO;
    this.width = PADDLE_WIDTH;

    // recalcule la position horizontale selon le côté
    this.position.x =
      this.side === "L"
        ? this.offset
        : newDimensions.width - this.width - this.offset;

    // garde la même position verticale proportionnelle
    const yRatio = prevY / prevHeight; // rapport de position avant/après
    this.position.y = yRatio * this.height;
  }
}

/////////////////////////////////////////////////////////////////////////////////

export class Ball {
  public curentFieldDimension: {height: number, width: number};
  public x: number;
  public y: number;
  private speedX: number;
  private speedY: number;
  private radius: number;

  constructor(canvasDimension: {height: number, width: number}) {
// a partir des dimension cr2e radieus et speed
    this.curentFieldDimension = canvasDimension;
    this.x = canvasDimension.width / 2;
    this.y = canvasDimension.height / 2;
    this.radius = this.curentFieldDimension.height / BALL_RADIUS_RATIO;
    this.speedX = this.curentFieldDimension.height / BALL_SPEED_X_RATIO;
    this.speedY = this.curentFieldDimension.height / BALL_SPEED_Y_RATIO;
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.speedX;
    this.y += this.speedY;

    // rebond haut/bas
    if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
      this.speedY = -this.speedY;
    }
  }

  reset(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = -this.speedX;
  }

  resize(newDimensions: { width: number; height: number }) {
    // 🔹 Calcul du ratio de redimensionnement
    const xRatio = newDimensions.width / this.curentFieldDimension.width;
    const yRatio = newDimensions.height / this.curentFieldDimension.height;

    this.curentFieldDimension = newDimensions;

    // 🔹 Redimensionner la position en gardant les proportions
    this.x *= xRatio;
    this.y *= yRatio;

    this.radius = this.curentFieldDimension.height / BALL_RADIUS_RATIO;
    this.speedX = this.curentFieldDimension.height / BALL_SPEED_X_RATIO;
    this.speedY = this.curentFieldDimension.height / BALL_SPEED_Y_RATIO;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.BALL;
    ctx.fill();
  }

  collidesWith(paddle: Paddle): boolean {
    return (
      this.x - this.radius < paddle.position.x + paddle.width &&
      this.x + this.radius > paddle.position.x &&
      this.y > paddle.position.y &&
      this.y < paddle.position.y + paddle.height
    );
  }

  bounce() {
    this.speedX = -this.speedX;
  }
}
