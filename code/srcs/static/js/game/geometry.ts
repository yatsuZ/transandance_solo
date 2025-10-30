import { PlayerSide } from "./player";

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
  private offset : number;


  constructor(side: PlayerSide, fieldDimension: {height: number, width: number}, speed: number, offset?: number) {

    const paddleWidth = 5;
    const paddleHeight = fieldDimension.height / 3;
    
    this.offset = offset ?? 0;
    const x = side === "L" ? this.offset : fieldDimension.width - paddleWidth - this.offset;
    const y = fieldDimension.height / 2 - paddleHeight / 2;


    this.position = new Point(x, y);

    this.width = paddleWidth;
    this.height = paddleHeight;
    this.speed = speed;
  }

  moveUp() {
    this.position.setY(this.position.y - this.speed)
  }

  moveDown() {
    this.position.setY(this.position.y + this.speed)
  }

  draw(ctx: CanvasRenderingContext2D) {
    const x =  this.position.x;
    const y = this.position.y;

    ctx.fillRect(x, y, this.width, this.height);
  }

  getSpeed(): number { return this.speed};
}

/////////////////////////////////////////////////////////////////////////////////

export class Ball {
  public x: number;
  public y: number;
  private speedX: number;
  private speedY: number;
  private radius: number;

  constructor(x: number, y: number, radius: number, speedX: number, speedY: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
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

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
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
