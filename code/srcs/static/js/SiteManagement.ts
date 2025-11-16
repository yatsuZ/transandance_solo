import { PongGame } from './Game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeAnotherPage, activeOrHiden, initSPA } from './spa_redirection.js';
import { Tournament } from './Tournament.js';
import { log, updateUrl } from './utils.js';

export type DOMElements = {
  pages: {
    accueil: HTMLElement;
    match: HTMLElement;
    result: HTMLElement;
    beginTournament: HTMLElement,
    treeTournament: HTMLElement;
    parametre: HTMLElement,
  };

  resultElement: {
    winnerNameEl : HTMLElement;
    player1NameEl : HTMLElement;
    player1ScoreEl : HTMLElement;
    player2NameEl : HTMLElement;
    player2ScoreEl : HTMLElement;
  }

  matchElement: {
    playerCardL : HTMLElement;
    playerCardR : HTMLElement;
  }

  tournamentElement: {
    texteWhovsWho : HTMLElement;
    spanWhoVsWho : HTMLElement;
    divOfButton: HTMLElement;
    form: HTMLFormElement;
    formPseudoTournament: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    formIsHumanCheckbox: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
  }

  buttons: {
    nextResult: HTMLElement;
    giveUpTournament: HTMLElement;
    startMatchTournament: HTMLElement;
    linkButtons: HTMLButtonElement[];
  };
  icons: {
    accueil: HTMLElement;
    settings: HTMLElement;
  };
  canva: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  style: HTMLLinkElement;
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
  private _DO : DOMElements;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Les methodes 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Constructueur Que je fais tout passer dans le dom contented loaded comme sa sa charge tout en PREMIER
  constructor() {
    this._DO = this._cacheDom();// Recuperer les elment du DOM

    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  // vrai constructeur dcp =>
  private init() {
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

  private _cacheDom(): DOMElements {
    // Créer un objet temporaire avec le même type que DOMElements
    const tmpDO: DOMElements = {
      pages: { 
        accueil: null!, 
        match: null!, 
        result: null!, 
        beginTournament: null!,    // <-- nouvelle page
        treeTournament: null!, 
        parametre: null!           // <-- nouvelle page
      },
      resultElement: { 
        winnerNameEl: null!, 
        player1NameEl: null!, 
        player1ScoreEl: null!, 
        player2NameEl: null!, 
        player2ScoreEl: null! 
      },
      matchElement: { 
        playerCardL: null!, 
        playerCardR: null! 
      },
      tournamentElement: { 
        texteWhovsWho: null!, 
        spanWhoVsWho: null!, 
        divOfButton: null!, 
        form: null!, 
        formPseudoTournament: [null!, null!, null!, null!], 
        formIsHumanCheckbox: [null!, null!, null!, null!] 
      },
      buttons: { 
        nextResult: null!, 
        giveUpTournament: null!, 
        startMatchTournament: null!, 
        linkButtons: [] 
      },
      icons: { 
        accueil: null!, 
        settings: null! 
      },
      canva: null!,
      ctx: null!,
      style: null!
    };

    let allGood = true;

    const check = (name: string, el: any) => {
      if (!el || (Array.isArray(el) && el.length === 0)) {
        log(`❌ _cacheDom: Impossible de récupérer "${name}"`, "error");
        allGood = false;
      }
    };

    const map: DOMMapItem[] = [
      // Pages
      { name: "pages.accueil", selector: "#pagesAccueil", assign: el => tmpDO.pages.accueil = el },
      { name: "pages.match", selector: "#pagesMatch", assign: el => tmpDO.pages.match = el },
      { name: "pages.result", selector: "#pagesResult", assign: el => tmpDO.pages.result = el },
      { name: "pages.beginTournament", selector: "#pagesBegin_Tournament", assign: el => tmpDO.pages.beginTournament = el },
      { name: "pages.treeTournament", selector: "#pagesTree_Tournament", assign: el => tmpDO.pages.treeTournament = el },
      { name: "pages.parametre", selector: "#pagesParametre", assign: el => tmpDO.pages.parametre = el },

      // Result elements
      { name: "resultElement.winnerNameEl", selector: "#winner-name", assign: el => tmpDO.resultElement.winnerNameEl = el },
      { name: "resultElement.player1NameEl", selector: "#player1-name", assign: el => tmpDO.resultElement.player1NameEl = el },
      { name: "resultElement.player1ScoreEl", selector: "#player1-score", assign: el => tmpDO.resultElement.player1ScoreEl = el },
      { name: "resultElement.player2NameEl", selector: "#player2-name", assign: el => tmpDO.resultElement.player2NameEl = el },
      { name: "resultElement.player2ScoreEl", selector: "#player2-score", assign: el => tmpDO.resultElement.player2ScoreEl = el },

      // Match elements
      { name: "matchElement.playerCardL", selector: "#player-Left-Card-Match", assign: el => tmpDO.matchElement.playerCardL = el },
      { name: "matchElement.playerCardR", selector: "#player-Right-Card-Match", assign: el => tmpDO.matchElement.playerCardR = el },

      // Tournament elements
      { name: "tournamentElement.texteWhovsWho", selector: ".texte-label", assign: el => tmpDO.tournamentElement.texteWhovsWho = el },
      { name: "tournamentElement.spanWhoVsWho", selector: "#WhoVsWho", assign: el => tmpDO.tournamentElement.spanWhoVsWho = el },
      { name: "tournamentElement.divOfButton", selector: ".menu-buttons-tree-tournament-padding", assign: el => tmpDO.tournamentElement.divOfButton = el },
      { name: "tournamentElement.form", selector: "#tournament-form", assign: el => tmpDO.tournamentElement.form = el },
            // Formulaire Elements 
          // Pseudo
      { name: "tournamentElement.formPseudoTournament[0]", selector: "#player1", assign: el => tmpDO.tournamentElement.formPseudoTournament[0] = el },
      { name: "tournamentElement.formPseudoTournament[1]", selector: "#player2", assign: el => tmpDO.tournamentElement.formPseudoTournament[1] = el },
      { name: "tournamentElement.formPseudoTournament[2]", selector: "#player3", assign: el => tmpDO.tournamentElement.formPseudoTournament[2] = el },
      { name: "tournamentElement.formPseudoTournament[3]", selector: "#player4", assign: el => tmpDO.tournamentElement.formPseudoTournament[3] = el },
          // is Human ?
      { name: "tournamentElement.formIsHumanCheckbox[0]", selector: "#human1", assign: el => tmpDO.tournamentElement.formIsHumanCheckbox[0] = el },
      { name: "tournamentElement.formIsHumanCheckbox[1]", selector: "#human2", assign: el => tmpDO.tournamentElement.formIsHumanCheckbox[1] = el },
      { name: "tournamentElement.formIsHumanCheckbox[2]", selector: "#human3", assign: el => tmpDO.tournamentElement.formIsHumanCheckbox[2] = el },
      { name: "tournamentElement.formIsHumanCheckbox[3]", selector: "#human4", assign: el => tmpDO.tournamentElement.formIsHumanCheckbox[3] = el },


      // Buttons
      { name: "buttons.nextResult", selector: "#next-btn_result", assign: el => tmpDO.buttons.nextResult = el },
      { name: "buttons.giveUpTournament", selector: "#givUpTournament", assign: el => tmpDO.buttons.giveUpTournament = el },
      { name: "buttons.startMatchTournament", selector: "#doMatchTournament", assign: el => tmpDO.buttons.startMatchTournament = el },
      { name: "buttons.linkButtons", selector: "button[data-link]", assign: els => tmpDO.buttons.linkButtons = els, multiple: true },

      // Icons
      { name: "icons.accueil", selector: "#icon-accueil", assign: el => tmpDO.icons.accueil = el },
      { name: "icons.settings", selector: "#icon-settings", assign: el => tmpDO.icons.settings = el },

      // Canvas
      { name: "canva.pong", selector: "#pong-canvas", assign: el => tmpDO.canva = el },

      // Style
      { name: "style.mainStyle", selector: 'link[href="/static/css/main_style.css"]', assign: el => tmpDO.style = el }
    ];

    for (const item of map) {
      const el = item.multiple
        ? Array.from(document.querySelectorAll(item.selector))
        : document.querySelector(item.selector);
      item.assign(el);
      check(`${item.name} (${item.selector})`, el);
    }

    // ⚡ Spécial ctx, on le récupère après le canvas
    if (tmpDO.canva)
    {
      const ctx = tmpDO.canva.getContext("2d");
      if (!ctx)
      {
        log("❌ _cacheDom: Impossible de récupérer le contexte 2D du canvas", "error");
        allGood = false;
      }
      else
        tmpDO.ctx = ctx;
    }
    else
      allGood = false;


    if (!allGood) {
      log("❌ _cacheDom: Certains éléments DOM sont manquants, initialisation impossible.", "error");
      throw new Error("_cacheDom: Impossible de récupérer tous les éléments DOM.");
    }

    log("✅ _cacheDom: Tous les éléments du DOM ont été récupérés avec succès !");
    return tmpDO;
  }

  // gere le spa + redirection et charge le css avant dafficher le site
  private initStyleAndSPA() {
    const do_style = this._DO.style;
    if (!do_style) return log("Pas reussie a recupere style.css", "error");

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
      this.pongGameSingleMatch = new PongGame(this._DO, {mode:"PvP", name:["Left_Player", "Right_Player"]});
    }
    
    // Ce qui fais stoper un match
    this._DO.buttons.linkButtons.forEach(btn => {btn.addEventListener("click", this.event_stop_MatchHandler);});
  }


  private tournamentGestion() {
    Tournament.checkPlayerForTournament(this._DO, (players) => {
      if (!players)
        return log("❌ Le tournoi n'est pas prêt.", "error");
      this.tournament = new Tournament(this._DO, players);
      log("✅ Tournoi créé :")
      console.log(this.tournament);
    });

//

    this._DO.buttons.giveUpTournament.addEventListener("click", this.event_GivUpTournamentHandler);
    this._DO.buttons.linkButtons.forEach(btn => {btn.addEventListener("click", this.event_LeaveTournamentHandler);});
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
  private event_stop_Match() {// peut mieux gerer le event aux lieux de donner sa a tout les data link je peut donner sa at suelment les bouton qui crée les match et les autre ce qui stope le match peut mieux optimiser
  const activePage = SiteManagement.currentActivePage;
  if (activePage?.id === "pagesMatch")
  {
    const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
    if (header) 
      header.style.borderBottom = 'none';
    this.pongGameSingleMatch = new PongGame(this._DO, {mode:"PvP", name:["Left_Player", "Right_Player"]});
  }
  else
      this.pongGameSingleMatch = null;
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
