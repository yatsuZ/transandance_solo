import { Ball } from './components/geometry.js';
import { Player, PlayerAI, PlayerHuman } from './components/player.js';
import { Field } from './components/field.js';
import { updateUrl } from '../utils/url-helpers.js';
import { activeAnotherPage } from '../navigation/page-manager.js';
import { SiteManagement } from '../SiteManagement.js';
import { DOMElements } from '../core/dom-elements.js';
import { PADDLE_SPEED_RATIO, WINNING_SCORE, BALL_RESET_DELAY, type AIDifficultyLevel } from './game-config.js';
import { applyCustomization, COLORS } from './config/colors-config.js';

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
  private ball: Ball;
  private playerLeft: Player;
  private playerRight: Player;
  private animationId: number | null = null;
  private shouldStop: boolean = false;
  private inTournament: boolean;
  private onMatchEndCallback?: () => void;
  private isBallPaused: boolean = false;  // Pour pause temporaire après un point
  private ballResetTimer: number | null = null;  // Timer pour le délai de reset

  // -------------------------
  // Constructeur
  // -------------------------
  constructor(DO_of_SiteManagement: DOMElements, config: ConfigMatch, inTournament: boolean = false, onMatchEnd?: () => void) {
    this.inTournament = inTournament;
    this.onMatchEndCallback = onMatchEnd;
    console.log("[MATCH] Une nouvelle partie est créée.");

    this._DO = DO_of_SiteManagement;

    // Réinitialiser les compteurs de bots pour avoir des noms cohérents
    PlayerAI.resetBotCounters();

    // Initialisation du terrain et des joueurs
    this.field = new Field(this._DO.canva);
    const dim = this.field.getDimensions();

    // Calculer la vitesse des paddles proportionnellement à la hauteur du terrain
    const paddleSpeed = dim.height / PADDLE_SPEED_RATIO;

    // Récupérer les difficultés de l'IA
    // Si config.difficulty existe (tournoi), utiliser les difficultés individuelles
    // Sinon, utiliser aiDifficulty (match simple) avec MEDIUM par défaut
    const difficultyLeft = (config.difficulty?.[0] as AIDifficultyLevel) || config.aiDifficulty || 'MEDIUM';
    const difficultyRight = (config.difficulty?.[1] as AIDifficultyLevel) || config.aiDifficulty || 'MEDIUM';

    // Récupérer les avatars (si fournis)
    const avatarLeft = config.avatarUrls?.[0] || null;
    const avatarRight = config.avatarUrls?.[1] || null;

    switch (config.mode) {
      case "PvIA":
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, paddleSpeed, config.name[0], avatarLeft);
        this.playerRight = new PlayerAI("R", this._DO.matchElement, dim, paddleSpeed, config.name[1], difficultyRight);
        break;
      case "IAvP":
        this.playerLeft = new PlayerAI("L", this._DO.matchElement, dim, paddleSpeed, config.name[0], difficultyLeft);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, paddleSpeed, config.name[1], avatarRight);
        break;
      case "IAvIA":
        this.playerLeft = new PlayerAI("L", this._DO.matchElement, dim, paddleSpeed, config.name[0], difficultyLeft);
        this.playerRight = new PlayerAI("R", this._DO.matchElement, dim, paddleSpeed, config.name[1], difficultyRight);
        break;
      default: // PvP
        this.playerLeft = new PlayerHuman("L", this._DO.matchElement, dim, paddleSpeed, config.name[0], avatarLeft);
        this.playerRight = new PlayerHuman("R", this._DO.matchElement, dim, paddleSpeed, config.name[1], avatarRight);
    }

    // Initialisation de la balle
    this.ball = new Ball(dim);

    // Gestion du resize
    window.addEventListener("resize", this.resizeHandler);

    // Charger la customization PUIS démarrer le jeu
    this.loadAndApplyCustomization().then(() => {
      this.loop();
    });
  }

  // -------------------------
  // Chargement de la customization
  // -------------------------
  private async loadAndApplyCustomization() {
    try {
      const response = await fetch('/api/customization/pong', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          applyCustomization(data.data);
          this.applyBorderStyles();
        } else {
          applyCustomization(null);
          this.applyBorderStyles();
        }
      } else {
        applyCustomization(null);
        this.applyBorderStyles();
      }
    } catch (error) {
      applyCustomization(null);
      this.applyBorderStyles();
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
    }, BALL_RESET_DELAY);
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
    ctx.fillStyle = COLORS.TEXT;  // Utilise la couleur personnalisée
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.playerLeft.get_score()} - ${this.playerRight.get_score()}`, this.field.width / 2, 30);

    // Afficher la vitesse de la balle en bas du terrain
    const ballSpeed = this.ball.getSpeed();
    const speedMultiplier = this.ball.getSpeedMultiplier();
    const speedPercentage = Math.round(speedMultiplier * 100);
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Vitesse: ${speedPercentage}%`, this.field.width / 2, this.field.height - 15);
  }

  // -------------------------
  // Boucle principale
  // -------------------------
  private loop() {
    this.update();
    this.draw();

    // Vérifier si le match est terminé
    if (this.playerLeft.get_score() >= WINNING_SCORE || this.playerRight.get_score() >= WINNING_SCORE) {
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