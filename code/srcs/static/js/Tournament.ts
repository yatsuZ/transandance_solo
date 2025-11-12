import { ConfigMatch, PongGame } from "./Game.js";
import { activeAnotherPage, activeOrHiden } from "./spa_redirection.js";
import { arePlayersValid, clearInputs, collectPlayers } from "./utils.js";

export type PlayerForTournament = {
  name: string;
  isHuman: boolean;
  aLive: boolean;
};

export declare const Treant: any;

export class Tournament {
  private players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament];
  private tournamentTree: any = null;
  private pageTreeTournament: HTMLElement;
  private stopTournament: boolean = false;
  private onDoMatchTournamentClick: (() => void) | null = null;
  // avoir un attribut match quand on appuye sur doMatchTournament sa en crée un 
  private currentMatch: PongGame | null = null;

  constructor(players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament], pageTreeTournament: HTMLElement) {
    // update whovs who ici
    this.players = players;
    this.pageTreeTournament = pageTreeTournament;

    console.log("🎮 Tournament créé :", this.players);
    const boutonDeTournoi = document.querySelector(".menu-buttons-tree-tournament-padding");
    if (boutonDeTournoi && boutonDeTournoi.classList.contains("hidden"))
      boutonDeTournoi.classList.remove("hidden");

    this.initButtons();
    this.updateWhoVsWhoTexte();
    activeAnotherPage(this.pageTreeTournament);
    this.createTree();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private handleResize() {
    // Optionnel : petit délai pour ne pas redessiner trop souvent pendant le resize
    clearTimeout((this as any)._resizeTimeout);
    (this as any)._resizeTimeout = setTimeout(() => {
      // console.log("🔄 Redimensionnement détecté → recalcul de l’arbre");
      this.createTree();
    }, 50);
  }

  /**
   * Écoute le submit du formulaire et crée un tournoi si tout est valide
   */
  public static checkPlayerForTournament(createTournament: (players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament] | null) => void): void {
    const form = document.getElementById("tournament-form") as HTMLFormElement | null;
    if (!form) {
      console.error("❌ Formulaire #tournament-form introuvable");
      return;
    }

    const inputIds = ["player1", "player2", "player3", "player4"];

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const playerNames = collectPlayers(inputIds);
      if (!playerNames || !arePlayersValid(playerNames)) {
        return createTournament(null);
      }

      // Récupérer si c’est un humain ou une IA
      const players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament] = 
      playerNames.map((name, i) => {
        const checkbox = document.getElementById(`human${i + 1}`) as HTMLInputElement | null;
        const isHuman = checkbox ? checkbox.checked : false;
        return { name, isHuman, aLive: true };
      }) as any;

      clearInputs(inputIds);

      createTournament(players);
    });
  }

  public creatConfig(): ConfigMatch | null {
    const alivePlayers = this.players.filter(p => p.aLive);

    // 1️⃣ Si un seul vivant → fin du tournoi
    if (alivePlayers.length <= 1)
    {
      this.stopTournament = true;
      return null;
    }

    // 2️⃣ Détermination des duels
    let selected: PlayerForTournament[] = [];

    if (this.players[0].aLive && this.players[1].aLive)
      selected = [this.players[0], this.players[1]];
    else if (this.players[2].aLive && this.players[3].aLive)
      selected = [this.players[2], this.players[3]];
    else
      selected = alivePlayers.slice(0, 2);

    const [p1, p2] = selected;

    let mode: ConfigMatch["mode"];
    if (!p1.isHuman && !p2.isHuman) mode = "IAvIA";
    else if (p1.isHuman && p2.isHuman) mode = "PvP";
    else if (p1.isHuman && !p2.isHuman) mode = "PvIA";
    else mode = "IAvP";

    return {
      mode,
      name: [p1.name, p2.name],
    };
  }

  /**
   * Initialise les boutons (accueil, abandon, etc.)
   */
  private initButtons() {
    const doMatchTournamentBtn = document.getElementById("doMatchTournament");
    if (!doMatchTournamentBtn)
      return console.error("⚠️ Bouton #doMatchTournament introuvable");

     this.onDoMatchTournamentClick = () => {
      if (this.stopTournament === true) return console.log("Pas de match pour ce tournoi car ce tournoi si est desactiver")
      const configMatch = this.creatConfig();
      console.log("A faire : ⚔️ Début du match suivant. ConfigMatch =", configMatch);
      const matchPage = document.getElementById("pagesMatch");
      if (matchPage === null) return console.error("Pas reussi a recuperer la page Match.");

      // Exemple: simulation du vainqueur aléatoire
      activeAnotherPage(matchPage)
      const header = matchPage.querySelector('.arcade-header') as HTMLElement | null;
      if (header)
        header.style.borderBottom = 'none';

      if (configMatch == null)
        return console.log("Le tournoi est fini il y a un vainquer.");
      this.currentMatch = new PongGame('pong-canvas', configMatch);
    };

    doMatchTournamentBtn.addEventListener("click", this.onDoMatchTournamentClick);
  }

  /**
   * Crée l'arbre du tournoi (Treant)
   */
  private createTree() {
    if (!this.players) return;

    const BASE_CHART_CONFIG = {
      chart: {
        container: "#TournamentTree",
        rootOrientation: "EAST",
        levelSeparation: 30,
        siblingSeparation: 25,
        connectors: {
          type: "straight",
          style: { "stroke-width": 2, stroke: "#0f0" },
        },
        node: { HTMLclass: "tournament-node" },
        scrollable: true,
        zoom: { enabled: true, scale: 0.6, min: 0.4, max: 1 },
      },
    };

    const createPlayerNode = (player: PlayerForTournament) => ({
      text: { name: `${player.name}${player.isHuman ? " 🧍" : " 🤖"}` },
      HTMLclass: player.aLive ? "player-leaf alive" : "player-leaf eliminate",
    });

    const tournamentStructure = {
      text: { name: "🏆 Vainqueur" },
      HTMLclass: "winner-node",
      children: [
        {
          text: { name: "Match 1" },
          HTMLclass: "match-node",
          children: this.players.slice(0, 2).map(createPlayerNode),
        },
        {
          text: { name: "Match 2" },
          HTMLclass: "match-node",
          children: this.players.slice(2, 4).map(createPlayerNode),
        },
      ],
    };
    this.tournamentTree = null;
    this.tournamentTree = new Treant({ ...BASE_CHART_CONFIG, nodeStructure: tournamentStructure });
    // console.log("🌳 Arbre du tournoi mis à jour !");
  }

  /**
   * Mise à jour de l'état d’un joueur
   */
  public updatePlayerStatus(name: string, alive: boolean) {
    const player = this.players.find(p => p.name === name);
    if (!player) return console.error(`Joueur ${name} introuvable`);
    player.aLive = alive;
    console.log("player mort :", player);
    this.createTree();
  }

  public updatePlayerStatusByIndex(index: number, alive: boolean) {
    if (index < 0 || index > 3) return console.error("Index joueur invalide");
    this.players[index].aLive = alive;
    this.createTree();
  }

  public updateEndMatch()
  {
    // update who vs who dynamiquement 
    const winnerAndLosser = this.currentMatch ? this.currentMatch.getWinnerAndLooser() : null ;
  
    if (this.currentMatch === null) return console.log("Il n'y a pas de match actuellement dans le tournoi.");
    else if (winnerAndLosser === null) return console.log("Le match dans le tournoi n'est pas encore fini.");

    // Metre a jour l'arbre + mes joueur vivant et mort + detruire lentité match + verifier si il sagit du dernier match
    this.updatePlayerStatus(winnerAndLosser.Looser.name, false);
    this.currentMatch = null;

    const alivePlayers = this.players.filter(p => p.aLive);

    this.updateWhoVsWhoTexte();

    if (alivePlayers.length <= 1)
    {
      // desactiver les bouton 
      const boutonDeTournoi = document.querySelector(".menu-buttons-tree-tournament-padding");
      if (boutonDeTournoi)
        activeOrHiden(boutonDeTournoi, "Off");
      console.log("FIN du tournoi montrer le vainquer du tournoi.");
    }
  }

  private updateWhoVsWhoTexte(){
    const nextMatch = this.creatConfig();
    const texteLabel = document.querySelector(".texte-label") as HTMLElement | null;
    const spanWhoVsWho = document.getElementById("WhoVsWho");

    if (!texteLabel || !spanWhoVsWho) return console.error("Éléments introuvables.");

    if (nextMatch === null) {
      const winner = this.players.find(p => p.aLive);
      texteLabel.textContent = "Le VAINQUEUR EST -> ";
      spanWhoVsWho.textContent = winner?.name ?? "Inconnu";
    } else {
      texteLabel.textContent = "Prochain match -> ";
      spanWhoVsWho.textContent = `${nextMatch.name[0]} VS ${nextMatch.name[1]}`;
    }
  }

  public ft_stopTournament() {
    const doMatchTournamentBtn = document.getElementById("doMatchTournament");
    if (!doMatchTournamentBtn)
      return console.error("⚠️ Bouton #doMatchTournament introuvable");
    if (this.onDoMatchTournamentClick) {
      doMatchTournamentBtn.removeEventListener("click", this.onDoMatchTournamentClick);
      console.log("🧹 Listener supprimé sur #doMatchTournament");
    }
    this.onDoMatchTournamentClick = null;

    this.currentMatch = null;
    this.stopTournament = true;
  }
}