import { PongGame } from './game.js';
import { initMusicSystem } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { activeOrHiden, initSPA } from './spa_redirection.js';

declare const Treant: any; // Add type declaration for Treant

export class SiteManagement {
  private pongGameSingleMatch: PongGame | null = null;
  private tournamentOn: boolean = false;

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

private tournamentTreeGestion() {
  const BASE_CHART_CONFIG = {
    chart: {
      container: "#TournamentTree",
      rootOrientation: "EAST",
      levelSeparation: 30,
      siblingSeparation: 25,
      connectors: {
        type: "straight",
        style: {
          "stroke-width": 2,
          "stroke": "#0f0"
        }
      },
      node: {
        HTMLclass: "tournament-node"
      },
      // Limiter la taille du conteneur de l'arbre dans Treant.js
      // Ajuster l'arbre à la taille du conteneur avec un facteur de zoom
      scrollable: true, // Autorise le défilement si nécessaire
      zoom: {
        enabled: true, // Activer le zoom
        scale: 0.5,    // Facteur de zoom initial
        min: 0.3,      // Zoom minimal
        max: 1         // Zoom maximal
      }
    }
  };

  // === Structure du tournoi à 4 joueurs ===
  const tournamentStructure = {
    text: { name: "🏆 Vainqueur" },
    HTMLclass: "winner-node",
    children: [
      {
        text: { name: "Match 1" },
        HTMLclass: "match-node",
        children: [
          { text: { name: "Joueur 1" }, HTMLclass: "player-leaf" },
          { text: { name: "Joueur 2" }, HTMLclass: "player-leaf" }
        ]
      },
      {
        text: { name: "Match 2" },
        HTMLclass: "match-node",
        children: [
          { text: { name: "Joueur 3" }, HTMLclass: "player-leaf" },
          { text: { name: "Joueur 4" }, HTMLclass: "player-leaf" }
        ]
      }
    ]
  };

  // Initialiser l'arbre Treant.js avec la structure et la config
  const verif = new Treant({
    ...BASE_CHART_CONFIG,
    nodeStructure: tournamentStructure
  });
  console.log("verif = ", verif);
}

  private tournamentGestion() {
    const nextButtons = document.getElementById("next-btn_result");
    if (!nextButtons) {
      console.error("Pas reussie a recupere #next-btn_result");
      return;
    }
    nextButtons.addEventListener("click", (e) => {
      const pageAccueil = document.getElementById("pagesAccueil");
      if (!pageAccueil) return console.error("Page cible non trouvée: pageAccueil");
      const pageTournament = document.getElementById("pagesBegin_Tournament");
      if (!pageTournament) return console.error("Page cible non trouvée: pageTournament");

      document.querySelectorAll(".page").forEach(p => {
        activeOrHiden(p, "Off")
      });
      if (this.tournamentOn)
        activeOrHiden(pageTournament, "On")
      else
        activeOrHiden(pageAccueil, "On")
    })
    this.tournamentTreeGestion();
  }

}
