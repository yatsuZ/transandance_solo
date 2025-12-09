import { DOMElements } from '../core/dom-elements.js';
import { activeAnotherPage } from '../navigation/page-manager.js';
import { updateUrl } from '../utils/url-helpers.js';
import { TronPlayerHuman, TronPlayerAI, TronPlayerBase, type AIDifficultyLevel } from './tron-player.js';
import { GAMEPLAY, GAME_SPEED, GRID_SIZE, SPEED_INCREASE_INTERVAL, SPEED_INCREASE_RATE, MIN_GAME_SPEED } from './tron-config.js';
import { applyCustomization, COLORS } from './config/colors-config.js';
import { applyGameplayCustomization } from './config/gameplay-config.js';

export interface TronPlayer {
  id: number;
  name: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  trail: { x: number; y: number }[];
  color: string;
  alive: boolean;
  score: number;
}

export interface TronConfig {
  mode: "PvP" | "PvIA" | "IAvP" | "IAvIA";
  name: [string, string];
  aiDifficulty?: AIDifficultyLevel;
  difficulty?: [string | undefined, string | undefined];
  authenticatedPlayerSide?: 'left' | 'right' | null;
  avatarUrls?: [string | null, string | null];
}

export class TronGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private _DO: DOMElements;

  private playerLeft: TronPlayer;
  private playerRight: TronPlayer;

  private playerLeftInstance!: TronPlayerBase;
  private playerRightInstance!: TronPlayerBase;

  private gridSize: number = GRID_SIZE;
  private gameSpeed: number = GAME_SPEED;
  private gameLoop: number | null = null;
  private speedIncreaseTimer: number | null = null;
  private roundResetTimeout: number | null = null;
  private isStopped: boolean = false;

  private onGameEnd: () => void;

  private scoreLeftEl: HTMLElement | null;
  private scoreRightEl: HTMLElement | null;

  private gridWidth: number;
  private gridHeight: number;

  private config: TronConfig;
  private powerupsEnabled: boolean = false;

  constructor(dO: DOMElements, config: TronConfig, onGameEnd: () => void) {
    this._DO = dO;
    this.onGameEnd = onGameEnd;
    this.config = config;


    // Réinitialiser les compteurs de bots
    TronPlayerAI.resetBotCounters();

    // Canvas
    this.canvas = document.getElementById('tron-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas tron-canvas introuvable!');
    }
    this.ctx = this.canvas.getContext('2d')!;

    this.gridWidth = Math.floor(this.canvas.width / this.gridSize);
    this.gridHeight = Math.floor(this.canvas.height / this.gridSize);

    // Score elements
    this.scoreLeftEl = document.getElementById('score-tron-left');
    this.scoreRightEl = document.getElementById('score-tron-right');

    // Init player data
    this.playerLeft = {
      id: 1,
      name: config.name[0],
      x: 10,
      y: Math.floor(this.gridHeight / 2),
      direction: 'right',
      trail: [],
      color: COLORS.TRAIL_LEFT,
      alive: true,
      score: 0
    };

    this.playerRight = {
      id: 2,
      name: config.name[1],
      x: this.gridWidth - 10,
      y: Math.floor(this.gridHeight / 2),
      direction: 'left',
      trail: [],
      color: COLORS.TRAIL_RIGHT,
      alive: true,
      score: 0
    };

    // Charger la customization PUIS créer les joueurs et démarrer le jeu
    this.loadAndApplyCustomization().then(() => {
      this.createPlayers();
      this.start();
    });
  }

  /**
   * Crée les instances de joueurs selon le mode de jeu
   */
  private createPlayers(): void {
    // Récupérer les cartes joueurs
    const playerCards = {
      playerCardL: document.getElementById('player-Left-Card-Tron')!,
      playerCardR: document.getElementById('player-Right-Card-Tron')!
    };

    // Récupérer les difficultés de l'IA
    const difficultyLeft = (this.config.difficulty?.[0] as AIDifficultyLevel) || this.config.aiDifficulty || 'MEDIUM';
    const difficultyRight = (this.config.difficulty?.[1] as AIDifficultyLevel) || this.config.aiDifficulty || 'MEDIUM';

    // Récupérer les avatars
    const avatarLeft = this.config.avatarUrls?.[0] || null;
    const avatarRight = this.config.avatarUrls?.[1] || null;


    // Créer les instances de joueurs selon le mode
    switch (this.config.mode) {
      case "PvIA":
        this.playerLeftInstance = new TronPlayerHuman("L", playerCards, this.config.name[0], this.playerLeft, avatarLeft, this.powerupsEnabled);
        this.playerRightInstance = new TronPlayerAI("R", playerCards, this.config.name[1], this.playerRight, difficultyRight, this.powerupsEnabled);
        break;
      case "IAvP":
        this.playerLeftInstance = new TronPlayerAI("L", playerCards, this.config.name[0], this.playerLeft, difficultyLeft, this.powerupsEnabled);
        this.playerRightInstance = new TronPlayerHuman("R", playerCards, this.config.name[1], this.playerRight, avatarRight, this.powerupsEnabled);
        break;
      case "IAvIA":
        this.playerLeftInstance = new TronPlayerAI("L", playerCards, this.config.name[0], this.playerLeft, difficultyLeft, this.powerupsEnabled);
        this.playerRightInstance = new TronPlayerAI("R", playerCards, this.config.name[1], this.playerRight, difficultyRight, this.powerupsEnabled);
        break;
      default: // PvP
        this.playerLeftInstance = new TronPlayerHuman("L", playerCards, this.config.name[0], this.playerLeft, avatarLeft, this.powerupsEnabled);
        this.playerRightInstance = new TronPlayerHuman("R", playerCards, this.config.name[1], this.playerRight, avatarRight, this.powerupsEnabled);
    }

    // Configurer les indicateurs de boost pour les joueurs humains
    this.setupBoostIndicators();
  }

  /**
   * Configure les indicateurs de boost dans l'UI
   */
  private setupBoostIndicators(): void {
    const boostIndicatorLeft = document.getElementById('boost-indicator-left');
    const boostIndicatorRight = document.getElementById('boost-indicator-right');

    // Configurer indicateur gauche (Human ou AI)
    if (this.powerupsEnabled && boostIndicatorLeft) {
      boostIndicatorLeft.style.display = 'block';
      const fillBar = boostIndicatorLeft.querySelector('.boost-cooldown-fill') as HTMLElement;
      const hintEl = boostIndicatorLeft.querySelector('.boost-hint') as HTMLElement;

      if (this.playerLeftInstance instanceof TronPlayerHuman) {
        this.playerLeftInstance.onBoostStart = () => {
          boostIndicatorLeft.classList.add('boosting');
          boostIndicatorLeft.classList.remove('cooldown');
        };

        this.playerLeftInstance.onBoostEnd = () => {
          boostIndicatorLeft.classList.remove('boosting');
          boostIndicatorLeft.classList.add('cooldown');
          this.animateCooldownHuman(fillBar, this.playerLeftInstance as TronPlayerHuman);
        };

        this.playerLeftInstance.onCooldownEnd = () => {
          boostIndicatorLeft.classList.remove('cooldown');
          if (fillBar) fillBar.style.width = '100%';
        };
      } else if (this.playerLeftInstance instanceof TronPlayerAI) {
        // Changer le hint pour l'IA
        if (hintEl) hintEl.textContent = 'IA - Auto';

        this.playerLeftInstance.onBoostStart = () => {
          boostIndicatorLeft.classList.add('boosting');
          boostIndicatorLeft.classList.remove('cooldown');
        };

        this.playerLeftInstance.onBoostEnd = () => {
          boostIndicatorLeft.classList.remove('boosting');
          boostIndicatorLeft.classList.add('cooldown');
          this.animateCooldownAI(fillBar, this.playerLeftInstance as TronPlayerAI);
        };

        this.playerLeftInstance.onCooldownEnd = () => {
          boostIndicatorLeft.classList.remove('cooldown');
          if (fillBar) fillBar.style.width = '100%';
        };
      }
    }

    // Configurer indicateur droit (Human ou AI)
    if (this.powerupsEnabled && boostIndicatorRight) {
      boostIndicatorRight.style.display = 'block';
      const fillBar = boostIndicatorRight.querySelector('.boost-cooldown-fill') as HTMLElement;
      const hintEl = boostIndicatorRight.querySelector('.boost-hint') as HTMLElement;

      if (this.playerRightInstance instanceof TronPlayerHuman) {
        this.playerRightInstance.onBoostStart = () => {
          boostIndicatorRight.classList.add('boosting');
          boostIndicatorRight.classList.remove('cooldown');
        };

        this.playerRightInstance.onBoostEnd = () => {
          boostIndicatorRight.classList.remove('boosting');
          boostIndicatorRight.classList.add('cooldown');
          this.animateCooldownHuman(fillBar, this.playerRightInstance as TronPlayerHuman);
        };

        this.playerRightInstance.onCooldownEnd = () => {
          boostIndicatorRight.classList.remove('cooldown');
          if (fillBar) fillBar.style.width = '100%';
        };
      } else if (this.playerRightInstance instanceof TronPlayerAI) {
        // Changer le hint pour l'IA
        if (hintEl) hintEl.textContent = 'IA - Auto';

        this.playerRightInstance.onBoostStart = () => {
          boostIndicatorRight.classList.add('boosting');
          boostIndicatorRight.classList.remove('cooldown');
        };

        this.playerRightInstance.onBoostEnd = () => {
          boostIndicatorRight.classList.remove('boosting');
          boostIndicatorRight.classList.add('cooldown');
          this.animateCooldownAI(fillBar, this.playerRightInstance as TronPlayerAI);
        };

        this.playerRightInstance.onCooldownEnd = () => {
          boostIndicatorRight.classList.remove('cooldown');
          if (fillBar) fillBar.style.width = '100%';
        };
      }
    }
  }

  /**
   * Anime la barre de cooldown pour un joueur humain
   */
  private animateCooldownHuman(fillBar: HTMLElement, player: TronPlayerHuman): void {
    if (!fillBar) return;

    const updateBar = () => {
      if (!player.isOnCooldown()) {
        fillBar.style.width = '100%';
        return;
      }

      const progress = player.getCooldownProgress();
      fillBar.style.width = `${(1 - progress) * 100}%`;

      requestAnimationFrame(updateBar);
    };

    updateBar();
  }

  /**
   * Anime la barre de cooldown pour une IA
   */
  private animateCooldownAI(fillBar: HTMLElement, player: TronPlayerAI): void {
    if (!fillBar) return;

    const updateBar = () => {
      if (!player.isOnCooldown()) {
        fillBar.style.width = '100%';
        return;
      }

      const progress = player.getCooldownProgress();
      fillBar.style.width = `${(1 - progress) * 100}%`;

      requestAnimationFrame(updateBar);
    };

    updateBar();
  }


  // -------------------------
  // Chargement de la customization
  // -------------------------
  private async loadAndApplyCustomization() {
    try {
      const response = await fetch('/api/customization/tron', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          applyCustomization(data.data);
          applyGameplayCustomization(data.data);
          this.powerupsEnabled = data.data.powerups_enabled ?? false;
          this.applyBorderStyles();
        } else {
          applyCustomization(null);
          applyGameplayCustomization(null);
          this.powerupsEnabled = false;
          this.applyBorderStyles();
        }
      } else {
        applyCustomization(null);
        applyGameplayCustomization(null);
        this.powerupsEnabled = false;
        this.applyBorderStyles();
      }
    } catch (error) {
      applyCustomization(null);
      applyGameplayCustomization(null);
      this.powerupsEnabled = false;
      this.applyBorderStyles();
    }
  }

  /**
   * Applique les couleurs de bordure aux éléments CSS
   */
  private applyBorderStyles() {
    // Appliquer la bordure du terrain (canvas)
    if (this.canvas) {
      this.canvas.style.border = `3px solid ${COLORS.GRID}`;
    }

    // Appliquer les bordures des cartes joueurs
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
      (card as HTMLElement).style.border = `2px solid ${COLORS.CARD_BORDER}`;
    });
  }

  private start(): void {
    // Afficher le countdown avant de démarrer
    this.showCountdown(3, () => {
      this.gameLoop = window.setInterval(() => {
        this.update();
        this.render();
      }, this.gameSpeed);

      // Démarrer l'accélération progressive
      this.startSpeedIncrease();
    });
  }

  /**
   * Affiche un compte à rebours avant le début du jeu
   */
  private showCountdown(count: number, onComplete: () => void): void {
    // Dessiner le terrain vide avec les joueurs
    this.render();

    // Afficher le countdown
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = 'bold 120px Orbitron, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = COLORS.TEXT;

    const text = count > 0 ? count.toString() : 'GO!';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

    this.ctx.shadowBlur = 0;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';

    if (count > 0) {
      setTimeout(() => this.showCountdown(count - 1, onComplete), 1000);
    } else {
      setTimeout(onComplete, 500);
    }
  }

  /**
   * Démarre l'accélération progressive du jeu
   */
  private startSpeedIncrease(): void {
    this.speedIncreaseTimer = window.setInterval(() => {
      if (this.gameSpeed > MIN_GAME_SPEED) {
        // Accélérer le jeu
        this.gameSpeed = Math.max(MIN_GAME_SPEED, Math.floor(this.gameSpeed * SPEED_INCREASE_RATE));

        // Redémarrer le game loop avec la nouvelle vitesse
        if (this.gameLoop) {
          clearInterval(this.gameLoop);
          this.gameLoop = window.setInterval(() => {
            this.update();
            this.render();
          }, this.gameSpeed);
        }

      }
    }, SPEED_INCREASE_INTERVAL);
  }

  public stop(reason?: string): void {
    // Éviter les arrêts multiples
    if (this.isStopped) return;
    this.isStopped = true;


    // Annuler le timeout de reset du round (évite de redémarrer le jeu après un stop)
    if (this.roundResetTimeout) {
      clearTimeout(this.roundResetTimeout);
      this.roundResetTimeout = null;
    }

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    // Arrêter l'accélération
    if (this.speedIncreaseTimer) {
      clearInterval(this.speedIncreaseTimer);
      this.speedIncreaseTimer = null;
    }

    // Nettoyer les event listeners des joueurs
    if (this.playerLeftInstance instanceof TronPlayerHuman) {
      this.playerLeftInstance.cleanup();
    }
    if (this.playerRightInstance instanceof TronPlayerHuman) {
      this.playerRightInstance.cleanup();
    }
  }

  private update(): void {
    // Créer la grille d'état pour l'IA
    const gridState = this.createGridState();

    // Mettre à jour les décisions des joueurs (IA principalement)
    this.playerLeftInstance.update(gridState, this.playerRight);
    this.playerRightInstance.update(gridState, this.playerLeft);

    // Déplacer les joueurs
    this.movePlayer(this.playerLeft);
    this.movePlayer(this.playerRight);

    // Vérifier collisions
    this.checkCollisions();

    // Vérifier fin du round
    if (!this.playerLeft.alive || !this.playerRight.alive) {
      this.endRound();
    }
  }

  /**
   * Crée une grille représentant l'état du terrain
   * true = occupé (mur, trace), false = libre
   */
  private createGridState(): boolean[][] {
    const grid: boolean[][] = [];

    // Initialiser la grille avec des false
    for (let y = 0; y < this.gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        grid[y][x] = false;
      }
    }

    // Marquer les traces des joueurs comme occupées
    this.playerLeft.trail.forEach(point => {
      if (point.y >= 0 && point.y < this.gridHeight && point.x >= 0 && point.x < this.gridWidth) {
        grid[point.y][point.x] = true;
      }
    });

    this.playerRight.trail.forEach(point => {
      if (point.y >= 0 && point.y < this.gridHeight && point.x >= 0 && point.x < this.gridWidth) {
        grid[point.y][point.x] = true;
      }
    });

    return grid;
  }

  private movePlayer(player: TronPlayer): void {
    if (!player.alive) return;

    // Vérifier si le joueur est en boost (Human ou AI)
    const playerInstance = player.id === 1 ? this.playerLeftInstance : this.playerRightInstance;
    const isBoosting = (playerInstance instanceof TronPlayerHuman || playerInstance instanceof TronPlayerAI) && playerInstance.getIsBoosting();
    const moveAmount = isBoosting ? 2 : 1;

    // Déplacer (avec boost = 2 cases)
    for (let i = 0; i < moveAmount; i++) {
      // Sauvegarder position actuelle dans la trace
      player.trail.push({ x: player.x, y: player.y });

      // Déplacer d'une case
      switch (player.direction) {
        case 'up':
          player.y -= 1;
          break;
        case 'down':
          player.y += 1;
          break;
        case 'left':
          player.x -= 1;
          break;
        case 'right':
          player.x += 1;
          break;
      }
    }
  }

  private checkCollisions(): void {
    const maxX = Math.floor(this.canvas.width / this.gridSize);
    const maxY = Math.floor(this.canvas.height / this.gridSize);

    let leftCollided = false;
    let rightCollided = false;

    // Vérifier collision tête-à-tête (même position)
    if (this.playerLeft.alive && this.playerRight.alive) {
      if (this.playerLeft.x === this.playerRight.x && this.playerLeft.y === this.playerRight.y) {
        leftCollided = true;
        rightCollided = true;
      }
    }

    // Vérifier croisement des traces (quand les joueurs passent l'un à travers l'autre)
    if (this.playerLeft.alive && this.playerRight.alive && !leftCollided && !rightCollided) {
      // Récupérer les dernières positions ajoutées ce tour (1 ou 2 selon boost)
      const leftNewTrail = this.getNewTrailPositions(this.playerLeft);
      const rightNewTrail = this.getNewTrailPositions(this.playerRight);

      // Vérifier si les nouvelles traces se croisent
      for (const leftPos of leftNewTrail) {
        for (const rightPos of rightNewTrail) {
          if (leftPos.x === rightPos.x && leftPos.y === rightPos.y) {
            leftCollided = true;
            rightCollided = true;
            break;
          }
        }
        if (leftCollided) break;
      }

      // Vérifier si la tête de l'un passe sur la nouvelle trace de l'autre
      if (!leftCollided) {
        for (const rightPos of rightNewTrail) {
          if (this.playerLeft.x === rightPos.x && this.playerLeft.y === rightPos.y) {
            leftCollided = true;
            break;
          }
        }
      }

      if (!rightCollided) {
        for (const leftPos of leftNewTrail) {
          if (this.playerRight.x === leftPos.x && this.playerRight.y === leftPos.y) {
            rightCollided = true;
            break;
          }
        }
      }
    }

    // Vérifier collisions pour joueur gauche
    if (this.playerLeft.alive && !leftCollided) {
      // Collision avec bords
      if (this.playerLeft.x < 0 || this.playerLeft.x >= maxX || this.playerLeft.y < 0 || this.playerLeft.y >= maxY) {
        leftCollided = true;
      }
      // Collision avec sa propre trace (sauf les 2 dernières positions pour éviter auto-collision en boost)
      else if (this.checkTrailCollision(this.playerLeft, this.playerLeft.trail.slice(0, -2))) {
        leftCollided = true;
      }
      // Collision avec trace adverse complète
      else if (this.checkTrailCollision(this.playerLeft, this.playerRight.trail)) {
        leftCollided = true;
      }
    }

    // Vérifier collisions pour joueur droit
    if (this.playerRight.alive && !rightCollided) {
      // Collision avec bords
      if (this.playerRight.x < 0 || this.playerRight.x >= maxX || this.playerRight.y < 0 || this.playerRight.y >= maxY) {
        rightCollided = true;
      }
      // Collision avec sa propre trace (sauf les 2 dernières positions)
      else if (this.checkTrailCollision(this.playerRight, this.playerRight.trail.slice(0, -2))) {
        rightCollided = true;
      }
      // Collision avec trace adverse complète
      else if (this.checkTrailCollision(this.playerRight, this.playerLeft.trail)) {
        rightCollided = true;
      }
    }

    // Collision face à face (égalité)
    if (leftCollided && rightCollided) {
      this.playerLeft.alive = false;
      this.playerRight.alive = false;
    }
    // Seulement joueur gauche
    else if (leftCollided) {
      this.playerLeft.alive = false;
    }
    // Seulement joueur droit
    else if (rightCollided) {
      this.playerRight.alive = false;
    }
  }

  /**
   * Récupère les positions ajoutées lors du dernier mouvement (1 ou 2 selon boost)
   */
  private getNewTrailPositions(player: TronPlayer): { x: number; y: number }[] {
    const playerInstance = player.id === 1 ? this.playerLeftInstance : this.playerRightInstance;
    const isBoosting = (playerInstance instanceof TronPlayerHuman || playerInstance instanceof TronPlayerAI) && playerInstance.getIsBoosting();
    const moveAmount = isBoosting ? 2 : 1;

    // Retourner les dernières positions de la trace
    return player.trail.slice(-moveAmount);
  }

  private checkTrailCollision(player: TronPlayer, trail: { x: number; y: number }[]): boolean {
    return trail.some(point => point.x === player.x && point.y === player.y);
  }

  private render(): void {
    // Clear
    this.ctx.fillStyle = COLORS.FIELD;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grille (optionnel)
    this.drawGrid();

    // Dessiner traces
    this.drawTrail(this.playerLeft);
    this.drawTrail(this.playerRight);

    // Dessiner joueurs (tête)
    this.drawPlayer(this.playerLeft);
    this.drawPlayer(this.playerRight);

    // Scores
    this.drawScores();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = COLORS.GRID;
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  private drawTrail(player: TronPlayer): void {
    this.ctx.fillStyle = player.color;
    player.trail.forEach(point => {
      this.ctx.fillRect(
        point.x * this.gridSize,
        point.y * this.gridSize,
        this.gridSize,
        this.gridSize
      );
    });
  }

  private drawPlayer(player: TronPlayer): void {
    if (!player.alive) return;

    // Utiliser une couleur différente pour la tête
    const headColor = player.id === 1 ? COLORS.HEAD_LEFT : COLORS.HEAD_RIGHT;

    this.ctx.fillStyle = headColor;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = headColor;
    this.ctx.fillRect(
      player.x * this.gridSize,
      player.y * this.gridSize,
      this.gridSize,
      this.gridSize
    );
    this.ctx.shadowBlur = 0;
  }

  private drawScores(): void {
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = '24px Orbitron, monospace';
    this.ctx.fillText(
      `${this.playerLeft.name}`,
      20,
      30
    );
    this.ctx.fillText(
      `${this.playerRight.name}`,
      this.canvas.width - 200,
      30
    );

    // Afficher la vitesse en bas du canvas (comme Pong)
    const speedPercentage = Math.round((GAME_SPEED / this.gameSpeed) * 100);
    this.ctx.font = '18px Orbitron, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(`Vitesse: ${speedPercentage}%`, this.canvas.width / 2, this.canvas.height - 15);
    this.ctx.textAlign = 'left'; // Reset
    this.ctx.textBaseline = 'alphabetic'; // Reset
  }

  private endRound(): void {
    // Arrêter temporairement le jeu
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    // Déterminer le gagnant du round
    if (this.playerLeft.alive && !this.playerRight.alive) {
      // Joueur gauche gagne le round
      this.playerLeft.score++;
    } else if (!this.playerLeft.alive && this.playerRight.alive) {
      // Joueur droit gagne le round
      this.playerRight.score++;
    } else {
      // Égalité - aucun point
    }

    // Mettre à jour l'affichage des scores
    this.updateScoreDisplay();

    // Vérifier si le match est terminé (un joueur a atteint WINNING_SCORE)
    if (this.playerLeft.score >= GAMEPLAY.WINNING_SCORE || this.playerRight.score >= GAMEPLAY.WINNING_SCORE) {
      this.endMatch();
    } else {
      // Continuer avec un nouveau round après un délai
      this.roundResetTimeout = window.setTimeout(() => {
        // Vérifier que le jeu n'a pas été arrêté entre temps
        if (!this.isStopped) {
          this.resetRound();
        }
      }, GAMEPLAY.ROUND_DELAY);
    }
  }

  private endMatch(): void {
    this.stop('fin du match');

    // Rediriger vers la page result
    this.goToResult();

    this.onGameEnd();
  }

  private resetRound(): void {

    // Réinitialiser la vitesse à la vitesse de base
    this.gameSpeed = GAME_SPEED;

    // Arrêter l'ancien timer d'accélération
    if (this.speedIncreaseTimer) {
      clearInterval(this.speedIncreaseTimer);
      this.speedIncreaseTimer = null;
    }

    // Réinitialiser les positions et états des joueurs
    this.playerLeft.x = 10;
    this.playerLeft.y = Math.floor(this.canvas.height / this.gridSize / 2);
    this.playerLeft.direction = 'right';
    this.playerLeft.trail = [];
    this.playerLeft.alive = true;

    this.playerRight.x = Math.floor(this.canvas.width / this.gridSize) - 10;
    this.playerRight.y = Math.floor(this.canvas.height / this.gridSize / 2);
    this.playerRight.direction = 'left';
    this.playerRight.trail = [];
    this.playerRight.alive = true;

    // Redémarrer le jeu
    this.gameLoop = window.setInterval(() => {
      this.update();
      this.render();
    }, this.gameSpeed);

    // Redémarrer l'accélération progressive pour ce nouveau round
    this.startSpeedIncrease();
  }

  private updateScoreDisplay(): void {
    if (this.scoreLeftEl) {
      this.scoreLeftEl.textContent = this.playerLeft.score.toString();
    }
    if (this.scoreRightEl) {
      this.scoreRightEl.textContent = this.playerRight.score.toString();
    }
  }

  private goToResult(): void {
    const resultPage = this._DO.pages.result;
    activeAnotherPage(resultPage);
    updateUrl(resultPage, '/match');

    // Déterminer le gagnant basé sur le score
    const winnerName = this.playerLeft.score > this.playerRight.score ? this.playerLeft.name : this.playerRight.name;
    const { winnerNameEl, player1NameEl, player1ScoreEl, player2NameEl, player2ScoreEl } = this._DO.resultElement;

    if (winnerNameEl) winnerNameEl.textContent = winnerName;
    if (player1NameEl) player1NameEl.textContent = this.playerLeft.name;
    if (player1ScoreEl) player1ScoreEl.textContent = this.playerLeft.score.toString();
    if (player2NameEl) player2NameEl.textContent = this.playerRight.name;
    if (player2ScoreEl) player2ScoreEl.textContent = this.playerRight.score.toString();
  }

  public getWinner(): TronPlayer | null {
    if (this.playerLeft.score > this.playerRight.score) {
      return this.playerLeft;
    }
    if (this.playerRight.score > this.playerLeft.score) {
      return this.playerRight;
    }
    return null;
  }

  public getWinnerAndLooser(): { Winner: TronPlayer; Looser: TronPlayer } | null {
    if (this.playerLeft.score > this.playerRight.score) {
      return { Winner: this.playerLeft, Looser: this.playerRight };
    }
    if (this.playerRight.score > this.playerLeft.score) {
      return { Winner: this.playerRight, Looser: this.playerLeft };
    }
    return null;
  }

  public getPlayerLeftScore(): number {
    return this.playerLeft.score;
  }

  public getPlayerRightScore(): number {
    return this.playerRight.score;
  }
}
