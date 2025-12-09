import { Ball, Paddle, Point } from "./geometry.js";
import { InputHandler, DASH_COOLDOWN, DASH_DURATION, DASH_SPEED_MULTIPLIER } from "./input.js";
import { PADDLE_OFFSET, AI_DIFFICULTY, type AIDifficultyLevel } from "../game-config.js";

export type PlayerSide = "L" | "R";
type PlayerType = "IA" | "HUMAN" | "UNDEFINED";

export abstract class Player {
  public readonly side: PlayerSide;
  public readonly paddle: Paddle;
  public readonly name: string;
  public typePlayer : PlayerType = "UNDEFINED";
  public score: number = 0;

  protected playerCard: HTMLElement;

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

    if (side == "L")
      this.playerCard = playerCards.playerCardL;
    else
      this.playerCard = playerCards.playerCardR;

    this.initDOMElements();
  }

  private initDOMElements(): void {
    if (!this.playerCard) {
      return;
    }

    this.nameElement = this.playerCard.querySelector('.player-name');
    this.typeElement = this.playerCard.querySelector('.player-type');
    this.avatarElement = this.playerCard.querySelector('.player-avatar');
    this.scoreElement = this.playerCard.querySelector('.player-score')?.querySelector('span') ?? null;
    this.movementElement = this.playerCard.querySelector('.player-controls')?.querySelector('span') ?? null;
  }

  onResize(newDimensions: { width: number; height: number }) {
    this.paddle.resize(newDimensions);
  }

  abstract update(...args: any[]): void;

  public add_to_update(): void {
    if (!this.nameElement || !this.typeElement || !this.avatarElement || !this.scoreElement) {
      return;
    }

    this.nameElement.textContent = this.name;
    this.typeElement.textContent = this.typePlayer;
    this.scoreElement.textContent = "0";

    if (this.typePlayer === "HUMAN") {
      const humanPlayer = this as any;
      this.avatarElement.src = humanPlayer.avatarUrl || "/static/util/icon/profile.png";
    } else {
      this.avatarElement.src = "/static/util/icon/profile_robot.png";
    }
  }

  public add_score(): void {
    this.score++;

    if (!this.scoreElement) {
      return;
    }

    this.scoreElement.textContent = this.score.toString();
  }

  public get_score(){
    return this.score;
  }
}

export class PlayerHuman extends Player {
  private input: InputHandler;
  private avatarUrl: string | null;

  constructor(side: "L" | "R", playerCards:{playerCardL: HTMLElement,playerCardR: HTMLElement}, canvasDimension: {height: number, width: number}, speed: number, name: string, avatarUrl: string | null = null, powerupsEnabled: boolean = false)
  {
    super(side, playerCards, canvasDimension, speed, name);
    this.typePlayer = "HUMAN";
    this.avatarUrl = avatarUrl;
    this.input = new InputHandler(side, powerupsEnabled);
    this.add_to_update();

    if (this.movementElement) {
      const upAndDownKey = this.input.getDisplayKeys();
      this.movementElement.textContent = `${upAndDownKey.up} / ${upAndDownKey.down}`;
    }
  }

  update() {
    const speedMultiplier = this.input.getSpeedMultiplier();
    if (this.input.upPressed) this.paddle.moveUp(speedMultiplier);
    if (this.input.downPressed) this.paddle.moveDown(speedMultiplier);
  }

  public getIsDashing(): boolean {
    return this.input.getIsDashing();
  }

  public getCooldownProgress(): number {
    return this.input.getCooldownProgress();
  }

  public isOnCooldown(): boolean {
    return this.input.isOnCooldown();
  }

  public arePowerupsEnabled(): boolean {
    return this.input.arePowerupsEnabled();
  }

  public getInputHandler(): InputHandler {
    return this.input;
  }

  public getDashKey(): string {
    return this.input.getDashKey();
  }

  public cleanup(): void {
    this.input.cleanup();
  }
}

