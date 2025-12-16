import { ConfigMatch, PongGame } from "../pong/pong-game.js";
import { TronGame } from "../tron/tron-game.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { updateUrl } from "../utils/url-helpers.js";
import { DOMElements } from "../core/dom-elements.js";
import { arePlayersValid } from "../utils/validators.js";
import { AuthManager } from "../auth/auth-manager.js";
import { GameConfigForm } from "./forms/game-config-form.js";
import { MatchAPI } from "./match-api.js";

/**
 * Contrôleur pour gérer le cycle de vie des matchs solo (hors tournoi)
 */
export class MatchController {
  private pongGameSingleMatch: PongGame | null = null;
  private tronGameSingleMatch: TronGame | null = null;
  private currentMatchId: number | null = null;
  private _DO: DOMElements;
  private event_stop_MatchHandler: () => void;
  private gameConfigForm: GameConfigForm;
  private matchAPI: MatchAPI;

  constructor(dO: DOMElements, getCurrentPage: () => HTMLElement | null) {
    this._DO = dO;
    this.gameConfigForm = new GameConfigForm(dO);
    this.matchAPI = new MatchAPI();

    // Bind the handler
    this.event_stop_MatchHandler = this.event_stop_Match.bind(this, getCurrentPage);

    // Event listener pour le formulaire gameConfig
    const gameConfigForm = this._DO.gameConfigElement.formulaireGameConfig;
    gameConfigForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this.pongGameSingleMatch) {
        this.startMatchFromGameConfig();
      }
    });

    // Attacher le listener à tous les boutons SAUF le bouton musique
    this._DO.buttons.linkButtons.forEach(btn => {
      // Exclure le bouton musique (interupteur_du_son)
      if (btn.getAttribute('data-link') !== 'interupteur_du_son') {
        btn.addEventListener("click", this.event_stop_MatchHandler);
      }
    });
  }

  /**
   * Initialise un match au démarrage si on est sur la page match
   * (À appeler APRÈS l'initialisation de la navigation)
   */
  public initMatchOnStartup(getCurrentPage: () => HTMLElement | null): void {
    if (getCurrentPage()?.id === "pagesMatch" && !this.pongGameSingleMatch) {
      this.initGame();
    }
  }

  /**
   * Initialise un match
   */
  private initGame() {
    const modeMatch : ConfigMatch = { mode: "PvP", name: ["Left_Player", "Right_Player"] };
    this.pongGameSingleMatch = new PongGame(this._DO, modeMatch, false, () => this.onMatchEnd());
  }

  /**
   * Démarre un match depuis le formulaire gameConfig
   * Récupère les données du formulaire et lance le match
   */
  private async startMatchFromGameConfig() {
    const matchPage = this._DO.pages.match;
    const iconAccueil = this._DO.icons.accueil;

    // Récupérer le jeu sélectionné
    const selectedGame = (document.querySelector('input[name="game"]:checked') as HTMLInputElement)?.value;

    // Vérifier si c'est Tron
    if (selectedGame === "tron") {
      this.startTronMatch();
      return;
    }

    // Récupérer les données du formulaire
    const playerLeftName = this._DO.gameConfigElement.inputFormulaireGameConfig_PlayerLeft.value.trim();
    const playerRightName = this._DO.gameConfigElement.inputFormulaireGameConfig_PlayerRight.value.trim();

    // Vérifier que les pseudos sont remplis
    if (!playerLeftName || !playerRightName) {
      alert("Tous les joueurs doivent avoir un pseudo !");
      return;
    }

    // Valider les pseudos (caractères valides, longueur, unicité)
    if (!arePlayersValid([playerLeftName, playerRightName]))
      return;

    // Récupérer les types des joueurs (humain/IA)
    const playerLeftType = (document.querySelector('input[name="playerLeftType"]:checked') as HTMLInputElement)?.value;
    const playerRightType = (document.querySelector('input[name="playerRightType"]:checked') as HTMLInputElement)?.value;

    // Déterminer le mode
    let mode: ConfigMatch["mode"];
    if (playerLeftType === "human" && playerRightType === "human")
      mode = "PvP";
    else if (playerLeftType === "human" && playerRightType === "ia")
      mode = "PvIA";
    else if (playerLeftType === "ia" && playerRightType === "human")
      mode = "IAvP";
    else
      mode = "IAvIA";

    // Récupérer la difficulté de l'IA (si au moins un joueur est IA)
    let aiDifficulty: ConfigMatch["aiDifficulty"] = 'MEDIUM'; // Par défaut
    if (playerLeftType === "ia") {
      aiDifficulty = this.gameConfigForm.getAIDifficulty('left') as any;
    } else if (playerRightType === "ia") {
      aiDifficulty = this.gameConfigForm.getAIDifficulty('right') as any;
    }

    // Récupérer quel joueur est le user connecté et son avatar
    const authenticatedSide = this.gameConfigForm.getAuthenticatedPlayerSide();
    const userData = AuthManager.getUserData();

    // Préparer les avatars
    let avatarLeft: string | null = null;
    let avatarRight: string | null = null;

    if (userData && authenticatedSide === 'left') {
      avatarLeft = userData.avatar_url || null;
    } else if (userData && authenticatedSide === 'right') {
      avatarRight = userData.avatar_url || null;
    }

    // Créer la config
    const config: ConfigMatch = {
      mode: mode,
      name: [playerLeftName, playerRightName],
      aiDifficulty: aiDifficulty, // Passer la difficulté au jeu
      authenticatedPlayerSide: authenticatedSide,
      avatarUrls: [avatarLeft, avatarRight]
    };

    // Afficher l'icône accueil
    activeOrHiden(iconAccueil, "On");

    // IMPORTANT: Afficher la page match AVANT de créer le PongGame
    updateUrl(matchPage, '/match/pong');

    // Envoyer POST /api/matches pour créer le match en BDD AVANT de démarrer le jeu
    const isBotLeft = playerLeftType === "ia" ? 1 : 0;
    const isBotRight = playerRightType === "ia" ? 1 : 0;

    // Utiliser authenticatedSide et userData déjà récupérés plus haut
    const playerLeftId = (authenticatedSide === 'left' && userData) ? userData.id : null;
    const playerRightId = (authenticatedSide === 'right' && userData) ? userData.id : null;

    // Attendre que le match soit créé en BDD avant de démarrer le jeu
    await this.createMatchInDatabase(playerLeftName, playerRightName, playerLeftId, playerRightId, isBotLeft, isBotRight);

    // Créer le jeu avec la config personnalisée APRÈS avoir l'ID du match
    this.pongGameSingleMatch = new PongGame(this._DO, config, false, () => this.onMatchEnd());
  }

  /**
   * Callback appelé quand un match se termine (naturellement ou forcé)
   */
  private async onMatchEnd(): Promise<void> {
    // Envoyer la fin du match à la BDD si on a un match ID
    if (this.currentMatchId && this.pongGameSingleMatch) {
      const matchResult = this.pongGameSingleMatch.getWinnerAndLooser();
      if (matchResult) {
        const winnerName = matchResult.Winner.name;
        const scoreLeft = this.pongGameSingleMatch['playerLeft'].get_score();
        const scoreRight = this.pongGameSingleMatch['playerRight'].get_score();

        // Déterminer si le winner est le user connecté
        const winnerId = this.getWinnerId(winnerName);

        await this.matchAPI.endMatch(this.currentMatchId, winnerId, winnerName, scoreLeft, scoreRight, 'completed');
      }
    }

    this.pongGameSingleMatch = null;
    this.currentMatchId = null;
  }

  /**
   * Event handler : stop/start match quand on change de page
   * Ce handler se déclenche AVANT le changement de page (via les boutons)
   * Il vérifie si on est sur une page de jeu actif et qu'on va la quitter
   */
  private event_stop_Match(getCurrentPage: () => HTMLElement | null) {
    const activePage = getCurrentPage();

    // Si on est sur la page match avec un jeu actif, on va le quitter → arrêter le jeu
    if (activePage?.id === "pagesMatch" && this.hasActiveMatch()) {
      this.stopMatch("Navigation via bouton - quitte la page match");
    }

    // Si on est sur la page tron avec un jeu actif, on va le quitter → arrêter le jeu
    if (activePage?.id === "pagesTron" && this.hasActiveTronMatch()) {
      this.stopTronMatch("Navigation via bouton - quitte la page tron");
    }
  }

  /**
   * Arrête le match solo actuel (si existant)
   * @param reason - Raison de l'arrêt
   */
  public async stopMatch(reason: string): Promise<void> {
    if (this.pongGameSingleMatch) {
      // Si le match est quitté avant la fin, envoyer status 'leave'
      if (this.currentMatchId) {
        const scoreLeft = this.pongGameSingleMatch['playerLeft'].get_score();
        const scoreRight = this.pongGameSingleMatch['playerRight'].get_score();

        await this.matchAPI.endMatch(this.currentMatchId, null, null, scoreLeft, scoreRight, 'leave');
      }

      this.pongGameSingleMatch.stop(reason);
      this.pongGameSingleMatch = null;
      this.currentMatchId = null;
    }
  }

  /**
   * Vérifie si un match solo est actif
   */
  public hasActiveMatch(): boolean {
    return this.pongGameSingleMatch !== null;
  }

  /**
   * Vérifie si un match Tron est actif
   */
  public hasActiveTronMatch(): boolean {
    return this.tronGameSingleMatch !== null;
  }

  /**
   * Arrête le match Tron actuel (si existant)
   * @param reason - Raison de l'arrêt
   */
  public async stopTronMatch(reason: string): Promise<void> {
    if (this.tronGameSingleMatch) {
      // Si le match est quitté avant la fin, envoyer status 'leave'
      if (this.currentMatchId) {
        const scoreLeft = this.tronGameSingleMatch.getPlayerLeftScore();
        const scoreRight = this.tronGameSingleMatch.getPlayerRightScore();

        await this.matchAPI.endMatch(this.currentMatchId, null, null, scoreLeft, scoreRight, 'leave');
      }

      this.tronGameSingleMatch.stop(reason);
      this.tronGameSingleMatch = null;
      this.currentMatchId = null;
    }
  }

  /**
   * Nettoie les event listeners (appelé à la destruction)
   */
  public cleanup(): void {
    this._DO.buttons.linkButtons.forEach(btn => {
      // Exclure le bouton musique (interupteur_du_son)
      if (btn.getAttribute('data-link') !== 'interupteur_du_son') {
        btn.removeEventListener("click", this.event_stop_MatchHandler);
      }
    });
  }

  /**
   * Crée un match en BDD
   */
  private async createMatchInDatabase(
    playerLeftName: string,
    playerRightName: string,
    playerLeftId: number | null,
    playerRightId: number | null,
    isBotLeft: number,
    isBotRight: number,
    gameType: string = 'pong'
  ): Promise<void> {
    this.currentMatchId = await this.matchAPI.createMatch(
      playerLeftName,
      playerRightName,
      playerLeftId,
      playerRightId,
      isBotLeft,
      isBotRight,
      gameType
    );
  }

  /**
   * Détermine si le winner est le user connecté
   */
  private getWinnerId(winnerName: string): number | null {
    const userData = AuthManager.getUserData();
    const authenticatedSide = this.gameConfigForm.getAuthenticatedPlayerSide();

    if (!userData || !authenticatedSide) return null;

    const playerLeftName = this._DO.gameConfigElement.inputFormulaireGameConfig_PlayerLeft.value.trim();
    const playerRightName = this._DO.gameConfigElement.inputFormulaireGameConfig_PlayerRight.value.trim();

    // Si le user était left et left a gagné, ou user était right et right a gagné
    if ((authenticatedSide === 'left' && winnerName === playerLeftName) ||
        (authenticatedSide === 'right' && winnerName === playerRightName)) {
      return userData.id;
    }

    return null;
  }

  /**
   * Démarre un match Tron
   */
  private async startTronMatch(): Promise<void> {
    // Arrêter un éventuel match Tron en cours avant d'en créer un nouveau
    if (this.tronGameSingleMatch) {
      this.tronGameSingleMatch.stop('Nouveau match démarré');
      this.tronGameSingleMatch = null;
    }

    const tronPage = this._DO.pages.tron;
    const iconAccueil = this._DO.icons.accueil;

    // Récupérer les données du formulaire
    const playerLeftName = this._DO.gameConfigElement.inputFormulaireGameConfig_PlayerLeft.value.trim();
    const playerRightName = this._DO.gameConfigElement.inputFormulaireGameConfig_PlayerRight.value.trim();

    // Vérifier que les pseudos sont remplis
    if (!playerLeftName || !playerRightName) {
      alert("Tous les joueurs doivent avoir un pseudo !");
      return;
    }

    // Valider les pseudos
    if (!arePlayersValid([playerLeftName, playerRightName])) {
      return;
    }

    // Récupérer les types des joueurs (humain/IA)
    const playerLeftType = (document.querySelector('input[name="playerLeftType"]:checked') as HTMLInputElement)?.value;
    const playerRightType = (document.querySelector('input[name="playerRightType"]:checked') as HTMLInputElement)?.value;

    // Déterminer le mode
    let mode: "PvP" | "PvIA" | "IAvP" | "IAvIA";
    if (playerLeftType === "human" && playerRightType === "human")
      mode = "PvP";
    else if (playerLeftType === "human" && playerRightType === "ia")
      mode = "PvIA";
    else if (playerLeftType === "ia" && playerRightType === "human")
      mode = "IAvP";
    else
      mode = "IAvIA";

    // Récupérer la difficulté de l'IA (si au moins un joueur est IA)
    let aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' = 'MEDIUM';
    if (playerLeftType === "ia") {
      aiDifficulty = this.gameConfigForm.getAIDifficulty('left') as any;
    } else if (playerRightType === "ia") {
      aiDifficulty = this.gameConfigForm.getAIDifficulty('right') as any;
    }

    // Récupérer quel joueur est le user connecté et son avatar
    const authenticatedSide = this.gameConfigForm.getAuthenticatedPlayerSide();
    const userData = AuthManager.getUserData();

    // Préparer les avatars
    let avatarLeft: string | null = null;
    let avatarRight: string | null = null;

    if (userData && authenticatedSide === 'left') {
      avatarLeft = userData.avatar_url || null;
    } else if (userData && authenticatedSide === 'right') {
      avatarRight = userData.avatar_url || null;
    }

    // Créer la config
    const config = {
      mode: mode,
      name: [playerLeftName, playerRightName] as [string, string],
      aiDifficulty: aiDifficulty,
      authenticatedPlayerSide: authenticatedSide,
      avatarUrls: [avatarLeft, avatarRight] as [string | null, string | null]
    };

    // Afficher l'icône accueil
    activeOrHiden(iconAccueil, "On");

    // Afficher la page Tron
    updateUrl(tronPage, '/match/tron');

    // Créer le match en BDD avec game_type='tron' AVANT de démarrer le jeu
    const isBotLeft = playerLeftType === "ia" ? 1 : 0;
    const isBotRight = playerRightType === "ia" ? 1 : 0;

    const playerLeftId = (authenticatedSide === 'left' && userData) ? userData.id : null;
    const playerRightId = (authenticatedSide === 'right' && userData) ? userData.id : null;

    // Attendre que le match soit créé en BDD avant de démarrer le jeu
    await this.createMatchInDatabase(
      playerLeftName,
      playerRightName,
      playerLeftId,
      playerRightId,
      isBotLeft,
      isBotRight,
      'tron' // game_type
    );

    // Créer le jeu Tron avec la config complète APRÈS avoir l'ID du match
    this.tronGameSingleMatch = new TronGame(
      this._DO,
      config,
      () => this.onTronMatchEnd()
    );
  }

  /**
   * Callback appelé quand un match Tron se termine
   */
  private async onTronMatchEnd(): Promise<void> {
    // Envoyer la fin du match à la BDD
    if (this.currentMatchId && this.tronGameSingleMatch) {
      const matchResult = this.tronGameSingleMatch.getWinnerAndLooser();
      if (matchResult) {
        const winnerName = matchResult.Winner.name;
        const scoreLeft = this.tronGameSingleMatch.getPlayerLeftScore();
        const scoreRight = this.tronGameSingleMatch.getPlayerRightScore();

        // Déterminer si le winner est le user connecté
        const winnerId = this.getWinnerId(winnerName);

        await this.matchAPI.endMatch(this.currentMatchId, winnerId, winnerName, scoreLeft, scoreRight, 'completed');
      }
    }

    this.tronGameSingleMatch = null;
    this.currentMatchId = null;
  }
}
