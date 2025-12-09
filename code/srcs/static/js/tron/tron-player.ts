import { DOMElements } from '../core/dom-elements.js';
import { TronPlayer } from './tron-game.js';
import { AI_DIFFICULTY, type AIDifficultyLevel } from './tron-config.js';
import { uiPreferences } from '../core/ui-preferences.js';

export type PlayerSide = "L" | "R";
export type PlayerType = "IA" | "HUMAN";
export type { AIDifficultyLevel };

type ControlKeys = {
  up: string;
  down: string;
  left: string;
  right: string;
};

// Configuration du Boost (exportées pour l'UI et l'IA)
export const BOOST_DURATION = 300; // ms de durée du boost
export const BOOST_COOLDOWN = 2000; // ms avant de pouvoir re-boost
export const BOOST_DOUBLE_TAP_DELAY = 300; // ms max entre 2 appuis pour déclencher le boost

/**
 * Classe de base pour les joueurs Tron
 */
export abstract class TronPlayerBase {
  public readonly side: PlayerSide;
  public readonly name: string;
  public readonly typePlayer: PlayerType;
  public data: TronPlayer;

  protected playerCard: HTMLElement;
  protected nameElement: HTMLElement | null = null;
  protected typeElement: HTMLElement | null = null;
  protected avatarElement: HTMLImageElement | null = null;
  protected controlsElement: HTMLElement | null = null;

  constructor(side: PlayerSide, playerCards: { playerCardL: HTMLElement, playerCardR: HTMLElement }, name: string, typePlayer: PlayerType, data: TronPlayer) {
    this.side = side;
    this.name = name;
    this.typePlayer = typePlayer;
    this.data = data;

    // Sélection de la carte du joueur
    this.playerCard = side === "L" ? playerCards.playerCardL : playerCards.playerCardR;

    // Récupération des éléments DOM
    this.initDOMElements();
  }

  private initDOMElements(): void {
    if (!this.playerCard) {
      console.error('[TronPlayer] Carte du joueur introuvable');
      return;
    }

    this.nameElement = this.playerCard.querySelector('.player-name');
    this.typeElement = this.playerCard.querySelector('.player-type');
    this.avatarElement = this.playerCard.querySelector('.player-avatar');
    this.controlsElement = this.playerCard.querySelector('.player-controls')?.querySelector('span') ?? null;
  }

  /**
   * Met à jour les informations affichées sur la carte du joueur
   */
  public updateCard(): void {
    if (!this.nameElement || !this.typeElement || !this.avatarElement) {
      console.error('[TronPlayer] Éléments DOM non initialisés');
      return;
    }

    this.nameElement.textContent = this.name;
    this.typeElement.textContent = this.typePlayer === "HUMAN" ? "Humain" : "IA";

    // Mettre à jour l'avatar
    if (this.typePlayer === "HUMAN") {
      const humanPlayer = this as any;
      this.avatarElement.src = humanPlayer.avatarUrl || "/static/util/icon/profile.png";
    } else {
      this.avatarElement.src = "/static/util/icon/profile_robot.png";
    }
  }

  abstract update(gridState: boolean[][], opponent: TronPlayer): void;
}

/**
 * Joueur humain contrôlé au clavier
 */
export class TronPlayerHuman extends TronPlayerBase {
  private avatarUrl: string | null;
  private keydownHandler: (e: KeyboardEvent) => void;
  private keys: ControlKeys;

  // Boost state (double-tap sur même direction)
  private isBoosting: boolean = false;
  private boostCooldown: boolean = false;
  private boostCooldownStartTime: number = 0;
  private powerupsEnabled: boolean = false;

  // Double-tap detection
  private lastKeyPressed: string | null = null;
  private lastKeyTime: number = 0;

  // Callbacks pour notifier l'UI
  public onBoostStart?: () => void;
  public onBoostEnd?: () => void;
  public onCooldownEnd?: () => void;

