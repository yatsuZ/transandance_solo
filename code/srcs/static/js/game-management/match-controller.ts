import { ConfigMatch, PongGame } from "../pong/pong-game.js";
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

    this._DO.buttons.linkButtons.forEach(btn => {
      btn.addEventListener("click", this.event_stop_MatchHandler);
    });
  }

  /**
   * Initialise un match au démarrage si on est sur la page match
   * (À appeler APRÈS l'initialisation de la navigation)
   */
  public initMatchOnStartup(getCurrentPage: () => HTMLElement | null): void {
    if (getCurrentPage()?.id === "pagesMatch" && !this.pongGameSingleMatch) {
      console.log("[MATCH CONTROLLER] Démarrage sur page match → initialisation du match");
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
  private startMatchFromGameConfig() {
    const matchPage = this._DO.pages.match;
    const iconAccueil = this._DO.icons.accueil;

    // Récupérer le jeu sélectionné
    const selectedGame = (document.querySelector('input[name="game"]:checked') as HTMLInputElement)?.value;

    // Vérifier si c'est Tron (pas encore implémenté)
    if (selectedGame === "tron") { 
      alert("Le jeu Tron n'est pas encore prêt !\nRevenez plus tard 🎮");
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

    // Créer la config
    const config: ConfigMatch = {
      mode: mode,
      name: [playerLeftName, playerRightName]
    };

    // Afficher l'icône accueil
    activeOrHiden(iconAccueil, "On");

    // IMPORTANT: Afficher la page match AVANT de créer le PongGame
    updateUrl(matchPage);

    // Créer le jeu avec la config personnalisée
    console.log("[MATCH CONTROLLER] Création du match avec config:", config);
    this.pongGameSingleMatch = new PongGame(this._DO, config, false, () => this.onMatchEnd());

    // Envoyer POST /api/matches pour créer le match en BDD
    const isBotLeft = playerLeftType === "ia" ? 1 : 0;
    const isBotRight = playerRightType === "ia" ? 1 : 0;

    // Déterminer quel joueur est le user via la checkbox "C'est moi"
    const authenticatedSide = this.gameConfigForm.getAuthenticatedPlayerSide();
    const userData = AuthManager.getUserData();
    const playerLeftId = (authenticatedSide === 'left' && userData) ? userData.id : null;
    const playerRightId = (authenticatedSide === 'right' && userData) ? userData.id : null;

    this.createMatchInDatabase(playerLeftName, playerRightName, playerLeftId, playerRightId, isBotLeft, isBotRight);
  }

  /**
   * Callback appelé quand un match se termine (naturellement ou forcé)
   */
  private onMatchEnd(): void {
    // Envoyer la fin du match à la BDD si on a un match ID
    if (this.currentMatchId && this.pongGameSingleMatch) {
      const matchResult = this.pongGameSingleMatch.getWinnerAndLooser();
      if (matchResult) {
        const winnerName = matchResult.Winner.name;
        const scoreLeft = this.pongGameSingleMatch['playerLeft'].get_score();
        const scoreRight = this.pongGameSingleMatch['playerRight'].get_score();

        // Déterminer si le winner est le user connecté
        const winnerId = this.getWinnerId(winnerName);

        this.matchAPI.endMatch(this.currentMatchId, winnerId, winnerName, scoreLeft, scoreRight, 'completed');
      }
    }

    this.pongGameSingleMatch = null;
    this.currentMatchId = null;
    console.log("[MATCH CONTROLLER (call back)] Single match terminé, attribut remis à null");
  }

  /**
   * Event handler : stop/start match quand on change de page
   */
  private event_stop_Match(getCurrentPage: () => HTMLElement | null) {
    const activePage = getCurrentPage();
    if (activePage?.id === "pagesMatch" && this.hasActiveMatch()) 
      this.stopMatch("Quite la page match");
  }

  /**
   * Arrête le match solo actuel (si existant)
   * @param reason - Raison de l'arrêt
   */
  public stopMatch(reason: string): void {
    if (this.pongGameSingleMatch) {
      // Si le match est quitté avant la fin, envoyer status 'leave'
      if (this.currentMatchId) {
        const scoreLeft = this.pongGameSingleMatch['playerLeft'].get_score();
        const scoreRight = this.pongGameSingleMatch['playerRight'].get_score();

        this.matchAPI.endMatch(this.currentMatchId, null, null, scoreLeft, scoreRight, 'leave');
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
   * Nettoie les event listeners (appelé à la destruction)
   */
  public cleanup(): void {
    this._DO.buttons.linkButtons.forEach(btn => {
      btn.removeEventListener("click", this.event_stop_MatchHandler);
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
    isBotRight: number
  ): Promise<void> {
    this.currentMatchId = await this.matchAPI.createMatch(
      playerLeftName,
      playerRightName,
      playerLeftId,
      playerRightId,
      isBotLeft,
      isBotRight
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
}
