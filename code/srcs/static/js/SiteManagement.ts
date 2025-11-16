import { PongGame } from './Game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeAnotherPage, activeOrHiden, initSPA } from './spa_redirection.js';
import { Tournament } from './Tournament.js';
import { log, updateUrl } from './utils.js';
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

    if (do_style.sheet) initSPA(this._DO, currentPage);
    else do_style.addEventListener("load", () => initSPA(this._DO, currentPage));
  }

  private initGameIfNeeded() {
    const activePage = SiteManagement.currentActivePage;

    // Si la première page est la page match, créer un match
    if (activePage?.id === "pagesMatch") {
      this.pongGameSingleMatch = new PongGame(this._DO, {mode:"PvP", name:["Left_Player", "Right_Player"]});
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
      this.tournament = new Tournament(this._DO, players);
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
    console.log("[Logger GET] activePage récupérée :", this.currentActivePage?.id ?? "aucune");
    return (this.currentActivePage);
  }

  static set activePage(newPage: HTMLElement | null){
    if (newPage === null)
    {
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "Off")

      const tmp = document.querySelector('.active') as HTMLElement | null;
      console.log("[Logger SET] activePage set avec querySelector:", tmp?.id ?? "aucune");
      this.currentActivePage = tmp;
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "On")
    }
    else if (newPage === this.currentActivePage) console.log("[Logger SET] newPageActif et Current Page actif sont les meme:", newPage?.id ?? "aucune");
    else
    {
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "Off")
      this.currentActivePage = newPage;
      console.log("[Logger SET] activePage set:", newPage?.id ?? "aucune");
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
    }
  }

  private event_stop_MatchHandler = this.event_stop_Match.bind(this);
  private event_stop_Match() {
    const activePage = SiteManagement.currentActivePage;

    // Si on ARRIVE sur la page match, créer un nouveau match
    if (activePage?.id === "pagesMatch") {
      // Ne créer un match que si il n'y en a pas déjà un
      if (!this.pongGameSingleMatch) {
        this.pongGameSingleMatch = new PongGame(this._DO, {mode:"PvP", name:["Left_Player", "Right_Player"]});
      }
    }
    // Si on QUITTE la page match, arrêter le match actuel
    else {
      if (this.pongGameSingleMatch) {
        this.pongGameSingleMatch.stop("Quite la  page match");
        this.pongGameSingleMatch = null;
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
}
