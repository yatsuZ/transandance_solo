import { Ball } from './components/geometry.js';
import { Player, PlayerAI, PlayerHuman } from './components/player.js';
import { Field } from './components/field.js';
import { updateUrl } from '../utils/url-helpers.js';
import { activeAnotherPage } from '../navigation/page-manager.js';
import { SiteManagement } from '../SiteManagement.js';
import { DOMElements } from '../core/dom-elements.js';
import { PADDLE_SPEED_RATIO, GAMEPLAY, type AIDifficultyLevel } from './game-config.js';
import { applyCustomization, COLORS } from './config/colors-config.js';
import { applyGameplayCustomization } from './config/gameplay-config.js';

export type ConfigMatch = {
  mode: "PvP" | "PvIA" | "IAvP" | "IAvIA";
  name: [string, string];
  aiDifficulty?: AIDifficultyLevel;
  difficulty?: [string | undefined, string | undefined];
  authenticatedPlayerSide?: 'left' | 'right' | null;
  avatarUrls?: [string | null, string | null];
};

export class PongGame {
  private _DO: DOMElements;
  private field: Field;
  private ball!: Ball;
  private playerLeft: Player = null!;
  private playerRight: Player = null!;
  private animationId: number | null = null;
  private shouldStop: boolean = false;
  private inTournament: boolean;
  private onMatchEndCallback?: () => void;
  private isBallPaused: boolean = false;
  private ballResetTimer: number | null = null;
  private config: ConfigMatch;
  private powerupsEnabled: boolean = false;

  private dashIndicatorLeft: HTMLElement | null = null;
  private dashIndicatorRight: HTMLElement | null = null;
  private dashRingLeft: SVGCircleElement | null = null;
  private dashRingRight: SVGCircleElement | null = null;

  constructor(DO_of_SiteManagement: DOMElements, config: ConfigMatch, inTournament: boolean = false, onMatchEnd?: () => void) {
    this.inTournament = inTournament;
    this.onMatchEndCallback = onMatchEnd;
    this.config = config;

    this._DO = DO_of_SiteManagement;

    PlayerAI.resetBotCounters();

    this.field = new Field(this._DO.canva);

    window.addEventListener("resize", this.resizeHandler);

    this.initializeGame();
  }

  private async initializeGame() {
    const customData = await this.loadAndApplyCustomization();
    this.powerupsEnabled = customData?.powerups_enabled ?? false;

    const dim = this.field.getDimensions();
    this.ball = new Ball(dim);

    this.createPlayers(this.powerupsEnabled);
    this.initDashIndicators();

    this.showCountdown(3, () => {
      this.loop();
    });
  }

  private showCountdown(count: number, onComplete: () => void): void {
    const ctx = this._DO.ctx;
    const canvas = this._DO.canva;

    ctx.clearRect(0, 0, this.field.width, this.field.height);
    this.field.draw(ctx);
    this.playerLeft.paddle.draw(ctx, false);
    this.playerRight.paddle.draw(ctx, false);
    this.ball.draw(ctx);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.TEXT;
    ctx.font = 'bold 120px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30;
    ctx.shadowColor = COLORS.TEXT;

    const text = count > 0 ? count.toString() : 'GO!';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    if (count > 0) {
      setTimeout(() => this.showCountdown(count - 1, onComplete), 1000);
    } else {
      setTimeout(onComplete, 500);
    }
  }

  private initDashIndicators() {
    this.dashIndicatorLeft = document.getElementById('dash-indicator-left');
    this.dashIndicatorRight = document.getElementById('dash-indicator-right');

    if (this.dashIndicatorLeft) {
      this.dashRingLeft = this.dashIndicatorLeft.querySelector('.dash-ring-progress');
    }
    if (this.dashIndicatorRight) {
      this.dashRingRight = this.dashIndicatorRight.querySelector('.dash-ring-progress');
    }

    if (this.powerupsEnabled) {
      if (this.dashIndicatorLeft) {
        this.dashIndicatorLeft.style.display = 'flex';
        this.dashRingLeft?.classList.add('ready');
        const hintLeft = this.dashIndicatorLeft.querySelector('.dash-hint');
        if (hintLeft) {
          if (this.playerLeft.typePlayer === "IA") {
            hintLeft.textContent = "Dash auto";
          } else {
            const dashKey = (this.playerLeft as PlayerHuman).getDashKey();
            hintLeft.textContent = `${dashKey} + direction`;
          }
        }
      }
      if (this.dashIndicatorRight) {
        this.dashIndicatorRight.style.display = 'flex';
        this.dashRingRight?.classList.add('ready');
        const hintRight = this.dashIndicatorRight.querySelector('.dash-hint');
        if (hintRight) {
          if (this.playerRight.typePlayer === "IA") {
            hintRight.textContent = "Dash auto";
          } else {
            const dashKey = (this.playerRight as PlayerHuman).getDashKey();
            hintRight.textContent = `${dashKey} + direction`;
          }
        }
      }
    }
  }