  constructor(side: PlayerSide, playerCards: { playerCardL: HTMLElement, playerCardR: HTMLElement }, name: string, data: TronPlayer, avatarUrl: string | null = null, powerupsEnabled: boolean = false) {
    super(side, playerCards, name, "HUMAN", data);
    this.avatarUrl = avatarUrl;
    this.powerupsEnabled = powerupsEnabled;

    // Charger les contrôles depuis uiPreferences
    this.keys = this.getCustomKeysOrDefault(side);

    // Configurer les contrôles
    this.keydownHandler = (e: KeyboardEvent) => this.handleKeydown(e);
    window.addEventListener('keydown', this.keydownHandler);

    this.updateCard();

    // Afficher les touches personnalisées (ordre: gauche, haut, droite, bas)
    if (this.controlsElement) {
      const displayKeys = this.getDisplayKeys();
      if (side === 'L') {
        this.controlsElement.innerHTML = `<span class="tron-controls-cyan">${displayKeys.left} ${displayKeys.up} ${displayKeys.right} ${displayKeys.down}</span>`;
      } else {
        this.controlsElement.innerHTML = `<span class="tron-controls-orange">${displayKeys.left} ${displayKeys.up} ${displayKeys.right} ${displayKeys.down}</span>`;
      }
    }

    console.log(`[TRON] TronPlayerHuman créé pour ${side} - powerups: ${powerupsEnabled ? 'ACTIVÉS' : 'désactivés'} (double-tap pour boost)`);
  }

  /**
   * Récupère les touches personnalisées depuis uiPreferences ou les valeurs par défaut
   */
  private getCustomKeysOrDefault(side: PlayerSide): ControlKeys {
    const controls = uiPreferences.getControls();

    if (side === "L") {
      return {
        up: controls.leftUp,
        down: controls.leftDown,
        left: controls.leftLeft,
        right: controls.leftRight
      };
    } else {
      return {
        up: controls.rightUp,
        down: controls.rightDown,
        left: controls.rightLeft,
        right: controls.rightRight
      };
    }
  }

  /**
   * Convertit les touches en format affichable (flèches → ↑↓←→)
   */
  private getDisplayKeys(): ControlKeys {
    const map: Record<string, string> = {
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
    };

    return {
      up: map[this.keys.up] || this.keys.up.toUpperCase(),
      down: map[this.keys.down] || this.keys.down.toUpperCase(),
      left: map[this.keys.left] || this.keys.left.toUpperCase(),
      right: map[this.keys.right] || this.keys.right.toUpperCase(),
    };
  }

  private handleKeydown(e: KeyboardEvent): void {
    const now = Date.now();
    let pressedDirection: 'up' | 'down' | 'left' | 'right' | null = null;

    // Identifier la direction pressée
    if (e.key === this.keys.up) {
      pressedDirection = 'up';
    } else if (e.key === this.keys.down) {
      pressedDirection = 'down';
    } else if (e.key === this.keys.left) {
      pressedDirection = 'left';
    } else if (e.key === this.keys.right) {
      pressedDirection = 'right';
    }

    if (!pressedDirection) return;

    // Vérifier si c'est un double-tap (même touche dans le délai)
    const isDoubleTap = this.powerupsEnabled &&
                        this.lastKeyPressed === e.key &&
                        (now - this.lastKeyTime) <= BOOST_DOUBLE_TAP_DELAY;

    // Mettre à jour le tracking pour le prochain appui
    this.lastKeyPressed = e.key;
    this.lastKeyTime = now;

    // Si double-tap détecté, déclencher le boost
    if (isDoubleTap) {
      this.triggerBoost();
      // Reset pour éviter triple-tap
      this.lastKeyPressed = null;
      this.lastKeyTime = 0;
      return; // Ne pas changer la direction sur le double-tap
    }

    // Changer la direction (pas de demi-tour)
    if (pressedDirection === 'up' && this.data.direction !== 'down') {
      this.data.direction = 'up';
    } else if (pressedDirection === 'down' && this.data.direction !== 'up') {
      this.data.direction = 'down';
    } else if (pressedDirection === 'left' && this.data.direction !== 'right') {
      this.data.direction = 'left';
    } else if (pressedDirection === 'right' && this.data.direction !== 'left') {
      this.data.direction = 'right';
    }
  }

