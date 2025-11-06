import { PongGame } from './Game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeAnotherPage, activeOrHiden, initSPA } from './spa_redirection.js';
import { PlayerForTournament, Tournament } from './Tournament.js';


export class SiteManagement {
  private pongGameSingleMatch: PongGame | null = null;
  private tournament: Tournament | null = null;

  constructor() {
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  private init() {
    this.initStyleAndSPA();// fais
    this.initMusic();// fais
    this.initPageEvents();// fais
    this.initGameIfNeeded();// fais 
    this.tournamentGestion();
    this.redirection_after_end_match();
  }

  // gere le spa + redirection et charge le css avant dafficher le site
  private initStyleAndSPA() {
    const style = document.querySelector<HTMLLinkElement>('link[href="/static/css/main_style.css"]');
    if (!style) return console.error("Pas reussie a recupere style.css");

    if (style.sheet) initSPA();
    else style.addEventListener("load", initSPA);
  }

  // gere la gestion de music
  private initMusic() {
    initMusicSystem();
  }

  // gere les evenemnt action bouton
  private initPageEvents() {
    update_description_de_page();
  }

  private initGameIfNeeded() {
    // gerer sa dans spa redirection
    const linkButtons = document.querySelectorAll<HTMLButtonElement>("button[data-link]");
    const activePage = document.querySelector('.active') as HTMLElement | null;

    if (activePage?.id === "pagesMatch")
    {
      const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
      if (header)
        header.style.borderBottom = 'none';
      this.pongGameSingleMatch = new PongGame('pong-canvas');
    }
// Ce qui fais stoper un match
    linkButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {

        const activePage = document.querySelector('.active') as HTMLElement | null;
        if (activePage?.id === "pagesMatch")
        {
          const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
          if (header) 
            header.style.borderBottom = 'none';

          this.pongGameSingleMatch = new PongGame('pong-canvas');
        }
        else
            this.pongGameSingleMatch = null;
        });
      });
  }

  private tournamentGestion() {
    const pageTreeTournament = document.getElementById("pagesTree_Tournament");
    if (!pageTreeTournament) return console.error("Page cible non trouvée: pagesTree_Tournament");

    Tournament.checkPlayerForTournament((players) => {
      if (players == null) {
        // console.log("❌ Le tournoi n'est pas prêt.");
        return;
      }
      // console.log("✅ Tournoi prêt avec :", players);
      this.tournament = new Tournament(players.map(name => ({ name, aLive: true })) as [PlayerForTournament,PlayerForTournament,PlayerForTournament,PlayerForTournament], pageTreeTournament);
    });
//// Tout ce qui fais stoper le tournoi
    const pageAccueil = document.getElementById("pagesAccueil");
    const stopTournament = document.getElementById("givUpTournament");
    const linkButtons = document.querySelectorAll<HTMLButtonElement>("button[data-link]");

    if (!pageAccueil) return console.error("Page cible non trouvée: pageAccueil");
    if (!stopTournament) return console.error("Pas reussie a recupere #givUpTournament");

    stopTournament.addEventListener("click", (e) => {
      activeAnotherPage(pageAccueil);
      console.log("Tournament Finito pipo (1) :", this);

      this.tournament = null;
    });

    linkButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const allowedPages = [
          "pagesMatch",
          "pagesBegin_Tournament",
          "pagesResult",
          "pagesTree_Tournament",
        ];

        const activePage = document.querySelector('.active') as HTMLElement | null;
        if (!activePage || !this.tournament) return;
        if (!allowedPages.includes(activePage.id))
        {
          console.log("Tournament Finito pipo (2) :", this);
          this.tournament = null;
        }
        });
    });
  }

  private redirection_after_end_match()
  {
    const nextButtons = document.getElementById("next-btn_result");
    if (!nextButtons)
    {
      console.error("Pas reussie a recupere #next-btn_result");
      return;
    }

    nextButtons.addEventListener("click", (e) => {
      const pageAccueil = document.getElementById("pagesAccueil");
      if (!pageAccueil) return console.error("Page cible non trouvée: pageAccueil");
      const pageTournament = document.getElementById("pagesBegin_Tournament");
      if (!pageTournament) return console.error("Page cible non trouvée: pageTournament");

      document.querySelectorAll(".page").forEach(p => {activeOrHiden(p, "Off")});

      if (this.tournament)
        activeOrHiden(pageTournament, "On");
      else
        activeOrHiden(pageAccueil, "On");
    });
  }
}
