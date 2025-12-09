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
  aiDifficulty?: AIDifficultyLevel; // Niveau de difficulté de l'IA (optionnel, par défaut MEDIUM) - utilisé pour les matchs simples
  difficulty?: [string | undefined, string | undefined]; // Niveaux de difficulté pour chaque joueur (utilisé pour les tournois)
  authenticatedPlayerSide?: 'left' | 'right' | null; // Quel joueur est le user connecté
  avatarUrls?: [string | null, string | null]; // URLs des avatars pour les joueurs [left, right]
};


// modifier pong game 1 pour afficher les bonne info dans la page match 
// Pouvoir prendre en parametre le nom des joueur 
// Faire un mode human vs human

export class PongGame {
  // -------------------------
  // Propriétés
  // -------------------------
  private _DO: DOMElements;
  private field: Field;
  private ball!: Ball;  // Initialisé dans initializeGame() après chargement de la customization
  private playerLeft: Player = null!;
  private playerRight: Player = null!;
  private animationId: number | null = null;
  private shouldStop: boolean = false;
  private inTournament: boolean;
  private onMatchEndCallback?: () => void;
  private isBallPaused: boolean = false;  // Pour pause temporaire après un point
  private ballResetTimer: number | null = null;  // Timer pour le délai de reset
  private config: ConfigMatch;
  private powerupsEnabled: boolean = false;

  // Éléments UI pour les indicateurs de dash
  private dashIndicatorLeft: HTMLElement | null = null;
  private dashIndicatorRight: HTMLElement | null = null;
  private dashRingLeft: SVGCircleElement | null = null;
  private dashRingRight: SVGCircleElement | null = null;

  // -------------------------
  // Constructeur
  // -------------------------
  constructor(DO_of_SiteManagement: DOMElements, config: ConfigMatch, inTournament: boolean = false, onMatchEnd?: () => void) {
    this.inTournament = inTournament;
    this.onMatchEndCallback = onMatchEnd;
    this.config = config;
    console.log("[MATCH] Une nouvelle partie est créée.");

    this._DO = DO_of_SiteManagement;

    // Réinitialiser les compteurs de bots pour avoir des noms cohérents
    PlayerAI.resetBotCounters();

    // Initialisation du terrain
    this.field = new Field(this._DO.canva);

    // Gestion du resize
    window.addEventListener("resize", this.resizeHandler);

    // Charger la customization PUIS créer la balle, les joueurs et démarrer le jeu
    this.initializeGame();
  }

  /**
   * Initialise le jeu de manière asynchrone
   * Charge d'abord la customization pour appliquer les vitesses et powerups
   */
  private async initializeGame() {
    const customData = await this.loadAndApplyCustomization();
    this.powerupsEnabled = customData?.powerups_enabled ?? false;

    console.log(`[PONG] Customization chargée - powerups_enabled: ${this.powerupsEnabled}, initial_speed: ${GAMEPLAY.INITIAL_SPEED}%, max_speed: ${GAMEPLAY.MAX_SPEED}%`);

    // Créer la balle APRÈS avoir chargé la customization (pour appliquer initial_speed)
    const dim = this.field.getDimensions();
    this.ball = new Ball(dim);

    this.createPlayers(this.powerupsEnabled);
    this.initDashIndicators();

    // Afficher le countdown avant de démarrer
    this.showCountdown(3, () => {
      this.loop();
    });
  }

