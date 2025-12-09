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
    if (this.typePlayer === "HUMAN") {
      // Si PlayerHuman a une avatarUrl, l'utiliser, sinon utiliser l'icône par défaut
      const humanPlayer = this as any;
      this.avatarElement.src = humanPlayer.avatarUrl || "/static/util/icon/profile.png";
    } else {
      this.avatarElement.src = "/static/util/icon/profile_robot.png";
    }
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
  private avatarUrl: string | null;

  constructor(side: "L" | "R", playerCards:{playerCardL: HTMLElement,playerCardR: HTMLElement}, canvasDimension: {height: number, width: number}, speed: number, name: string, avatarUrl: string | null = null, powerupsEnabled: boolean = false)
  {
    super(side, playerCards, canvasDimension, speed, name);
    this.typePlayer = "HUMAN";
    this.avatarUrl = avatarUrl;
    this.input = new InputHandler(side, powerupsEnabled);
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
    const speedMultiplier = this.input.getSpeedMultiplier();
    if (this.input.upPressed) this.paddle.moveUp(speedMultiplier);
    if (this.input.downPressed) this.paddle.moveDown(speedMultiplier);
  }

  /**
   * Retourne true si le joueur est en train de dasher
   */
  public getIsDashing(): boolean {
    return this.input.getIsDashing();
  }

  /**
   * Retourne le pourcentage de cooldown (0 = prêt, 1 = vient de dash)
   */
  public getCooldownProgress(): number {
    return this.input.getCooldownProgress();
  }

  /**
   * Retourne true si en cooldown
   */
  public isOnCooldown(): boolean {
    return this.input.isOnCooldown();
  }

  /**
   * Retourne true si les powerups sont activés
   */
  public arePowerupsEnabled(): boolean {
    return this.input.arePowerupsEnabled();
  }

  /**
   * Accès à l'InputHandler pour les callbacks
   */
  public getInputHandler(): InputHandler {
    return this.input;
  }

  /**
   * Retourne la touche de dash pour l'affichage
   */
  public getDashKey(): string {
    return this.input.getDashKey();
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
  // ========================================
  // PROPRIÉTÉS DE VISION (Contrainte 1/sec)
  // ========================================
  private lastAIUpdate: number = 0;
  private aiUpdateInterval: number = 1000;

  // ========================================
  // PROPRIÉTÉS DE PRÉDICTION
  // ========================================
  private predictedBallY: number = 0;
  private targetY: number = 0;
  private isReturningToCenter: boolean = false;  // Indique si l'IA retourne au centre

  // ========================================
  // CONFIGURATION DE DIFFICULTÉ
  // ========================================
  private difficulty: AIDifficultyLevel;
  private errorMargin: number = 30;
  private reactionDelay: number = 100;

  // ========================================
  // ÉTAT INTERNE
  // ========================================
  private isReacting: boolean = true;
  private fieldHeight: number = 0;

  // ========================================
  // DASH (Power-up)
  // ========================================
  private powerupsEnabled: boolean = false;
  private isDashing: boolean = false;
  private dashCooldown: boolean = false;
  private dashCooldownStartTime: number = 0;

  // Compteur statique pour numéroter les bots de même difficulté
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
    // Générer le nom du bot si non fourni
    const botName = name || PlayerAI.generateBotName(difficulty);

    super(side, playerCards, canvasDimension, speed, botName);
    this.typePlayer = "IA";
    this.difficulty = difficulty;
    this.fieldHeight = canvasDimension.height;
    this.powerupsEnabled = powerupsEnabled;

    // Appliquer la configuration de difficulté
    this.applyDifficulty();

    this.add_to_update();

    // Mise à jour du texte de contrôle pour l'IA
    if (this.movementElement) {
      const config = AI_DIFFICULTY[this.difficulty];
      this.movementElement.textContent = `🤖 ${config.label}`;
    } else {
      console.error('[PlayerAI] Élément de contrôle introuvable');
    }
  }

  /**
   * Génère un nom unique pour un bot selon sa difficulté
   * Ex: "Rookie", "Rookie #2", "Rookie #3"
   */
  private static generateBotName(difficulty: AIDifficultyLevel): string {
    const config = AI_DIFFICULTY[difficulty];
    const baseName = config.botName;

    // Incrémenter le compteur pour cette difficulté
    PlayerAI.botCounters[difficulty]++;
    const count = PlayerAI.botCounters[difficulty];

    // Si c'est le premier bot, pas de numéro
    if (count === 1) {
      return baseName;
    }

    // Sinon, ajouter le numéro
    return `${baseName} #${count}`;
  }

  /**
   * Réinitialise les compteurs de bots (utile entre les matchs)
   */
  public static resetBotCounters(): void {
    PlayerAI.botCounters = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      EXPERT: 0
    };
  }

  /**
   * Applique les paramètres de difficulté depuis game-config.ts
   */
  private applyDifficulty(): void {
    const config = AI_DIFFICULTY[this.difficulty];

    this.aiUpdateInterval = config.aiUpdateInterval;
    this.errorMargin = config.errorMargin;
    this.reactionDelay = config.reactionDelay;

    // ⚠️ PAS de speedMultiplier : tous les paddles ont la MÊME VITESSE (conforme au sujet)
  }

  /**
   * Update appelée chaque frame
   * ✅ Respecte la contrainte "1 vision/seconde"
   */
  update(ball: Ball): void {
    const now = Date.now();

    // ⏱️ Vision limitée à l'intervalle configuré (respecte la contrainte du sujet)
    if (now - this.lastAIUpdate >= this.aiUpdateInterval) {
      this.updateAI(ball);
      this.lastAIUpdate = now;
    }

    // Déplacement fluide vers la cible (même sans nouvelle vision)
    this.moveTowardsTarget();
  }

  /**
   * Logique IA - Appelée 1 fois par seconde (ou selon difficulté)
   * Calcule la stratégie et la cible à atteindre
   */
  private updateAI(ball: Ball): void {
    // Prédire la position de la balle à l'arrivée
    this.predictedBallY = this.predictBallPosition(ball);

    // Ajouter imprécision aléatoire (rendre l'IA battable)
    const randomError = (Math.random() - 0.5) * 2 * this.errorMargin;
    this.targetY = this.predictedBallY + randomError;

    // Stratégie intelligente : retour au centre si balle loin ou s'éloigne
    const distanceToBall = Math.abs(ball.x - this.paddle.position.x);
    const fieldWidth = this.fieldHeight * (4/3); // Ratio 4:3 du terrain

    const isMovingTowards = (this.side === 'R' && ball.velocity.x > 0) ||
                           (this.side === 'L' && ball.velocity.x < 0);

    if (distanceToBall > fieldWidth / 2 || !isMovingTowards) {
      // Balle loin ou s'éloigne → se repositionner au centre
      this.targetY = this.fieldHeight / 2;
      this.isReturningToCenter = true;  // Marquer qu'on retourne au centre
    } else {
      this.isReturningToCenter = false;  // On poursuit activement la balle
    }

    // Simuler délai de réaction (sauf EXPERT qui réagit instantanément)
    if (this.reactionDelay > 0) {
      this.isReacting = false;
      setTimeout(() => {
        this.isReacting = true;
      }, this.reactionDelay);
    } else {
      this.isReacting = true;
    }
  }

  /**
   * Prédit où la balle arrivera à la hauteur du paddle
   * Prend en compte les rebonds haut/bas du terrain
   * Pour EXPERT: anticipe mieux l'accélération de la balle
   */
  private predictBallPosition(ball: Ball): number {
    let ballX = ball.x;
    let ballY = ball.y;
    let velocityX = ball.velocity.x;
    let velocityY = ball.velocity.y;

    // Si la balle s'éloigne, retourner au centre
    const isMovingTowards = (this.side === 'R' && velocityX > 0) ||
                           (this.side === 'L' && velocityX < 0);

    if (!isMovingTowards || Math.abs(velocityX) < 0.1) {
      return this.fieldHeight / 2;
    }

    // Calculer le temps avant arrivée au paddle
    const paddleX = this.paddle.position.x;
    const deltaX = Math.abs(paddleX - ballX);

    // Pour EXPERT: Anticiper l'accélération de la balle
    // En supposant que la balle peut accélérer pendant le trajet
    let adjustedVelocityX = Math.abs(velocityX);
    if (this.difficulty === 'EXPERT') {
      // Anticiper que la balle peut devenir beaucoup plus rapide
      // Compense l'accélération future en réduisant significativement le temps estimé
      adjustedVelocityX *= 0.85; // 15% de réduction du temps = anticipe accélération
    }

    const timeToReach = deltaX / adjustedVelocityX;

    // Prédire position Y après ce temps
    let predictedY = ballY + (velocityY * timeToReach);

    // Simuler les rebonds haut/bas (la balle rebondit sur les murs)
    const maxIterations = 10; // Éviter boucle infinie si bug
    let iterations = 0;

    while ((predictedY < 0 || predictedY > this.fieldHeight) && iterations < maxIterations) {
      if (predictedY < 0) {
        // Rebond sur mur du haut
        predictedY = Math.abs(predictedY);
        velocityY = -velocityY;
      }
      if (predictedY > this.fieldHeight) {
        // Rebond sur mur du bas
        predictedY = 2 * this.fieldHeight - predictedY;
        velocityY = -velocityY;
      }
      iterations++;
    }

    // Sécurité : s'assurer que la prédiction reste dans les limites
    predictedY = Math.max(0, Math.min(this.fieldHeight, predictedY));

    return predictedY;
  }

  /**
   * Déplace le paddle vers la cible de manière fluide
   * Appelée chaque frame (mais la cible est définie 1x/sec)
   */
  private moveTowardsTarget(): void {
    // Ne pas bouger si en délai de réaction
    if (!this.isReacting) {
      return;
    }

    const paddleCenter = this.paddle.position.y + this.paddle.height / 2;
    const diff = this.targetY - paddleCenter;

    // Zone morte adaptée au contexte
    let deadZone: number;

    if (this.isReturningToCenter) {
      // Quand on retourne au centre (pas de balle à intercepter),
      // zone morte beaucoup plus grande pour éviter les oscillations
      deadZone = 30;
    } else {
      // Quand on poursuit la balle, zone morte normale selon difficulté
      deadZone = this.difficulty === 'EXPERT' ? 4 : 5;
    }

    if (Math.abs(diff) < deadZone) {
      return;
    }

    // Vérifier si l'IA devrait utiliser le dash
    const speedMultiplier = this.shouldDash(diff) ? DASH_SPEED_MULTIPLIER : 1;

    // Déplacer vers haut ou bas
    if (diff > 0) {
      this.paddle.moveDown(speedMultiplier);
    } else {
      this.paddle.moveUp(speedMultiplier);
    }
  }

  /**
   * Décide si l'IA devrait utiliser le dash
   * Stratégie basée sur la difficulté et la distance à parcourir
   */
  private shouldDash(distanceToTarget: number): boolean {
    if (!this.powerupsEnabled || this.dashCooldown || this.isDashing) {
      return false;
    }

    const absDistance = Math.abs(distanceToTarget);

    // Seuil de distance pour déclencher le dash (selon difficulté)
    let dashThreshold: number;
    let dashProbability: number;

    switch (this.difficulty) {
      case 'EASY':
        // IA facile : dash rare, seuil élevé
        dashThreshold = this.fieldHeight * 0.5;
        dashProbability = 0.2;
        break;
      case 'MEDIUM':
        // IA moyenne : dash occasionnel
        dashThreshold = this.fieldHeight * 0.35;
        dashProbability = 0.4;
        break;
      case 'HARD':
        // IA difficile : dash fréquent
        dashThreshold = this.fieldHeight * 0.25;
        dashProbability = 0.6;
        break;
      case 'EXPERT':
        // IA expert : dash stratégique et fréquent
        dashThreshold = this.fieldHeight * 0.2;
        dashProbability = 0.8;
        break;
      default:
        dashThreshold = this.fieldHeight * 0.35;
        dashProbability = 0.4;
    }

    // Si pas en retour au centre et distance suffisante
    if (!this.isReturningToCenter && absDistance > dashThreshold) {
      // Probabilité de dash pour rendre l'IA moins prévisible
      if (Math.random() < dashProbability) {
        this.triggerDash();
        return true;
      }
    }

    return this.isDashing;
  }

  /**
   * Déclenche un dash pour l'IA
   */
  private triggerDash(): void {
    if (this.isDashing || this.dashCooldown) return;

    console.log(`[IA DASH] ${this.name} utilise le dash !`);

    this.isDashing = true;
    this.dashCooldown = true;
    this.dashCooldownStartTime = Date.now();

    // Fin du dash
    setTimeout(() => {
      this.isDashing = false;
    }, DASH_DURATION);

    // Cooldown
    setTimeout(() => {
      this.dashCooldown = false;
    }, DASH_COOLDOWN);
  }

  /**
   * Retourne true si l'IA est en train de dasher
   */
  public getIsDashing(): boolean {
    return this.isDashing;
  }

  /**
   * Retourne le pourcentage de cooldown (0 = prêt, 1 = vient de dash)
   */
  public getCooldownProgress(): number {
    if (!this.dashCooldown) return 0;
    const elapsed = Date.now() - this.dashCooldownStartTime;
    return Math.max(0, 1 - elapsed / DASH_COOLDOWN);
  }

  /**
   * Retourne true si en cooldown
   */
  public isOnCooldown(): boolean {
    return this.dashCooldown;
  }

  /**
   * Retourne true si les powerups sont activés
   */
  public arePowerupsEnabled(): boolean {
    return this.powerupsEnabled;
  }

  /**
   * Met à jour la hauteur du terrain lors du redimensionnement
   */
  onResize(newDimensions: { width: number; height: number }): void {
    super.onResize(newDimensions);
    this.fieldHeight = newDimensions.height;
  }
}
