import { activeAnotherPage } from "./spa_redirection.js";
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

  constructor(players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament], pageTreeTournament: HTMLElement) {
    this.players = players;
    this.pageTreeTournament = pageTreeTournament;

    console.log("🎮 Tournament créé :", this.players);

    this.initButtons();
    activeAnotherPage(this.pageTreeTournament);
    this.createTree();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private handleResize() {
    // Optionnel : petit délai pour ne pas redessiner trop souvent pendant le resize
    clearTimeout((this as any)._resizeTimeout);
    (this as any)._resizeTimeout = setTimeout(() => {
      console.log("🔄 Redimensionnement détecté → recalcul de l’arbre");
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

      console.log("✅ Joueurs du tournoi :", players);
      createTournament(players);
    });
  }

  /**
   * Initialise les boutons (accueil, abandon, etc.)
   */
  private initButtons() {
    const doMatchTournament = document.getElementById("doMatchTournament");
    if (!doMatchTournament)
      return console.error("⚠️ Bouton #doMatchTournament introuvable");

    doMatchTournament.addEventListener("click", () => {
      console.log("A faire : ⚔️ Début du match suivant...");
      // Exemple: simulation du vainqueur aléatoire
      this.createTree();
    });
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
      HTMLclass: player.aLive ? "player-leaf alive" : "player-leaf eliminated",
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

    this.tournamentTree = new Treant({ ...BASE_CHART_CONFIG, nodeStructure: tournamentStructure });
    console.log("🌳 Arbre du tournoi mis à jour !");
  }

  /**
   * Mise à jour de l'état d’un joueur
   */
  public updatePlayerStatus(name: string, alive: boolean) {
    const player = this.players.find(p => p.name === name);
    if (!player) return console.error(`Joueur ${name} introuvable`);
    player.aLive = alive;
    this.createTree();
  }

  public updatePlayerStatusByIndex(index: number, alive: boolean) {
    if (index < 0 || index > 3) return console.error("Index joueur invalide");
    this.players[index].aLive = alive;
    this.createTree();
  }

}
