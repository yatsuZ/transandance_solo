import { DOMElements } from "../core/dom-manager.js";
import { ConfigMatch, PongGame } from "../pong/pong-game.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { updateUrl } from "../utils/url-helpers.js";

/**
 * Contrôleur pour gérer le cycle de vie des matchs solo (hors tournoi)
 */
export class MatchController {
  private pongGameSingleMatch: PongGame | null = null;
  private _DO: DOMElements;
  private event_stop_MatchHandler: () => void;

  constructor(dO: DOMElements, getCurrentPage: () => HTMLElement | null) {
    this._DO = dO;

    // Bind the handler
    this.event_stop_MatchHandler = this.event_stop_Match.bind(this, getCurrentPage);

    // Event listener pour démarrer un match depuis le bouton
    const doMatchBtn = this._DO.buttons.startMatch;

    doMatchBtn.addEventListener("click", () => {
      if (!this.pongGameSingleMatch) {
        this.startMatchFromButton();
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
   * Démarre un match solo depuis la page d'accueil
   * Change vers la page match PUIS crée le jeu
   */
  private startMatchFromButton() {
    const matchPage = this._DO.pages.match;
    const iconAccueil = this._DO.icons.accueil;

    // Afficher l'icône accueil
    activeOrHiden(iconAccueil, "On");

    // IMPORTANT: Afficher la page match AVANT de créer le PongGame
    activeAnotherPage(matchPage);
    updateUrl(matchPage);

    // Maintenant créer le jeu (le canvas est visible)
    console.log("[MATCH CONTROLLER] Création du match solo");
    this.initGame();
  }

  /**
   * Callback appelé quand un match se termine (naturellement ou forcé)
   */
  private onMatchEnd(): void {
    this.pongGameSingleMatch = null;
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
      this.pongGameSingleMatch.stop(reason);
      this.onMatchEnd();  // Utiliser le callback unifié
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
}
