import { PlayerSide } from "./player";
import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT_RATIO,
  PADDLE_SLOPE,
  BALL_RADIUS_RATIO,
  BALL_SPEED_X_RATIO,
  BALL_SPEED_Y_RATIO,
  BALL_ACCELERATION_FACTOR,
  BALL_MAX_SPEED_MULTIPLIER,
  BALL_ANGLE_VARIATION_INTENSITY,
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
  public side: PlayerSide;
  private speed: number;
  private offset: number;
  private fieldHeight: number;  // Pour limiter le mouvement

  constructor(side: PlayerSide, fieldDimension: { height: number; width: number }, speed: number, offset?: number) {
    this.side = side;
    this.offset = offset ?? 0;
    this.speed = speed;
    this.fieldHeight = fieldDimension.height;

    this.width = PADDLE_WIDTH;
    this.height = fieldDimension.height / PADDLE_HEIGHT_RATIO;

    const x = side === "L" ? this.offset : fieldDimension.width - this.width - this.offset;
    const y = fieldDimension.height / 2 - this.height / 2;
    this.position = new Point(x, y);
  }

  moveUp() {
    const newY = this.position.y - this.speed;
    // Bloquer au bord supérieur (y = 0)
    this.position.setY(Math.max(0, newY));
  }

  moveDown() {
    const newY = this.position.y + this.speed;
    // Bloquer au bord inférieur (y + height = fieldHeight)
    this.position.setY(Math.min(this.fieldHeight - this.height, newY));
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

    // Mettre à jour la hauteur du terrain pour les limites
    this.fieldHeight = newDimensions.height;

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

    // S'assurer que la paddle reste dans les limites après resize
    this.position.y = Math.max(0, Math.min(this.fieldHeight - this.height, this.position.y));
  }
}

/////////////////////////////////////////////////////////////////////////////////

export class Ball {
  public curentFieldDimension: {height: number, width: number};
  public x: number;
  public y: number;
  private speedX: number = 0;  // Initialisé par setRandomDirection()
  private speedY: number = 0;  // Initialisé par setRandomDirection()
  private radius: number;
  private baseSpeedX: number;  // Vitesse initiale X (pour reset)
  private baseSpeedY: number;  // Vitesse initiale Y (pour reset)
  private currentSpeedMultiplier: number = 1;  // Multiplicateur de vitesse actuel
  public isVisible: boolean = true;  // Pour cacher la balle pendant le reset

