import { PongGame } from './game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeOrHiden, initSPA } from './spa_redirection.js';
import { createTree } from './tournament.js';
import { startTournament} from './tournament.js'

export type PlayerForTournament = { name: string; aLive: boolean };

export class SiteManagement {
  private pongGameSingleMatch: PongGame | null = null;
  private tournamentOn: boolean = false;
  // ici sotkcer les 4 joueur et metre tournament On en vrai
  private tournamentPlayers: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament] | null = null;


  constructor() {
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  private init() {
    this.initStyleAndSPA();// fais
    this.initMusic();// fais
    this.initPageEvents();// fais
    this.initGameIfNeeded();
    this.tournamentGestion();
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

  private initGameIfNeeded() {// gerer sa dans spa redirection
  const linkButtons = document.querySelectorAll<HTMLButtonElement>("button[data-link]");
  const activePage = document.querySelector('.active') as HTMLElement | null;
  if (activePage?.id === "pagesMatch")
  {
    const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
    if (header)
      header.style.borderBottom = 'none';
    this.pongGameSingleMatch = new PongGame('pong-canvas');
  }

  // Ajouter l'événement uniquement à ceux-là
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
    this.redirection_after_end_match();

    startTournament((players) => this.onValidPlayers(players));
  }

  private onValidPlayers(players: [string, string, string, string] | null): void {
    if (players == null) {
      // console.log("❌ Le tournoi n'est pas prêt.");
      return;
    }

    // console.log("✅ Tournoi prêt avec :", players);

    // transforme le tableau de strings en tableau d'objets
    this.tournamentPlayers = players.map(name => ({ name, aLive: true })) as [PlayerForTournament,PlayerForTournament,PlayerForTournament,PlayerForTournament];

    this.tournamentOn = true;

    // Redirection SPA
    const pageTournament = document.getElementById("pagesTree_Tournament");
    if (pageTournament) {
      document.querySelectorAll(".page").forEach(p => activeOrHiden(p, "Off"));
      activeOrHiden(pageTournament, "On");
      createTree(this.tournamentPlayers); // création de l'arbre du tournoi
    }
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

      if (this.tournamentOn)
        activeOrHiden(pageTournament, "On");
      else
        activeOrHiden(pageAccueil, "On");
    });
  }
}