  /**
   * Affiche un compte à rebours avant le début du jeu
   */
  private showCountdown(count: number, onComplete: () => void): void {
    const ctx = this._DO.ctx;
    const canvas = this._DO.canva;

    // Dessiner le terrain
    ctx.clearRect(0, 0, this.field.width, this.field.height);
    this.field.draw(ctx);
    this.playerLeft.paddle.draw(ctx, false);
    this.playerRight.paddle.draw(ctx, false);
    this.ball.draw(ctx);

    // Overlay semi-transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texte du countdown
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

  /**
   * Initialise les indicateurs de dash dans l'UI
   */
  private initDashIndicators() {
    // Récupérer les éléments DOM
    this.dashIndicatorLeft = document.getElementById('dash-indicator-left');
    this.dashIndicatorRight = document.getElementById('dash-indicator-right');

    if (this.dashIndicatorLeft) {
      this.dashRingLeft = this.dashIndicatorLeft.querySelector('.dash-ring-progress');
    }
    if (this.dashIndicatorRight) {
      this.dashRingRight = this.dashIndicatorRight.querySelector('.dash-ring-progress');
    }

    // Afficher les indicateurs si powerups activés (pour humains et IA)
    if (this.powerupsEnabled) {
      if (this.dashIndicatorLeft) {
        this.dashIndicatorLeft.style.display = 'flex';
        this.dashRingLeft?.classList.add('ready');
        // Texte différent pour IA vs Humain
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
        // Texte différent pour IA vs Humain
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

  /**
   * Met à jour l'UI des indicateurs de dash
   */
  private updateDashIndicators() {
    if (!this.powerupsEnabled) return;

    // Joueur gauche (humain ou IA)
    if (this.playerLeft.typePlayer === "HUMAN") {
      const player = this.playerLeft as PlayerHuman;
      this.updateDashRingHuman(this.dashRingLeft, this.dashIndicatorLeft, player);
    } else {
      const player = this.playerLeft as PlayerAI;
      this.updateDashRingAI(this.dashRingLeft, this.dashIndicatorLeft, player);
    }

    // Joueur droite (humain ou IA)
    if (this.playerRight.typePlayer === "HUMAN") {
      const player = this.playerRight as PlayerHuman;
      this.updateDashRingHuman(this.dashRingRight, this.dashIndicatorRight, player);
    } else {
      const player = this.playerRight as PlayerAI;
      this.updateDashRingAI(this.dashRingRight, this.dashIndicatorRight, player);
    }
  }

  /**
   * Met à jour un cercle de cooldown pour un joueur humain
   */
  private updateDashRingHuman(ring: SVGCircleElement | null, indicator: HTMLElement | null, player: PlayerHuman) {
    if (!ring || !indicator) return;

    const circumference = 2 * Math.PI * 16; // r=16
    const progress = player.getCooldownProgress();
    const offset = progress * circumference;

    ring.style.strokeDashoffset = offset.toString();

    // Gestion des classes CSS
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

  /**
   * Met à jour un cercle de cooldown pour une IA
   */
  private updateDashRingAI(ring: SVGCircleElement | null, indicator: HTMLElement | null, player: PlayerAI) {
    if (!ring || !indicator) return;

    const circumference = 2 * Math.PI * 16; // r=16
    const progress = player.getCooldownProgress();
    const offset = progress * circumference;

    ring.style.strokeDashoffset = offset.toString();

    // Gestion des classes CSS
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

  /**
   * Crée les joueurs selon le mode de jeu
   */
  private createPlayers(powerupsEnabled: boolean) {
    const dim = this.field.getDimensions();
    const paddleSpeed = dim.height / PADDLE_SPEED_RATIO;

    // Récupérer les difficultés de l'IA
    const difficultyLeft = (this.config.difficulty?.[0] as AIDifficultyLevel) || this.config.aiDifficulty || 'MEDIUM';
    const difficultyRight = (this.config.difficulty?.[1] as AIDifficultyLevel) || this.config.aiDifficulty || 'MEDIUM';

    // Récupérer les avatars (si fournis)
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
      default: // PvP
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, paddleSpeed, this.config.name[0], avatarLeft, powerupsEnabled);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, paddleSpeed, this.config.name[1], avatarRight, powerupsEnabled);
    }
  }

  // -------------------------
  // Chargement de la customization
  // -------------------------
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

  /**
   * Applique les couleurs de bordure aux éléments CSS
   */
  private applyBorderStyles() {
    // Appliquer la bordure du terrain (canvas)
    const canvas = this._DO.canva;
    if (canvas) {
      canvas.style.border = `3px solid ${COLORS.FIELD_BORDER}`;
    }

    // Appliquer les bordures des cartes joueurs
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
      (card as HTMLElement).style.border = `2px solid ${COLORS.CARD_BORDER}`;
    });
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
    // Les joueurs peuvent toujours bouger même quand la balle est en pause
    if (this.playerLeft.typePlayer === "HUMAN") this.playerLeft.update();
    else this.playerLeft.update(this.ball);

    if (this.playerRight.typePlayer === "HUMAN") this.playerRight.update();
    else this.playerRight.update(this.ball);

    // Ne mettre à jour la balle que si elle n'est pas en pause
    if (!this.isBallPaused) {
      this.ball.update(this.field.width, this.field.height);

      // Vérifier collision avec paddle gauche
      if (this.ball.collidesWith(this.playerLeft.paddle)) {
        this.ball.bounce(this.playerLeft.paddle);
      }
      // Vérifier collision avec paddle droite
      else if (this.ball.collidesWith(this.playerRight.paddle)) {
        this.ball.bounce(this.playerRight.paddle);
      }

      // Vérifier si un joueur a marqué
      if (this.ball.x < 0) {
        this.playerRight.add_score();
        this.pauseAndResetBall();
      } else if (this.ball.x > this.field.width) {
        this.playerLeft.add_score();
        this.pauseAndResetBall();
      }
    }
  }

  /**
   * Met la balle en pause puis la reset après BALL_RESET_DELAY
   */
  private pauseAndResetBall() {
    this.isBallPaused = true;

    // Cacher la balle immédiatement
    this.ball.isVisible = false;

    // Nettoyer le timer précédent s'il existe
    if (this.ballResetTimer !== null) {
      clearTimeout(this.ballResetTimer);
    }

    // Programmer le reset après le délai (reset() rend la balle visible à nouveau)
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

    // Dessiner les paddles avec effet de dash si applicable (humain ou IA)
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
    ctx.fillStyle = COLORS.TEXT;  // Utilise la couleur personnalisée
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.playerLeft.get_score()} - ${this.playerRight.get_score()}`, this.field.width / 2, 30);

    // Afficher la vitesse de la balle en bas du terrain
    // Vitesse actuelle = INITIAL_SPEED * speedMultiplier, plafonnée à MAX_SPEED
    const speedMultiplier = this.ball.getSpeedMultiplier();
    const currentSpeed = Math.round(GAMEPLAY.INITIAL_SPEED * speedMultiplier);
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${currentSpeed}%`, this.field.width / 2, this.field.height - 15);
  }

  // -------------------------
  // Boucle principale
  // -------------------------
  private loop() {
    this.update();
    this.draw();
    this.updateDashIndicators();

    // Vérifier si le match est terminé
    if (this.playerLeft.get_score() >= GAMEPLAY.WINNING_SCORE || this.playerRight.get_score() >= GAMEPLAY.WINNING_SCORE) {
      this.stop("Le match est terminé normalement.");
      this.goToResult();
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

    // Nettoyer le timer de reset de balle
    if (this.ballResetTimer !== null) {
      clearTimeout(this.ballResetTimer);
      this.ballResetTimer = null;
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
    console.log(`[MATCH] ✅ Match arrêté : ${whyStop}`);
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

    // Notifier SiteManagement que le match est terminé
    if (this.onMatchEndCallback) {
      this.onMatchEndCallback();
    }
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