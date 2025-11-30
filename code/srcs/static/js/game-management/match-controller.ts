import { ConfigMatch, PongGame } from "../pong/pong-game.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { updateUrl } from "../utils/url-helpers.js";
import { DOMElements } from "../core/dom-elements.js";
import { arePlayersValid } from "../utils/validators.js";
import { AuthManager } from "../auth/auth-manager.js";
import { GameConfigForm } from "../forms/game-config-form.js";

/**
 * Contrôleur pour gérer le cycle de vie des matchs solo (hors tournoi)
 */
export class MatchController {
  private pongGameSingleMatch: PongGame | null = null;
  private currentMatchId: number | null = null;
  private _DO: DOMElements;
  private event_stop_MatchHandler: () => void;
  private gameConfigForm: GameConfigForm;

  constructor(dO: DOMElements, getCurrentPage: () => HTMLElement | null) {
    this._DO = dO;
    this.gameConfigForm = new GameConfigForm();

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
    this.createMatchInDatabase(playerLeftName, playerRightName);
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

        // Les scores sont toujours Left = joueur gauche, Right = joueur droit
        // On doit récupérer les scores depuis les joueurs originaux
        const scoreLeft = this.pongGameSingleMatch['playerLeft'].get_score();
        const scoreRight = this.pongGameSingleMatch['playerRight'].get_score();

        this.endMatchInDatabase(this.currentMatchId, winnerName, scoreLeft, scoreRight, 'completed');
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

        this.endMatchInDatabase(this.currentMatchId, null, scoreLeft, scoreRight, 'leave');
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
   * Envoie une requête POST pour créer un match en BDD
   */
  private async createMatchInDatabase(playerLeftName: string, playerRightName: string): Promise<void> {
    try {
      // Récupérer le user connecté
      const userData = AuthManager.getUserData();

      // Déterminer quel joueur est le user via la checkbox "C'est moi"
      const authenticatedSide = this.gameConfigForm.getAuthenticatedPlayerSide();
      const playerLeftId = (authenticatedSide === 'left' && userData) ? userData.id : null;
      const playerRightId = (authenticatedSide === 'right' && userData) ? userData.id : null;

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthManager.getAuthHeader()
        },
        body: JSON.stringify({
          player_left_id: playerLeftId,
          player_left_name: playerLeftName,
          player_right_id: playerRightId,
          player_right_name: playerRightName,
          game_type: 'pong'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.currentMatchId = data.data.id;
        console.log('✅ Match créé en BDD avec ID:', this.currentMatchId);
      } else {
        console.log('⚠️ Échec création match en BDD');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la création du match en BDD');
    }
  }

  /**
   * Envoie une requête POST pour terminer un match en BDD
   */
  private async endMatchInDatabase(
    matchId: number,
    winnerName: string | null,
    scoreLeft: number,
    scoreRight: number,
    status: 'completed' | 'leave'
  ): Promise<void> {
    try {
      // Récupérer le user connecté et vérifier s'il est le winner
      const userData = AuthManager.getUserData();
      const authenticatedSide = this.gameConfigForm.getAuthenticatedPlayerSide();

      // Si le user a joué ET qu'il est le winner
      let winnerId: number | null = null;
      if (userData && winnerName && authenticatedSide) {
        // Récupérer les noms des joueurs depuis les inputs
        const playerLeftInput = document.getElementById('playerLeft') as HTMLInputElement;
        const playerRightInput = document.getElementById('playerRight') as HTMLInputElement;

        const playerLeftName = playerLeftInput?.value.trim();
        const playerRightName = playerRightInput?.value.trim();

        // Si le user était left et left a gagné, ou user était right et right a gagné
        if ((authenticatedSide === 'left' && winnerName === playerLeftName) ||
            (authenticatedSide === 'right' && winnerName === playerRightName)) {
          winnerId = userData.id;
        }
      }

      const response = await fetch(`/api/matches/${matchId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthManager.getAuthHeader()
        },
        body: JSON.stringify({
          winner_id: winnerId,
          winner_name: winnerName,
          score_left: scoreLeft,
          score_right: scoreRight,
          status: status
        })
      });

      if (response.ok) {
        console.log(`✅ Match ${matchId} terminé en BDD (${status})`);
      } else {
        console.log('⚠️ Échec fin match en BDD');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la fin du match en BDD');
    }
  }
}