  private updateDashIndicators() {
    if (!this.powerupsEnabled) return;

    if (this.playerLeft.typePlayer === "HUMAN") {
      const player = this.playerLeft as PlayerHuman;
      this.updateDashRingHuman(this.dashRingLeft, this.dashIndicatorLeft, player);
    } else {
      const player = this.playerLeft as PlayerAI;
      this.updateDashRingAI(this.dashRingLeft, this.dashIndicatorLeft, player);
    }

    if (this.playerRight.typePlayer === "HUMAN") {
      const player = this.playerRight as PlayerHuman;
      this.updateDashRingHuman(this.dashRingRight, this.dashIndicatorRight, player);
    } else {
      const player = this.playerRight as PlayerAI;
      this.updateDashRingAI(this.dashRingRight, this.dashIndicatorRight, player);
    }
  }

  private updateDashRingHuman(ring: SVGCircleElement | null, indicator: HTMLElement | null, player: PlayerHuman) {
    if (!ring || !indicator) return;

    const circumference = 2 * Math.PI * 16;
    const progress = player.getCooldownProgress();
    const offset = progress * circumference;

    ring.style.strokeDashoffset = offset.toString();

    if (player.getIsDashing()) {
      indicator.classList.add('dashing');
      ring.classList.remove('ready', 'on-cooldown');
    } else if (player.isOnCooldown()) {
      indicator.classList.remove('dashing');
      ring.classList.add('on-cooldown');
      ring.classList.remove('ready');
    } else {
      indicator.classList.remove('dashing');
      ring.classList.remove('on-cooldown');
      ring.classList.add('ready');
    }
  }

  private updateDashRingAI(ring: SVGCircleElement | null, indicator: HTMLElement | null, player: PlayerAI) {
    if (!ring || !indicator) return;

    const circumference = 2 * Math.PI * 16;
    const progress = player.getCooldownProgress();
    const offset = progress * circumference;

    ring.style.strokeDashoffset = offset.toString();

    if (player.getIsDashing()) {
      indicator.classList.add('dashing');
      ring.classList.remove('ready', 'on-cooldown');
    } else if (player.isOnCooldown()) {
      indicator.classList.remove('dashing');
      ring.classList.add('on-cooldown');
      ring.classList.remove('ready');
    } else {
      indicator.classList.remove('dashing');
      ring.classList.remove('on-cooldown');
      ring.classList.add('ready');
    }
  }