  constructor(canvasDimension: {height: number, width: number}) {
    this.curentFieldDimension = canvasDimension;
    this.x = canvasDimension.width / 2;
    this.y = canvasDimension.height / 2;
    this.radius = this.curentFieldDimension.height / BALL_RADIUS_RATIO;

    // Initialiser les vitesses de base
    this.baseSpeedX = this.curentFieldDimension.height / BALL_SPEED_X_RATIO;
    this.baseSpeedY = this.curentFieldDimension.height / BALL_SPEED_Y_RATIO;

    // Direction aléatoire au départ avec angle varié
    this.setRandomDirection();
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.speedX;
    this.y += this.speedY;

    // rebond haut/bas
    if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
      this.speedY = -this.speedY;
    }
  }

  /**
   * Définit une direction aléatoire variée pour la balle
   * Génère un angle aléatoire au lieu des 4 directions fixes
   */
  private setRandomDirection() {
    // Choisir une direction horizontale (gauche ou droite)
    const horizontalDirection = Math.random() > 0.5 ? 1 : -1;

    // Générer un angle aléatoire entre -45° et +45° (en radians)
    // Angles moins extrêmes pour une vitesse plus prévisible
    const minAngle = -Math.PI / 4;  // -45°
    const maxAngle = Math.PI / 4;   // +45°
    const angle = minAngle + Math.random() * (maxAngle - minAngle);

    // Utiliser baseSpeedX comme vitesse de référence pour la composante horizontale
    // Cela garantit une vitesse initiale raisonnable
    this.speedX = this.baseSpeedX * horizontalDirection;

    // Calculer speedY proportionnellement à l'angle
    // tan(angle) = speedY / speedX
    this.speedY = Math.tan(angle) * Math.abs(this.speedX);
  }

  reset(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;

    // Réinitialiser le multiplicateur de vitesse
    this.currentSpeedMultiplier = 1;

    // Rendre la balle visible à nouveau
    this.isVisible = true;

    // Direction aléatoire au reset avec angle varié
    this.setRandomDirection();
  }

  resize(newDimensions: { width: number; height: number }) {
    // 🔹 Calcul du ratio de redimensionnement
    const xRatio = newDimensions.width / this.curentFieldDimension.width;
    const yRatio = newDimensions.height / this.curentFieldDimension.height;

    this.curentFieldDimension = newDimensions;

    // 🔹 Redimensionner la position en gardant les proportions
    this.x *= xRatio;
    this.y *= yRatio;

    // 🔹 Recalculer les dimensions et vitesses de base
    this.radius = this.curentFieldDimension.height / BALL_RADIUS_RATIO;
    this.baseSpeedX = this.curentFieldDimension.height / BALL_SPEED_X_RATIO;
    this.baseSpeedY = this.curentFieldDimension.height / BALL_SPEED_Y_RATIO;

    // 🔹 Appliquer le multiplicateur actuel aux nouvelles vitesses de base
    const speedXSign = this.speedX > 0 ? 1 : -1;
    const speedYSign = this.speedY > 0 ? 1 : -1;
    this.speedX = this.baseSpeedX * this.currentSpeedMultiplier * speedXSign;
    this.speedY = this.baseSpeedY * this.currentSpeedMultiplier * speedYSign;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Ne dessiner la balle que si elle est visible
    if (!this.isVisible) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.BALL;
    ctx.fill();
  }

  collidesWith(paddle: Paddle): boolean {
    // Vérifier d'abord si la balle est dans la zone verticale de la paddle
    const ballBottom = this.y + this.radius;
    const ballTop = this.y - this.radius;
    const paddleTop = paddle.position.y;
    const paddleBottom = paddle.position.y + paddle.height;

    // La balle doit être dans la zone verticale de la paddle
    if (ballBottom < paddleTop || ballTop > paddleBottom) {
      return false;
    }

    // Vérifier la collision horizontale selon le côté de la paddle
    const ballLeft = this.x - this.radius;
    const ballRight = this.x + this.radius;
    const paddleLeft = paddle.position.x;
    const paddleRight = paddle.position.x + paddle.width;

    if (paddle.side === "L") {
      // Paddle gauche : vérifier que la balle vient de la droite
      // et touche la face droite de la paddle
      return (
        this.speedX < 0 &&           // Balle va vers la gauche
        ballLeft <= paddleRight &&   // Bord gauche de la balle touche la face droite de la paddle
        ballLeft > paddleLeft        // Mais pas trop loin à gauche
      );
    } else {
      // Paddle droite : vérifier que la balle vient de la gauche
      // et touche la face gauche de la paddle
      return (
        this.speedX > 0 &&           // Balle va vers la droite
        ballRight >= paddleLeft &&   // Bord droit de la balle touche la face gauche de la paddle
        ballRight < paddleRight      // Mais pas trop loin à droite
      );
    }
  }

  /**
   * Fait rebondir la balle sur une paddle avec variation d'angle et accélération
   * @param paddle - La paddle sur laquelle la balle rebondit
   */
  bounce(paddle: Paddle) {
    // 🎯 Calcul de l'impact relatif sur la paddle (-1 = haut, 0 = milieu, 1 = bas)
    const paddleCenter = paddle.position.y + paddle.height / 2;
    const impactPoint = this.y - paddleCenter;
    const relativeImpact = impactPoint / (paddle.height / 2);  // Valeur entre -1 et 1

    // 🔄 Inverser la direction horizontale
    this.speedX = -this.speedX;

    // 📐 Modifier l'angle vertical selon l'impact
    // Plus l'impact est excentré, plus l'angle change
    const angleVariation = relativeImpact * BALL_ANGLE_VARIATION_INTENSITY;
    this.speedY = this.baseSpeedY * angleVariation * this.currentSpeedMultiplier;

    // ⚡ Accélération progressive (max 150% de la vitesse initiale)
    if (this.currentSpeedMultiplier < BALL_MAX_SPEED_MULTIPLIER) {
      this.currentSpeedMultiplier *= BALL_ACCELERATION_FACTOR;

      // Appliquer l'accélération
      const speedSign = this.speedX > 0 ? 1 : -1;
      this.speedX = this.baseSpeedX * this.currentSpeedMultiplier * speedSign;
    }
  }

  /**
   * Retourne la vitesse actuelle de la balle (magnitude du vecteur vitesse)
   * @returns La vitesse totale en pixels/frame
   */
  getSpeed(): number {
    return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
  }

  /**
   * Retourne le multiplicateur de vitesse actuel
   * @returns Le multiplicateur (1.0 = vitesse initiale, 1.5 = vitesse max)
   */
  getSpeedMultiplier(): number {
    return this.currentSpeedMultiplier;
  }
}
