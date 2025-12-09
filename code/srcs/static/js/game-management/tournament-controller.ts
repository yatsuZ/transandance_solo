import { DOMElements } from "../core/dom-elements.js";
import { Tournament } from "../tournament/tournament.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { updateUrl } from "../utils/url-helpers.js";
import { TournamentForm } from "./forms/tournament-form.js";

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
    this.tournamentForm = new TournamentForm(dO);

    // Bind handlers
    this.event_GivUpTournamentHandler = this.event_GivUpTournament.bind(this);
    this.event_LeaveTournamentHandler = this.event_LeaveTournament.bind(this, getCurrentPage);
    this.event_Btn_next_After_MatchHandler = this.event_Btn_next_After_Match.bind(this);

    // Initialiser la gestion du tournoi
    this.initTournamentManagement();

    // Event listeners
    this._DO.buttons.giveUpTournament.addEventListener("click", this.event_GivUpTournamentHandler);
    // Attacher le listener à tous les boutons SAUF le bouton musique
    this._DO.buttons.linkButtons.forEach(btn => {
      // Exclure le bouton musique (interupteur_du_son)
      if (btn.getAttribute('data-link') !== 'interupteur_du_son') {
        btn.addEventListener("click", this.event_LeaveTournamentHandler);
      }
    });
    this._DO.buttons.nextResult.addEventListener("click", this.event_Btn_next_After_MatchHandler);
  }

  /**
   * Initialise la gestion du tournoi (écoute le formulaire)
   */
  private initTournamentManagement() {
    Tournament.checkPlayerForTournament(this._DO, this.tournamentForm, (players, authenticatedPlayerIndex) => {
      if (!players) return;
      this.tournament = new Tournament(
        this._DO,
        players,
        authenticatedPlayerIndex,
        () => {
          // Callback appelé quand le tournoi se termine naturellement
          this.tournament = null;
        }
      );
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

    this.tournament?.ft_stopTournament();
    this.tournament = null;
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

      this.tournament?.ft_stopTournament();
      this.tournament = null;
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
      this.tournament.ft_stopTournament();
      this.tournament = null;
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
      // Exclure le bouton musique (interupteur_du_son)
      if (btn.getAttribute('data-link') !== 'interupteur_du_son') {
        btn.removeEventListener("click", this.event_LeaveTournamentHandler);
      }
    });
    this._DO.buttons.nextResult.removeEventListener("click", this.event_Btn_next_After_MatchHandler);
  }
}