  private createPlayers(powerupsEnabled: boolean) {
    const dim = this.field.getDimensions();
    const paddleSpeed = dim.height / PADDLE_SPEED_RATIO;

    const difficultyLeft = (this.config.difficulty?.[0] as AIDifficultyLevel) || this.config.aiDifficulty || 'MEDIUM';
    const difficultyRight = (this.config.difficulty?.[1] as AIDifficultyLevel) || this.config.aiDifficulty || 'MEDIUM';

    const avatarLeft = this.config.avatarUrls?.[0] || null;
    const avatarRight = this.config.avatarUrls?.[1] || null;

    switch (this.config.mode) {
      case "PvIA":
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, paddleSpeed, this.config.name[0], avatarLeft, powerupsEnabled);
        this.playerRight = new PlayerAI("R", this._DO.matchElement, dim, paddleSpeed, this.config.name[1], difficultyRight, powerupsEnabled);
        break;
      case "IAvP":
        this.playerLeft = new PlayerAI("L", this._DO.matchElement, dim, paddleSpeed, this.config.name[0], difficultyLeft, powerupsEnabled);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, paddleSpeed, this.config.name[1], avatarRight, powerupsEnabled);
        break;
      case "IAvIA":
        this.playerLeft = new PlayerAI("L", this._DO.matchElement, dim, paddleSpeed, this.config.name[0], difficultyLeft, powerupsEnabled);
        this.playerRight = new PlayerAI("R", this._DO.matchElement, dim, paddleSpeed, this.config.name[1], difficultyRight, powerupsEnabled);
        break;
      default:
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, paddleSpeed, this.config.name[0], avatarLeft, powerupsEnabled);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, paddleSpeed, this.config.name[1], avatarRight, powerupsEnabled);
    }
  }

  private async loadAndApplyCustomization(): Promise<{ powerups_enabled?: boolean } | null> {
    try {
      const response = await fetch('/api/customization/pong', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          applyCustomization(data.data);
          applyGameplayCustomization(data.data);
          this.applyBorderStyles();
          return data.data;
        } else {
          applyCustomization(null);
          applyGameplayCustomization(null);
          this.applyBorderStyles();
          return null;
        }
      } else {
        applyCustomization(null);
        applyGameplayCustomization(null);
        this.applyBorderStyles();
        return null;
      }
    } catch (error) {
      applyCustomization(null);
      applyGameplayCustomization(null);
      this.applyBorderStyles();
      return null;
    }
  }

  private applyBorderStyles() {
    const canvas = this._DO.canva;
    if (canvas) {
      canvas.style.border = `3px solid ${COLORS.FIELD_BORDER}`;
    }

    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
      (card as HTMLElement).style.border = `2px solid ${COLORS.CARD_BORDER}`;
    });
  }

  private resizeHandler = () => this.handleResize();

  private handleResize() {
    const dim = this.field.getDimensions();
    this.playerLeft.onResize(dim);
    this.playerRight.onResize(dim);
    this.ball.resize(dim);

    const baseFontSize = dim.height / 14.8;
    this._DO.ctx.font = `${baseFontSize}px Joystix Mono`;
  }

  private update() {
    if (this.playerLeft.typePlayer === "HUMAN") this.playerLeft.update();
    else this.playerLeft.update(this.ball);

    if (this.playerRight.typePlayer === "HUMAN") this.playerRight.update();
    else this.playerRight.update(this.ball);

    if (!this.isBallPaused) {
      this.ball.update(this.field.width, this.field.height);

      if (this.ball.collidesWith(this.playerLeft.paddle)) {
        this.ball.bounce(this.playerLeft.paddle);
      }
      else if (this.ball.collidesWith(this.playerRight.paddle)) {
        this.ball.bounce(this.playerRight.paddle);
      }

      if (this.ball.x < 0) {
        this.playerRight.add_score();
        this.pauseAndResetBall();
      } else if (this.ball.x > this.field.width) {
        this.playerLeft.add_score();
        this.pauseAndResetBall();
      }
    }
  }

  private pauseAndResetBall() {
    this.isBallPaused = true;

    this.ball.isVisible = false;

    if (this.ballResetTimer !== null) {
      clearTimeout(this.ballResetTimer);
    }

    this.ballResetTimer = window.setTimeout(() => {
      this.ball.reset(this.field.width, this.field.height);
      this.isBallPaused = false;
      this.ballResetTimer = null;
    }, GAMEPLAY.BALL_RESET_DELAY);
  }

  private draw() {
    const ctx = this._DO.ctx;
    ctx.clearRect(0, 0, this.field.width, this.field.height);

    this.field.draw(ctx);
    this.ball.draw(ctx);

    const leftIsDashing = this.playerLeft.typePlayer === "HUMAN"
      ? (this.playerLeft as PlayerHuman).getIsDashing()
      : (this.playerLeft as PlayerAI).getIsDashing();
    const rightIsDashing = this.playerRight.typePlayer === "HUMAN"
      ? (this.playerRight as PlayerHuman).getIsDashing()
      : (this.playerRight as PlayerAI).getIsDashing();

    this.playerLeft.paddle.draw(ctx, leftIsDashing);
    this.playerRight.paddle.draw(ctx, rightIsDashing);

    const baseFontSize = this.field.height / 14.8;
    ctx.font = `${baseFontSize}px Joystix Mono`;
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.playerLeft.get_score()} - ${this.playerRight.get_score()}`, this.field.width / 2, 30);

    const speedMultiplier = this.ball.getSpeedMultiplier();
    const currentSpeed = Math.round(GAMEPLAY.INITIAL_SPEED * speedMultiplier);
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${currentSpeed}%`, this.field.width / 2, this.field.height - 15);
  }

  private loop() {
    this.update();
    this.draw();
    this.updateDashIndicators();

    if (this.playerLeft.get_score() >= GAMEPLAY.WINNING_SCORE || this.playerRight.get_score() >= GAMEPLAY.WINNING_SCORE) {
      this.stop("Match termine normalement");
      this.goToResult();
    }

    if (!this.shouldStop) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  }

  public stop(whyStop: string = "On a quitte la page match") {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.ballResetTimer !== null) {
      clearTimeout(this.ballResetTimer);
      this.ballResetTimer = null;
    }

    window.removeEventListener("resize", this.resizeHandler);

    if (this.playerLeft.typePlayer === "HUMAN")
      (this.playerLeft as PlayerHuman).cleanup();
    if (this.playerRight.typePlayer === "HUMAN")
      (this.playerRight as PlayerHuman).cleanup();

    const { canva, ctx } = this._DO;
    ctx.clearRect(0, 0, canva.width, canva.height);

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

    if (this.onMatchEndCallback) {
      this.onMatchEndCallback();
    }
  }

  public getWinnerAndLooser(): { Winner: Player; Looser: Player } | null {
    if (!this.shouldStop) {
      return null;
    }
    return this.playerLeft.get_score() > this.playerRight.get_score()
      ? { Winner: this.playerLeft, Looser: this.playerRight }
      : { Winner: this.playerRight, Looser: this.playerLeft };
  }
}
