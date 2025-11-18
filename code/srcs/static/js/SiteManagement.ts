import { PongGame } from './Game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeAnotherPage, activeOrHiden, initSPA } from './spa_redirection.js';
import { Tournament } from './Tournament.js';
import { findPageFromUrl, log, redirectToError, updateUrl } from './utils.js';
import { DOMElements } from './dom_gestion.js';


export class SiteManagement {
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Les Attributs 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //  attribut pour gestion de match + tournoi
  private static currentActivePage : HTMLElement | null = null;
  private pongGameSingleMatch: PongGame | null = null;
  private tournament: Tournament | null = null;

  // Element du DOM ici on stock toute les Document objec que je compte manipuler
  private _DO : DOMElements;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Les methodes 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Constructueur Que je fais tout passer dans le dom contented loaded comme sa sa charge tout en PREMIER
  constructor(all_DocumentObjet:DOMElements) {
    this._DO = all_DocumentObjet;// Recuperer les elment du DOM

    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  // vrai constructeur dcp =>
  private init() {
    SiteManagement.activePage = null;
    this.initStyleAndSPA();// Gere les evenement de redirection de page etc 
    initMusicSystem(this._DO);//Gere la gestion de evenement lier a la music
    update_description_de_page(this._DO);// gere le evenemtn pour afficher les bons message de description

    this.initGameIfNeeded();// gere la gestion + evenement lier aux match
    this.tournamentGestion();// gere la gestion + evenement lier aux tournoi les deux sont lier
    this.redirection_after_end_match();// gere le bouton en fin de match
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// les init
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // gere le spa + redirection et charge le css avant dafficher le site
  private initStyleAndSPA() {
    const do_style = this._DO.style;
    if (!do_style) return log("Pas reussie a recupere style.css", "error");

    const currentPage = SiteManagement.currentActivePage;

    // Passer la méthode handlePopStateNavigation pour gérer back/forward
    if (do_style.sheet) initSPA(this._DO, currentPage, this.handlePopStateNavigation);
    else do_style.addEventListener("load", () => initSPA(this._DO, currentPage, this.handlePopStateNavigation));
  }

  private initGameIfNeeded() {
    const activePage = SiteManagement.currentActivePage;

    // Si la première page est la page match, créer un match
    if (activePage?.id === "pagesMatch") {
      this.pongGameSingleMatch = new PongGame(
        this._DO,
        {mode:"PvP", name:["Left_Player", "Right_Player"]},
        false,
        () => {
          // Callback appelé quand le match se termine normalement
          this.pongGameSingleMatch = null;
          log("[MATCH] Single match terminé, attribut remis à null");
        }
      );
    }

    // Event listener pour gérer les changements de page et stop/start de match
    this._DO.buttons.linkButtons.forEach(btn => {
      btn.addEventListener("click", this.event_stop_MatchHandler);
    });
  }

  private tournamentGestion() {
    Tournament.checkPlayerForTournament(this._DO, (players) => {
      if (!players) {
        return log("❌ Le tournoi n'est pas prêt.", "error");
      }
      this.tournament = new Tournament(
        this._DO,
        players,
        () => {
          // Callback appelé quand le tournoi se termine naturellement
          this.tournament = null;
          log("[TOURNAMENT] Tournoi terminé (fin naturelle avec vainqueur), attribut remis à null");
        }
      );
      log("✅ Tournoi créé :");
      console.log(this.tournament);
    });

    // Event listeners pour le tournoi
    this._DO.buttons.giveUpTournament.addEventListener("click", this.event_GivUpTournamentHandler);
    this._DO.buttons.linkButtons.forEach(btn => {
      btn.addEventListener("click", this.event_LeaveTournamentHandler);
    });
  }


  private redirection_after_end_match()
  {
    this._DO.buttons.nextResult.addEventListener("click", this.event_Btn_next_After_MatchHandler);
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get and setter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static get activePage(): HTMLElement | null {
    // console.log("[Logger GET] activePage récupérée :", this.currentActivePage?.id ?? "aucune");
    return (this.currentActivePage);
  }

  static set activePage(newPage: HTMLElement | null){
    if (newPage === null)
    {
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "Off")

      const tmp = document.querySelector('.active') as HTMLElement | null;
      // console.log("[Logger SET] activePage set avec querySelector:", tmp?.id ?? "aucune");
      this.currentActivePage = tmp;
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "On")
    }
    else if (newPage === this.currentActivePage) return; //console.log("[Logger SET] newPageActif et Current Page actif sont les meme:", newPage?.id ?? "aucune");
    else
    {
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "Off")
      this.currentActivePage = newPage;
      // console.log("[Logger SET] activePage set:", newPage?.id ?? "aucune");
        activeOrHiden(this.currentActivePage, "On")

    }
  }
  // rendre active page static pour lupdate de maniere constant sans h24 acceder aux DOM

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Event methodes with them Handler 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  private event_GivUpTournamentHandler = this.event_GivUpTournament.bind(this);
  private event_GivUpTournament() {
    const do_icon_accueil = this._DO.icons.accueil;
    const do_p_accueil = this._DO.pages.accueil;

    activeOrHiden(do_icon_accueil, "Off");
    activeAnotherPage(do_p_accueil);

    updateUrl(do_p_accueil)

    log(`Tournament Finito pipo (1) :`);
    console.log(this)
    this.tournament?.ft_stopTournament();
    this.tournament = null;
    log("[TOURNAMENT] Tournoi terminé (abandon via bouton), attribut remis à null"); 
  }