export class PlayerAI extends Player {
  private lastAIUpdate: number = 0;
  private aiUpdateInterval: number = 1000;

  private predictedBallY: number = 0;
  private targetY: number = 0;
  private isReturningToCenter: boolean = false;

  private difficulty: AIDifficultyLevel;
  private errorMargin: number = 30;
  private reactionDelay: number = 100;

  private isReacting: boolean = true;
  private fieldHeight: number = 0;

  private powerupsEnabled: boolean = false;
  private isDashing: boolean = false;
  private dashCooldown: boolean = false;
  private dashCooldownStartTime: number = 0;

  private static botCounters: Record<string, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    EXPERT: 0
  };

  constructor(
    side: "L" | "R",
    playerCards: {playerCardL: HTMLElement, playerCardR: HTMLElement},
    canvasDimension: {height: number, width: number},
    speed: number,
    name?: string,
    difficulty: AIDifficultyLevel = 'MEDIUM',
    powerupsEnabled: boolean = false
  ) {
    const botName = name || PlayerAI.generateBotName(difficulty);

    super(side, playerCards, canvasDimension, speed, botName);
    this.typePlayer = "IA";
    this.difficulty = difficulty;
    this.fieldHeight = canvasDimension.height;
    this.powerupsEnabled = powerupsEnabled;

    this.applyDifficulty();

    this.add_to_update();

    if (this.movementElement) {
      const config = AI_DIFFICULTY[this.difficulty];
      this.movementElement.textContent = `🤖 ${config.label}`;
    }
  }

  private static generateBotName(difficulty: AIDifficultyLevel): string {
    const config = AI_DIFFICULTY[difficulty];
    const baseName = config.botName;

    PlayerAI.botCounters[difficulty]++;
    const count = PlayerAI.botCounters[difficulty];

    if (count === 1) {
      return baseName;
    }

    return `${baseName} #${count}`;
  }

  public static resetBotCounters(): void {
    PlayerAI.botCounters = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      EXPERT: 0
    };
  }

  private applyDifficulty(): void {
    const config = AI_DIFFICULTY[this.difficulty];

    this.aiUpdateInterval = config.aiUpdateInterval;
    this.errorMargin = config.errorMargin;
    this.reactionDelay = config.reactionDelay;
  }

  update(ball: Ball): void {
    const now = Date.now();

    if (now - this.lastAIUpdate >= this.aiUpdateInterval) {
      this.updateAI(ball);
      this.lastAIUpdate = now;
    }

    this.moveTowardsTarget();
  }

  private updateAI(ball: Ball): void {
    this.predictedBallY = this.predictBallPosition(ball);

    const randomError = (Math.random() - 0.5) * 2 * this.errorMargin;
    this.targetY = this.predictedBallY + randomError;

    const distanceToBall = Math.abs(ball.x - this.paddle.position.x);
    const fieldWidth = this.fieldHeight * (4/3);

    const isMovingTowards = (this.side === 'R' && ball.velocity.x > 0) ||
                           (this.side === 'L' && ball.velocity.x < 0);

    if (distanceToBall > fieldWidth / 2 || !isMovingTowards) {
      this.targetY = this.fieldHeight / 2;
      this.isReturningToCenter = true;
    } else {
      this.isReturningToCenter = false;
    }

    if (this.reactionDelay > 0) {
      this.isReacting = false;
      setTimeout(() => {
        this.isReacting = true;
      }, this.reactionDelay);
    } else {
      this.isReacting = true;
    }
  }

  private predictBallPosition(ball: Ball): number {
    let ballX = ball.x;
    let ballY = ball.y;
    let velocityX = ball.velocity.x;
    let velocityY = ball.velocity.y;

    const isMovingTowards = (this.side === 'R' && velocityX > 0) ||
                           (this.side === 'L' && velocityX < 0);

    if (!isMovingTowards || Math.abs(velocityX) < 0.1) {
      return this.fieldHeight / 2;
    }

    const paddleX = this.paddle.position.x;
    const deltaX = Math.abs(paddleX - ballX);

    let adjustedVelocityX = Math.abs(velocityX);
    if (this.difficulty === 'EXPERT') {
      adjustedVelocityX *= 0.85;
    }

    const timeToReach = deltaX / adjustedVelocityX;

    let predictedY = ballY + (velocityY * timeToReach);

    const maxIterations = 10;
    let iterations = 0;

    while ((predictedY < 0 || predictedY > this.fieldHeight) && iterations < maxIterations) {
      if (predictedY < 0) {
        predictedY = Math.abs(predictedY);
        velocityY = -velocityY;
      }
      if (predictedY > this.fieldHeight) {
        predictedY = 2 * this.fieldHeight - predictedY;
        velocityY = -velocityY;
      }
      iterations++;
    }

    predictedY = Math.max(0, Math.min(this.fieldHeight, predictedY));

    return predictedY;
  }

  private moveTowardsTarget(): void {
    if (!this.isReacting) {
      return;
    }

    const paddleCenter = this.paddle.position.y + this.paddle.height / 2;
    const diff = this.targetY - paddleCenter;

    let deadZone: number;

    if (this.isReturningToCenter) {
      deadZone = 30;
    } else {
      deadZone = this.difficulty === 'EXPERT' ? 4 : 5;
    }

    if (Math.abs(diff) < deadZone) {
      return;
    }

    const speedMultiplier = this.shouldDash(diff) ? DASH_SPEED_MULTIPLIER : 1;

    if (diff > 0) {
      this.paddle.moveDown(speedMultiplier);
    } else {
      this.paddle.moveUp(speedMultiplier);
    }
  }

  private shouldDash(distanceToTarget: number): boolean {
    if (!this.powerupsEnabled || this.dashCooldown || this.isDashing) {
      return false;
    }

    const absDistance = Math.abs(distanceToTarget);

    let dashThreshold: number;
    let dashProbability: number;

    switch (this.difficulty) {
      case 'EASY':
        dashThreshold = this.fieldHeight * 0.5;
        dashProbability = 0.2;
        break;
      case 'MEDIUM':
        dashThreshold = this.fieldHeight * 0.35;
        dashProbability = 0.4;
        break;
      case 'HARD':
        dashThreshold = this.fieldHeight * 0.25;
        dashProbability = 0.6;
        break;
      case 'EXPERT':
        dashThreshold = this.fieldHeight * 0.2;
        dashProbability = 0.8;
        break;
      default:
        dashThreshold = this.fieldHeight * 0.35;
        dashProbability = 0.4;
    }

    if (!this.isReturningToCenter && absDistance > dashThreshold) {
      if (Math.random() < dashProbability) {
        this.triggerDash();
        return true;
      }
    }

    return this.isDashing;
  }

  private triggerDash(): void {
    if (this.isDashing || this.dashCooldown) return;

    this.isDashing = true;
    this.dashCooldown = true;
    this.dashCooldownStartTime = Date.now();

    setTimeout(() => {
      this.isDashing = false;
    }, DASH_DURATION);

    setTimeout(() => {
      this.dashCooldown = false;
    }, DASH_COOLDOWN);
  }

  public getIsDashing(): boolean {
    return this.isDashing;
  }

  public getCooldownProgress(): number {
    if (!this.dashCooldown) return 0;
    const elapsed = Date.now() - this.dashCooldownStartTime;
    return Math.max(0, 1 - elapsed / DASH_COOLDOWN);
  }

  public isOnCooldown(): boolean {
    return this.dashCooldown;
  }

  public arePowerupsEnabled(): boolean {
    return this.powerupsEnabled;
  }

  onResize(newDimensions: { width: number; height: number }): void {
    super.onResize(newDimensions);
    this.fieldHeight = newDimensions.height;
  }
}