  /**
   * Déclenche un boost de vitesse
   */
  public triggerBoost(): void {
    if (this.isBoosting || this.boostCooldown) return;

    console.log(`[TRON BOOST] Boost déclenché !`);

    this.isBoosting = true;
    this.boostCooldown = true;
    this.boostCooldownStartTime = Date.now();

    // Notifier l'UI
    this.onBoostStart?.();

    // Fin du boost après BOOST_DURATION
    setTimeout(() => {
      this.isBoosting = false;
      this.onBoostEnd?.();
    }, BOOST_DURATION);

    // Cooldown avant de pouvoir re-boost
    setTimeout(() => {
      this.boostCooldown = false;
      this.onCooldownEnd?.();
    }, BOOST_COOLDOWN);
  }

  /**
   * Retourne true si le joueur est en boost
   */
  public getIsBoosting(): boolean {
    return this.isBoosting;
  }

  /**
   * Retourne le pourcentage de cooldown restant (0 = prêt, 1 = vient de boost)
   */
  public getCooldownProgress(): number {
    if (!this.boostCooldown) return 0;
    const elapsed = Date.now() - this.boostCooldownStartTime;
    return Math.max(0, 1 - elapsed / BOOST_COOLDOWN);
  }

  /**
   * Retourne true si le boost est en cooldown
   */
  public isOnCooldown(): boolean {
    return this.boostCooldown;
  }

  /**
   * Retourne true si les powerups sont activés
   */
  public arePowerupsEnabled(): boolean {
    return this.powerupsEnabled;
  }

  update(gridState: boolean[][], opponent: TronPlayer): void {
    // Les humains contrôlent avec le clavier, rien à faire ici
  }

  public cleanup(): void {
    window.removeEventListener('keydown', this.keydownHandler);
  }
}

/**
 * Joueur IA contrôlé par l'ordinateur
 */
export class TronPlayerAI extends TronPlayerBase {
  private difficulty: AIDifficultyLevel;
  private lookAhead: number;
  private randomness: number;
  private updateInterval: number;
  private aggressiveness: number;
  private lastUpdate: number = 0;

  // Boost (Power-up) pour l'IA
  private powerupsEnabled: boolean = false;
  private isBoosting: boolean = false;
  private boostCooldown: boolean = false;
  private boostCooldownStartTime: number = 0;

  // Callbacks pour notifier l'UI (comme TronPlayerHuman)
  public onBoostStart?: () => void;
  public onBoostEnd?: () => void;
  public onCooldownEnd?: () => void;

