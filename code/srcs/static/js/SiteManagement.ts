import { PongGame } from './Game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeAnotherPage, activeOrHiden, initSPA } from './spa_redirection.js';
import { PlayerForTournament, Tournament } from './Tournament.js';
import { updateUrl } from './utils.js';

export type DOMElements = {
  pages: {
    accueil: HTMLElement | null;
    match: HTMLElement | null;
    result: HTMLElement | null;
    treeTournament: HTMLElement | null;
  };
  buttons: {
    nextResult: HTMLElement | null;
    giveUpTournament: HTMLElement | null;
    linkButtons: HTMLButtonElement[];
  };
  icons: {
    accueil: HTMLElement | null;
    settings: HTMLElement | null;
  };
  style: HTMLLinkElement | null;
};

type DOMMapItem = {
  name: string;
  selector: string;
  assign: (el: any) => void;
  multiple?: boolean;
};


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
  private _DO : DOMElements = {
    pages: {
      accueil: null,
      match: null,
      result: null,
      treeTournament: null,
    },

    buttons: {
      nextResult: null,
      giveUpTournament: null,
      linkButtons: [],
    },

    icons: {
      accueil: null,
      settings: null
    },

    style: null,
  };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Les methodes 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Constructueur Que je fais tout passer dans le dom contented loaded comme sa sa charge tout en PREMIER
  constructor() {
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  // vrai constructeur dcp =>
  private init() {
    this._cacheDom();// Recuperer les elment du DOM
    SiteManagement.activePage = null;
    this.initStyleAndSPA();// Gere les evenement de redirection de page etc 
    initMusicSystem();//Gere la gestion de evenement lier a la music
    update_description_de_page();// gere le evenemtn pour afficher les bons message de description

    this.initGameIfNeeded();// gere la gestion + evenement lier aux match
    this.tournamentGestion();// gere la gestion + evenement lier aux tournoi les deux sont lier
    this.redirection_after_end_match();// gere le bouton en fin de match
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// les init
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  private _cacheDom() {
    let allGood = true;

    const check = (name: string, el: any) => {
      if (!el || (Array.isArray(el) && el.length === 0)) {
        this.log(`❌ _cacheDom: Impossible de récupérer "${name}"`, "error")
        allGood = false;
      }
    };

    const map: DOMMapItem[] = [
      { name: "pages.accueil", selector: "#pagesAccueil", assign: el => this._DO.pages.accueil = el },
      { name: "pages.match", selector: "#pagesMatch", assign: el => this._DO.pages.match = el },
      { name: "pages.result", selector: "#pagesResult", assign: el => this._DO.pages.result = el },
      { name: "pages.treeTournament", selector: "#pagesTree_Tournament", assign: el => this._DO.pages.treeTournament = el },

      { name: "buttons.nextResult", selector: "#next-btn_result", assign: el => this._DO.buttons.nextResult = el },
      { name: "buttons.giveUpTournament", selector: "#givUpTournament", assign: el => this._DO.buttons.giveUpTournament = el },
      { name: "buttons.linkButtons", selector: "button[data-link]", assign: els => this._DO.buttons.linkButtons = els, multiple: true },

      { name: "icons.accueil", selector: "#icon-accueil", assign: el => this._DO.icons.accueil = el },
      { name: "icons.settings", selector: "#icon-settings", assign: el => this._DO.icons.settings = el },


      { name: "style.mainStyle", selector: 'link[href="/static/css/main_style.css"]', assign: el => this._DO.style = el },
    ];

    for (const item of map) {
      const el = item.multiple
        ? Array.from(document.querySelectorAll(item.selector))
        : document.querySelector(item.selector);

      item.assign(el);
      check(`${item.name} (${item.selector})`, el);
    }

    if (allGood)
      this.log("✅ _cacheDom: Tous les éléments du DOM ont été récupérés avec succès !");
  }


  // gere le spa + redirection et charge le css avant dafficher le site
  private initStyleAndSPA() {
    const do_style = this._DO.style;
    if (!do_style) return this.log("Pas reussie a recupere style.css", "error");

    const currentPage = SiteManagement.currentActivePage;

    if (do_style.sheet) initSPA(this._DO, currentPage);
    else do_style.addEventListener("load", () => initSPA(this._DO, currentPage));
  }

  private initGameIfNeeded() {
    // gerer sa dans spa redirection
    const activePage = SiteManagement.currentActivePage;

    // si ya premier page dans la quelle on est est la page match
    if (activePage?.id === "pagesMatch")
    {
      const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
      if (header)
        header.style.borderBottom = 'none';
      this.pongGameSingleMatch = new PongGame('pong-canvas', {mode:"PvP", name:["Left_Player", "Right_Player"]});
    }
    
    // Ce qui fais stoper un match
    this._DO.buttons.linkButtons.forEach(btn => {btn.addEventListener("click", this.event_stop_MatchHandler);});
  }


  private tournamentGestion() {
    Tournament.checkPlayerForTournament((players) => {
      if (!players)
        return this.log("❌ Le tournoi n'est pas prêt.", "error");
      const do_p_treeTournament = this._DO.pages.treeTournament
      if (!do_p_treeTournament) return this.log("Page cible non trouvée: pagesTree_Tournament", "error");
      this.tournament = new Tournament(players, do_p_treeTournament);
      this.log("✅ Tournoi créé :")
      console.log(this.tournament);
    });
    const do_btn_giveUp = this._DO.buttons.giveUpTournament;

    //// Tout ce qui fais stoper le tournoi
    if (!do_btn_giveUp) return this.log("Pas reussie a recupere #givUpTournament", "error");

    do_btn_giveUp.addEventListener("click", this.event_GivUpTournamentHandler);
    this._DO.buttons.linkButtons.forEach(btn => {btn.addEventListener("click", this.event_LeaveTournamentHandler);});
  }


  private redirection_after_end_match()
  {
    const do_btn_nextResult = this._DO.buttons.nextResult;
    if (!do_btn_nextResult) return this.log("Pas reussie a recupere #next-btn_result", "error");
    do_btn_nextResult.addEventListener("click", this.event_Btn_next_After_MatchHandler);
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get and setter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static get activePage(): HTMLElement | null {
    console.log("[Logger GET] activePage récupérée :", this.currentActivePage?.id ?? "aucune");
    return (this.currentActivePage);
    const page = document.querySelector('.active') as HTMLElement | null;
    return page;
  }

  static set activePage(newPage: HTMLElement | null){
    if (newPage === null)
    {
      const tmp = document.querySelector('.active') as HTMLElement | null;
      console.log("[Logger SET] activePage set avec querySelector:", tmp?.id ?? "aucune");
      this.currentActivePage = tmp;
    }
    else if (newPage === this.currentActivePage) console.log("[Logger SET] newPageActif et Current Page actif sont les meme:", newPage?.id ?? "aucune");
    else
    {
      this.currentActivePage = newPage;
      console.log("[Logger SET] activePage set:", newPage?.id ?? "aucune");
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

    if (!do_icon_accueil) return this.log("Page cible non trouvée: pageAccueil", "error");
    if (!do_p_accueil) return this.log("Pas reussie a recupere #icon-accueil", "error");

    activeOrHiden(do_icon_accueil, "Off");
    activeAnotherPage(do_p_accueil);

    updateUrl(do_p_accueil)

    this.log(`Tournament Finito pipo (1) :`);
    console.log(this)
    this.tournament?.ft_stopTournament();
    this.tournament = null; 
  }

  private event_LeaveTournamentHandler = this.event_LeaveTournament.bind(this);
  private event_LeaveTournament() {
    const allowedPages = [
      this._DO.pages.match?.id,
      this._DO.pages.result?.id,
      this._DO.pages.treeTournament?.id,
    ];

    const activePage = SiteManagement.currentActivePage;
    if (!activePage || !this.tournament) return;
    if (!allowedPages.includes(activePage.id))
    {
      this.log("Tournament Finito pipo (2) :");
      console.log(this)

      this.tournament?.ft_stopTournament();

      this.tournament = null;
    }
  }

  private event_stop_MatchHandler = this.event_stop_Match.bind(this);
  private event_stop_Match() {// peut mieux gerer le event aux lieux de donner sa a tout les data link je peut donner sa at suelment les bouton qui crée les match et les autre ce qui stope le match peut mieux optimiser
  const activePage = SiteManagement.currentActivePage;
  if (activePage?.id === "pagesMatch")
  {
    const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
    if (header) 
      header.style.borderBottom = 'none';
    this.pongGameSingleMatch = new PongGame('pong-canvas', {mode:"PvP", name:["Left_Player", "Right_Player"]});
  }
  else
      this.pongGameSingleMatch = null;
  }

  private event_Btn_next_After_MatchHandler = this.event_Btn_next_After_Match.bind(this);
  private event_Btn_next_After_Match() {
    const do_p_accueil = this._DO.pages.accueil;
    const do_p_treeTournament = this._DO.pages.treeTournament;
    const do_icon_accueil = this._DO.icons.accueil;

    if (!do_p_accueil) return this.log("Page cible non trouvée: pageAccueil", "error");
    if (!do_p_treeTournament) return this.log("Page cible non trouvée: pageTournament", "error");
    if (!do_icon_accueil) return this.log("Pas reussie a recupere #icon-accueil", "error");

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
// Utils 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  private log(msg: string, type: "info"|"error"="info") {
    if(type === "error") console.error("[SiteManagement]", msg);
    else console.log("[SiteManagement]", msg);
  }
}