  private event_LeaveTournamentHandler = this.event_LeaveTournament.bind(this);
  private event_LeaveTournament() {
    const allowedPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    const activePage = SiteManagement.currentActivePage;
    if (!activePage || !this.tournament) return;

    if (!allowedPages.includes(activePage.id))
    {
      log("Tournament Finito pipo (2) :");
      console.log(this)

      this.tournament?.ft_stopTournament();

      this.tournament = null;
      log("[TOURNAMENT] Tournoi terminé (navigation hors pages tournoi), attribut remis à null");
    }
  }

  private event_stop_MatchHandler = this.event_stop_Match.bind(this);
  private event_stop_Match() {
    const activePage = SiteManagement.currentActivePage;

    // Si on ARRIVE sur la page match, créer un nouveau match
    if (activePage?.id === "pagesMatch") {
      // Ne créer un match que si il n'y en a pas déjà un
      if (!this.pongGameSingleMatch) {
        this.pongGameSingleMatch = new PongGame(
          this._DO,
          {mode:"PvP", name:["Left_Player", "Right_Player"]},
          false,
          () => {
            // Callback appelé quand le match se termine normalement
            this.pongGameSingleMatch = null;
            log("[MATCH] Single match terminé, attribut remis à null");
          }
        );
      }
    }
    // Si on QUITTE la page match, arrêter le match actuel
    else {
      if (this.pongGameSingleMatch) {
        this.pongGameSingleMatch.stop("Quite la  page match");
        this.pongGameSingleMatch = null;
        log("[MATCH] Single match terminé, attribut remis à null");
      }
    }
  }

