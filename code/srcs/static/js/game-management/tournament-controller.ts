import { DOMElements } from "../core/dom-elements.js";
import { Tournament } from "../tournament/tournament.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { updateUrl } from "../utils/url-helpers.js";
import { TournamentForm } from "../forms/tournament-form.js";

/**
 * Contrôleur pour gérer le cycle de vie des tournois
 */
export class TournamentController {
  private tournament: Tournament | null = null;
  private _DO: DOMElements;
  private event_GivUpTournamentHandler: () => void;
  private event_LeaveTournamentHandler: () => void;
  private event_Btn_next_After_MatchHandler: () => void;
  private tournamentForm: TournamentForm;

  constructor(dO: DOMElements, getCurrentPage: () => HTMLElement | null) {
    this._DO = dO;
    this.tournamentForm = new TournamentForm();

    // Bind handlers
    this.event_GivUpTournamentHandler = this.event_GivUpTournament.bind(this);
    this.event_LeaveTournamentHandler = this.event_LeaveTournament.bind(this, getCurrentPage);
    this.event_Btn_next_After_MatchHandler = this.event_Btn_next_After_Match.bind(this);

    // Initialiser la gestion du tournoi
    this.initTournamentManagement();

    // Event listeners
    this._DO.buttons.giveUpTournament.addEventListener("click", this.event_GivUpTournamentHandler);
    this._DO.buttons.linkButtons.forEach(btn => {
      btn.addEventListener("click", this.event_LeaveTournamentHandler);
    });
    this._DO.buttons.nextResult.addEventListener("click", this.event_Btn_next_After_MatchHandler);
  }

  /**
   * Initialise la gestion du tournoi (écoute le formulaire)
   */
  private initTournamentManagement() {
    Tournament.checkPlayerForTournament(this._DO, this.tournamentForm, (players, authenticatedPlayerIndex) => {
      if (!players) {
        return console.error("❌ Le tournoi n'est pas prêt.");
      }
      this.tournament = new Tournament(
        this._DO,
        players,
        authenticatedPlayerIndex,
        () => {
          // Callback appelé quand le tournoi se termine naturellement
          this.tournament = null;
          console.log("[TOURNAMENT] Tournoi terminé (fin naturelle avec vainqueur), attribut remis à null");
        }
      );
      console.log("✅ Tournoi créé :", this.tournament);
    });
  }

  /**
   * Event: Abandon du tournoi via bouton "Give Up"
   */
  private event_GivUpTournament() {
    const do_icon_accueil = this._DO.icons.accueil;
    const do_p_accueil = this._DO.pages.accueil;

    activeOrHiden(do_icon_accueil, "Off");
    activeAnotherPage(do_p_accueil);
    updateUrl(do_p_accueil);

    console.log(`Tournament Finito pipo (1) :`, this);
    this.tournament?.ft_stopTournament();
    this.tournament = null;
    console.log("[TOURNAMENT] Tournoi terminé (abandon via bouton), attribut remis à null");
  }

  /**
   * Event: Quitter le tournoi en naviguant hors des pages autorisées
   */
  private event_LeaveTournament(getCurrentPage: () => HTMLElement | null) {
    const allowedPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    const activePage = getCurrentPage();
    if (!activePage || !this.tournament) return;

    if (!allowedPages.includes(activePage.id)) {
      console.log(`Tournament Finito pipo (2) :`, this);

      this.tournament?.ft_stopTournament();
      this.tournament = null;
      console.log("[TOURNAMENT] Tournoi terminé (navigation hors pages tournoi), attribut remis à null");
    }
  }

  /**
   * Event: Bouton "Next" après un match (redirection)
   */
  private event_Btn_next_After_Match() {
    const do_p_accueil = this._DO.pages.accueil;
    const do_p_treeTournament = this._DO.pages.treeTournament;
    const do_icon_accueil = this._DO.icons.accueil;

    // Récupérer les résultats pour mettre à jour tournament puis recommencer
    if (this.tournament) {
      activeAnotherPage(do_p_treeTournament);
      this.tournament.updateEndMatch();
      updateUrl(do_p_treeTournament, `/tournament`);
    } else {
      activeOrHiden(do_icon_accueil, "Off");
      activeAnotherPage(do_p_accueil);
      updateUrl(do_p_accueil);
    }
  }

  /**
   * Arrête le tournoi actuel (si existant)
   * @param reason - Raison de l'arrêt
   */
  public stopTournament(reason: string): void {
    if (this.tournament) {
      console.log(`🛑 [TOURNOI] ${reason}`);
      this.tournament.ft_stopTournament();
      this.tournament = null;
      console.log("[TOURNAMENT] Tournoi terminé, attribut remis à null");
    }
  }

  /**
   * Vérifie si un tournoi est actif
   */
  public hasActiveTournament(): boolean {
    return this.tournament !== null;
  }

  /**
   * Nettoie les event listeners (appelé à la destruction)
   */
  public cleanup(): void {
    this._DO.buttons.giveUpTournament.removeEventListener("click", this.event_GivUpTournamentHandler);
    this._DO.buttons.linkButtons.forEach(btn => {
      btn.removeEventListener("click", this.event_LeaveTournamentHandler);
    });
    this._DO.buttons.nextResult.removeEventListener("click", this.event_Btn_next_After_MatchHandler);
  }
}
