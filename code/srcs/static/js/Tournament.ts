// crée une class tournament qui prend en parametre 4 Joueur qui soit humain ou IA
// Doive jouer à un jeux par defaut on as pong game (mais plus tard aura dautre jeux)
// on crée la class a partir du moment que l'on as valide le bouton submite et on suprime la class a partir du moment qu'il y a un vainquer ou on quite le tournoi avec le bouton accueil ou le bouton giv up tournament 
// la class aura aussi les tree en forma json comme on modifira aux fur et a mesur de tournoi 
// On devra recuperechaque resultat de match et metre a jour l'arbre + faire un resize pour le tree pour pas qui beug 

import { activeAnotherPage } from "./spa_redirection.js";
import { arePlayersValid, clearInputs, collectPlayers } from "./utils.js";

export type PlayerForTournament = { name: string; aLive: boolean };

export declare const Treant: any;


export class Tournament {
  private players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament];
  private tournamentTree: any = null;

  constructor(players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament], pageTreeTournament : HTMLElement) {
    this.players = players;
    if (pageTreeTournament == null) return
    console.log("Tournament Crée :", this);
    // Modifier le comportement de certain bouton
    this.initButton();

    activeAnotherPage(pageTreeTournament);
    this.createTree();
  }

  public static checkPlayerForTournament(createTournament: (players: [string, string, string, string] | null) => void): void {
    const form = document.getElementById("tournament-form") as HTMLFormElement | null;
    if (!form) {
      console.error("form tournament-form introuvable");
      return;
    }
    const inputIds = ["player1", "player2", "player3", "player4"];
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const players = collectPlayers(inputIds);
      if (!players) return createTournament(null);

      if (!arePlayersValid(players)) return createTournament(null);

      clearInputs(inputIds);
      console.log("✅ Joueurs du tournoi :", players);
      createTournament(players as [string, string, string, string]);
    });
  }


  private initButton() {
    const doMatchTournament = document.getElementById("doMatchTournament");
    console.log("Faire la gestion de tournoi");
    // si on appuye sur 
    if (!doMatchTournament)
    {
      console.error("Pas reussie a recupere #doMatchTournament");return ;
    }
    doMatchTournament.addEventListener("click", (e) => {
      // cree 
    });
  }

  private createTree() {
    if (!this.players) return;

    const BASE_CHART_CONFIG = {
      chart: {
        container: `#TournamentTree`,
        rootOrientation: "EAST",
        levelSeparation: 30,
        siblingSeparation: 25,
        connectors: {
          type: "straight",
          style: { "stroke-width": 2, "stroke": "#0f0" }
        },
        node: { HTMLclass: "tournament-node" },
        scrollable: true,
        zoom: { enabled: true, scale: 0.5, min: 0.3, max: 1 }
      }
    };

    const createPlayerNode = (player: PlayerForTournament) => ({
      text: { name: player.name },
      HTMLclass: player.aLive ? "player-leaf alive" : "player-leaf eliminate"
    });

    const tournamentStructure = {
      text: { name: "🏆 Vainqueur" },
      HTMLclass: "winner-node",
      children: [
        {
          text: { name: "Match 1" },
          HTMLclass: this.players.slice(0, 2).every(p => !p.aLive) ? "match-node past" : "match-node future",
          children: this.players.slice(0, 2).map(createPlayerNode)
        },
        {
          text: { name: "Match 2" },
          HTMLclass: this.players.slice(2, 4).every(p => !p.aLive) ? "match-node past" : "match-node future",
          children: this.players.slice(2, 4).map(createPlayerNode)
        }
      ]
    };

    this.tournamentTree = new Treant({ ...BASE_CHART_CONFIG, nodeStructure: tournamentStructure });
  }

  public getPlayers(): [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament] | null {
    return this.players;
  }

  public updatePlayerStatus(name: string, alive: boolean) {
    if (!this.players) return;
    const player = this.players.find(p => p.name === name);
    if (player) player.aLive = alive;
    this.createTree();
  }

  public updatePlayerStatusByIndex(index: number, alive: boolean) {
    if (!this.players) return;
    if (index < 0 || index > 3) return console.error("Index joueur invalide");
    this.players[index].aLive = alive;
    this.createTree();
  }
}