  private event_Btn_next_After_MatchHandler = this.event_Btn_next_After_Match.bind(this);
  private event_Btn_next_After_Match() {
    const do_p_accueil = this._DO.pages.accueil;
    const do_p_treeTournament = this._DO.pages.treeTournament;
    const do_icon_accueil = this._DO.icons.accueil;

    // recuperer les resultet pour metre a jour tournament puis recomencer
    if (this.tournament)
    {
      // faire une condition pour verifier si il sagit du denrier match ??
      activeAnotherPage(do_p_treeTournament);
      this.tournament.updateEndMatch();

      updateUrl(do_p_treeTournament, `/tournament`);
    }
    else
    {
      activeOrHiden(do_icon_accueil, "Off");
      activeAnotherPage(do_p_accueil);
      updateUrl(do_p_accueil);
    }
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Navigation back/forward (popstate)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Gère la navigation back/forward du navigateur (popstate)
   * BLOQUE l'accès aux pages interdites AVANT de les afficher
   * Appelle les méthodes stop appropriées selon la situation
   */
  private handlePopStateNavigation = (event: PopStateEvent): void => {
    console.log("🔙 Navigation back/forward détectée:", window.location.pathname);

    const path = window.location.pathname;
    const targetPage = findPageFromUrl(path, this._DO.pages);

    if (!targetPage) {
      console.error("[popstate] Impossible de trouver la page pour:", path);
      // Rediriger vers page d'erreur 404
      activeAnotherPage(redirectToError(404, "La page demandée n'existe pas.", this._DO));
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
      return;
    }

    const allowedTournamentPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    const currentPage = SiteManagement.currentActivePage;

    // ===== BLOCAGES : Interdire l'accès AVANT d'afficher la page =====

    // console.log("PATH = ", path);
    // console.log("targetPage = ", targetPage);
    // console.log("active page == ", SiteManagement?.currentActivePage?.id)
    // console.log("match active == ", this.pongGameSingleMatch ? "OUI" : "NON")

    if (path == "/")
    {
      activeAnotherPage(this._DO.pages.accueil);
      activeOrHiden(this._DO.icons.accueil, "Off");
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return;
    }

    // BLOCAGE 2 : Interdire l'accès à la page match si aucun match actif (hors tournoi)
    if (!this.tournament && !this.pongGameSingleMatch && targetPage.id === "pagesMatch" && (path==="/match" || path==="/match/result")) {
      log("🚫 [MATCH SOLO] Accès interdit : Aucun match classique actif → Redirection page d'erreur");
      activeAnotherPage(redirectToError(403, "Vous ne pouvez pas accéder à la page de match car aucun match n'est actuellement en cours. Veuillez démarrer un nouveau match depuis la page d'accueil.", this._DO));
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
      return;
    }


    // BLOCAGE 1 : Interdire l'accès aux pages de tournoi si aucun tournoi actif
    if (!this.tournament && allowedTournamentPages.includes(targetPage.id)) {
      log("🚫 [TOURNOI] Accès interdit : Aucun tournoi actif → Redirection page d'erreur");
      activeAnotherPage(redirectToError(403, "Vous ne pouvez pas accéder aux pages du tournoi car aucun tournoi n'est actuellement actif. Veuillez créer un nouveau tournoi depuis la page d'accueil.", this._DO));
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
      return;
    }


    // ===== CLEANUP : Arrêter match/tournoi si on quitte leurs pages =====

    // CAS SPÉCIAL 1 : Si on fait BACKWARD depuis une page de TOURNOI
    // → Arrêter le tournoi ET rediriger vers accueil directement
    if (this.tournament && allowedTournamentPages.includes(currentPage?.id ?? "")) {
      log("🛑 [TOURNOI] Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      // alert("⚠️ Tournoi interrompu\n\nLa navigation arrière depuis les pages du tournoi n'est pas autorisée.\n\nLe tournoi a été arrêté et vous êtes redirigé vers l'accueil.");
      this.tournament.ft_stopTournament();
      this.tournament = null;
      log("[TOURNAMENT] Tournoi terminé (navigation back/forward), attribut remis à null");
      // Forcer la redirection vers accueil
      activeAnotherPage(this._DO.pages.accueil);
      activeOrHiden(this._DO.icons.accueil, "Off");
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return;
    }

    // Si on quitte la page match (et pas dans un tournoi), stopper le match solo
    if (!this.tournament && this.pongGameSingleMatch && targetPage.id !== "pagesMatch") {
      log("🛑 [MATCH SOLO] Backward depuis match classique → Arrêt du match");
      // alert("⚠️ Match interrompu\n\nLa navigation arrière depuis la page de match n'est pas autorisée.\n\nLe match a été arrêté.");
      this.pongGameSingleMatch.stop("Navigation back/forward du navigateur");
      this.pongGameSingleMatch = null;
      log("[MATCH] Single match terminé, attribut remis à null");
    }

    // ===== AFFICHAGE : Afficher la nouvelle page =====

    const pageName = targetPage.id.slice("pages".length).toLowerCase();

    // Mettre à jour les icônes
    activeOrHiden(this._DO.icons.accueil, pageName === "accueil" ? "Off" : "On");
    activeOrHiden(this._DO.icons.settings, pageName === "parametre" ? "Off" : "On");

    // Afficher la page
    activeAnotherPage(targetPage);
    console.log("✅ Page affichée:", targetPage.id);
  }
}