  private static botCounters: Record<string, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    EXPERT: 0
  };

  constructor(side: PlayerSide, playerCards: { playerCardL: HTMLElement, playerCardR: HTMLElement }, name: string | undefined, data: TronPlayer, difficulty: AIDifficultyLevel = 'MEDIUM', powerupsEnabled: boolean = false) {
    // Générer le nom du bot si non fourni
    const botName = name || TronPlayerAI.generateBotName(difficulty);

    super(side, playerCards, botName, "IA", data);
    this.difficulty = difficulty;
    this.powerupsEnabled = powerupsEnabled;

    const config = AI_DIFFICULTY[this.difficulty];
    this.lookAhead = config.lookAhead;
    this.randomness = config.randomness;
    this.updateInterval = config.updateInterval;
    this.aggressiveness = config.aggressiveness;

    this.updateCard();

    // Afficher le niveau de difficulté
    if (this.controlsElement) {
      this.controlsElement.innerHTML = `🤖 ${config.label}`;
    }

    console.log(`[TRON AI] Bot créé - difficulté: ${difficulty}, powerups: ${powerupsEnabled ? 'ACTIVÉS' : 'désactivés'}`);
  }

  private static generateBotName(difficulty: AIDifficultyLevel): string {
    const config = AI_DIFFICULTY[difficulty];
    const baseName = config.botName;

    TronPlayerAI.botCounters[difficulty]++;
    const count = TronPlayerAI.botCounters[difficulty];

    return count === 1 ? baseName : `${baseName} #${count}`;
  }

  public static resetBotCounters(): void {
    TronPlayerAI.botCounters = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      EXPERT: 0
    };
  }

  /**
   * Met à jour la direction de l'IA
   */
  update(gridState: boolean[][], opponent: TronPlayer): void {
    const now = Date.now();

    // Limiter la fréquence de mise à jour selon la difficulté
    if (now - this.lastUpdate < this.updateInterval) {
      return;
    }
    this.lastUpdate = now;

    // Parfois faire un choix aléatoire (rend l'IA battable)
    if (Math.random() < this.randomness) {
      this.makeRandomDecision(gridState);
      return;
    }

    // Sinon, analyser et choisir la meilleure direction
    this.makeSmartDecision(gridState, opponent);

    // Décider si on utilise le boost (si powerups activés)
    if (this.powerupsEnabled && !this.boostCooldown) {
      this.decideBoost(gridState, opponent);
    }
  }

  /**
   * L'IA décide si elle doit utiliser le boost
   * Stratégie basée sur la difficulté et la situation
   */
  private decideBoost(gridState: boolean[][], opponent: TronPlayer): void {
    // Probabilité de boost selon la difficulté
    const boostProbability: Record<AIDifficultyLevel, number> = {
      EASY: 0.05,      // 5% de chance
      MEDIUM: 0.10,    // 10% de chance
      HARD: 0.20,      // 20% de chance
      EXPERT: 0.30     // 30% de chance
    };

    // Distance à l'adversaire
    const distToOpponent = Math.abs(this.data.x - opponent.x) + Math.abs(this.data.y - opponent.y);

    // Boost plus probable si proche de l'adversaire (stratégie offensive)
    const proximityBonus = distToOpponent < 10 ? 0.1 : 0;

    // Espace libre devant
    const freeSpaceAhead = this.countFreeSpaceInDirection(this.data.direction, gridState);

    // Boost plus probable si beaucoup d'espace devant (safe)
    const safetyBonus = freeSpaceAhead > 5 ? 0.1 : 0;

    const totalProbability = boostProbability[this.difficulty] + proximityBonus + safetyBonus;

    if (Math.random() < totalProbability) {
      this.triggerBoost();
    }
  }

  /**
   * Compte l'espace libre dans une direction donnée
   */
  private countFreeSpaceInDirection(direction: 'up' | 'down' | 'left' | 'right', gridState: boolean[][]): number {
    let x = this.data.x;
    let y = this.data.y;
    let count = 0;

    for (let i = 0; i < 10; i++) {
      switch (direction) {
        case 'up': y--; break;
        case 'down': y++; break;
        case 'left': x--; break;
        case 'right': x++; break;
      }

      if (!this.isValidPosition(x, y, gridState)) {
        break;
      }
      count++;
    }

    return count;
  }

  /**
   * Déclenche un boost pour l'IA
   */
  private triggerBoost(): void {
    if (this.isBoosting || this.boostCooldown) return;

    console.log(`[TRON AI BOOST] Bot ${this.name} boost !`);

    this.isBoosting = true;
    this.boostCooldown = true;
    this.boostCooldownStartTime = Date.now();

    // Notifier l'UI
    this.onBoostStart?.();

    // Fin du boost après BOOST_DURATION
    setTimeout(() => {
      this.isBoosting = false;
      this.onBoostEnd?.();
    }, BOOST_DURATION);

    // Cooldown avant de pouvoir re-boost
    setTimeout(() => {
      this.boostCooldown = false;
      this.onCooldownEnd?.();
    }, BOOST_COOLDOWN);
  }

  /**
   * Retourne le pourcentage de cooldown restant (0 = prêt, 1 = vient de boost)
   */
  public getCooldownProgress(): number {
    if (!this.boostCooldown) return 0;
    const elapsed = Date.now() - this.boostCooldownStartTime;
    return Math.max(0, 1 - elapsed / BOOST_COOLDOWN);
  }

  /**
   * Retourne true si le boost est en cooldown
   */
  public isOnCooldown(): boolean {
    return this.boostCooldown;
  }

  /**
   * Retourne true si l'IA est en boost
   */
  public getIsBoosting(): boolean {
    return this.isBoosting;
  }

  private makeRandomDecision(gridState: boolean[][]): void {
    const possibleDirections = this.getPossibleDirections(gridState);
    if (possibleDirections.length > 0) {
      const randomDir = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      this.data.direction = randomDir;
    }
  }

  private makeSmartDecision(gridState: boolean[][], opponent: TronPlayer): void {
    const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
    const scores: { direction: typeof directions[number], score: number }[] = [];

    for (const dir of directions) {
      // Ne pas faire demi-tour
      if (this.isOppositeDirection(dir, this.data.direction)) {
        continue;
      }

      // Calculer le score pour cette direction
      const score = this.evaluateDirection(dir, gridState, opponent);
      scores.push({ direction: dir, score });
    }

    if (scores.length === 0) return;

    // Choisir la direction avec le meilleur score
    scores.sort((a, b) => b.score - a.score);
    this.data.direction = scores[0].direction;
  }

  private evaluateDirection(dir: 'up' | 'down' | 'left' | 'right', gridState: boolean[][], opponent: TronPlayer): number {
    // Calculer score défensif (sécurité)
    const defensiveScore = this.evaluateDefensive(dir, gridState);

    // Calculer score offensif (agressivité)
    const offensiveScore = this.evaluateOffensive(dir, gridState, opponent);

    // Mixer selon le niveau d'agressivité
    const finalScore = (defensiveScore * (1 - this.aggressiveness)) + (offensiveScore * this.aggressiveness);

    return finalScore;
  }

  /**
   * Évalue la sécurité d'une direction (défensif) - VERSION SIMPLIFIÉE
   */
  private evaluateDefensive(dir: 'up' | 'down' | 'left' | 'right', gridState: boolean[][]): number {
    let score = 0;
    let x = this.data.x;
    let y = this.data.y;

    // STRATÉGIE 1: Éviter les collisions immédiates (3 cases devant)
    for (let i = 0; i < 3; i++) {
      switch (dir) {
        case 'up': y--; break;
        case 'down': y++; break;
        case 'left': x--; break;
        case 'right': x++; break;
      }

      if (!this.isValidPosition(x, y, gridState)) {
        // Collision = très mauvais (plus c'est proche, pire c'est)
        score -= 2000 * (4 - i);
        break;
      }

      // Compter l'espace libre autour
      const freeSpace = this.countFreeSpaceAround(x, y, gridState);

      // Bonus pour espace libre (priorité aux cases proches)
      score += freeSpace * (4 - i) * 20;

      // RÈGLE ANTI-CERCLE : Pénalité si on a peu d'espace autour
      // (évite de tourner en rond et se coincer)
      if (i === 0 && freeSpace <= 2) {
        score -= 500; // Pénalité si on va dans un couloir étroit
      }
    }

    // STRATÉGIE 2: Préférer aller vers les bords/murs au début
    // puis rester au centre ensuite (pattern "mur puis centre")
    const maxX = gridState[0].length - 1;
    const maxY = gridState.length - 1;
    const distToEdge = Math.min(x, y, maxX - x, maxY - y);

    // Si on est loin des bords (> 5 cases), bonus pour rester au centre
    if (distToEdge > 5) {
      score += 50;
    }

    // STRATÉGIE 3: Bonus pour continuer tout droit (évite les zigzags inutiles)
    if (dir === this.data.direction) {
      score += 30;
    }

    return score;
  }

  /**
   * Évalue l'agressivité d'une direction (offensif)
   */
  private evaluateOffensive(dir: 'up' | 'down' | 'left' | 'right', gridState: boolean[][], opponent: TronPlayer): number {
    let score = 0;
    let x = this.data.x;
    let y = this.data.y;

    // Simuler le mouvement
    for (let i = 0; i < this.lookAhead; i++) {
      switch (dir) {
        case 'up': y--; break;
        case 'down': y++; break;
        case 'left': x--; break;
        case 'right': x++; break;
      }

      if (!this.isValidPosition(x, y, gridState)) {
        score -= 1000 * (this.lookAhead - i);
        break;
      }

      // STRATÉGIE OFFENSIVE 1: Se rapprocher de l'adversaire pour le coincer
      const distToOpponent = Math.abs(x - opponent.x) + Math.abs(y - opponent.y);
      score -= distToOpponent * 5; // Réduire la distance = bon

      // STRATÉGIE OFFENSIVE 2: Bloquer les options de l'adversaire
      // Prédire où l'adversaire va
      const opponentNextX = opponent.x + (opponent.direction === 'left' ? -1 : opponent.direction === 'right' ? 1 : 0);
      const opponentNextY = opponent.y + (opponent.direction === 'up' ? -1 : opponent.direction === 'down' ? 1 : 0);

      // Bonus si on se dirige vers où l'adversaire va
      const distToOpponentNext = Math.abs(x - opponentNextX) + Math.abs(y - opponentNextY);
      score -= distToOpponentNext * 3;

      // STRATÉGIE OFFENSIVE 3: Réduire l'espace de l'adversaire
      const opponentFreeSpace = this.countFreeSpaceAround(opponent.x, opponent.y, gridState);
      if (opponentFreeSpace <= 2) {
        // Si l'adversaire a peu d'espace, essayer de le coincer davantage
        score += 50;
      }

      // STRATÉGIE OFFENSIVE 4: Couper le chemin de l'adversaire
      // Si on est entre l'adversaire et un mur, c'est bien
      if (this.isBetweenOpponentAndWall(x, y, opponent, gridState)) {
        score += 100;
      }
    }

    return score;
  }

  /**
   * Vérifie si on est entre l'adversaire et un mur (position stratégique)
   */
  private isBetweenOpponentAndWall(x: number, y: number, opponent: TronPlayer, gridState: boolean[][]): boolean {
    const maxX = gridState[0].length - 1;
    const maxY = gridState.length - 1;

    // Vérifier si on est sur le chemin entre l'adversaire et un bord
    const isOnPathToLeft = x < opponent.x && x <= 5;
    const isOnPathToRight = x > opponent.x && x >= maxX - 5;
    const isOnPathToTop = y < opponent.y && y <= 5;
    const isOnPathToBottom = y > opponent.y && y >= maxY - 5;

    return isOnPathToLeft || isOnPathToRight || isOnPathToTop || isOnPathToBottom;
  }

  private getPossibleDirections(gridState: boolean[][]): Array<'up' | 'down' | 'left' | 'right'> {
    const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
    return directions.filter(dir => {
      if (this.isOppositeDirection(dir, this.data.direction)) {
        return false;
      }
      let x = this.data.x;
      let y = this.data.y;
      switch (dir) {
        case 'up': y--; break;
        case 'down': y++; break;
        case 'left': x--; break;
        case 'right': x++; break;
      }
      return this.isValidPosition(x, y, gridState);
    });
  }

  private isValidPosition(x: number, y: number, gridState: boolean[][]): boolean {
    if (y < 0 || y >= gridState.length) return false;
    if (x < 0 || x >= gridState[0].length) return false;
    return !gridState[y][x]; // true = occupé, false = libre
  }

  private countFreeSpaceAround(x: number, y: number, gridState: boolean[][]): number {
    let count = 0;
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ];

    for (const { dx, dy } of directions) {
      if (this.isValidPosition(x + dx, y + dy, gridState)) {
        count++;
      }
    }

    return count;
  }

  private isOppositeDirection(dir1: 'up' | 'down' | 'left' | 'right', dir2: 'up' | 'down' | 'left' | 'right'): boolean {
    return (
      (dir1 === 'up' && dir2 === 'down') ||
      (dir1 === 'down' && dir2 === 'up') ||
      (dir1 === 'left' && dir2 === 'right') ||
      (dir1 === 'right' && dir2 === 'left')
    );
  }
}
