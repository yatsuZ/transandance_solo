import { PlayerForTournament } from "./tournament.js";

export declare const Treant: any;

/**
 * TournamentTree
 * Gère l'affichage de l'arbre visuel du tournoi (Treant.js)
 */
export class TournamentTree {
  private tournamentTree: any = null;
  private resizeHandler: () => void;
  private resizeTimeout?: number;

  constructor(
    private players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament]
  ) {
    this.resizeHandler = () => this.handleResize();
    window.addEventListener("resize", this.resizeHandler);

    // Créer l'arbre après que le DOM soit complètement rendu
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.createTree();
      });
    });
  }

  /**
   * Crée l'arbre du tournoi (Treant)
   */
  public createTree(): void {
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
  }

  /**
   * Met à jour l'arbre en fonction du redimensionnement de la fenêtre
   */
  private handleResize(): void {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      this.createTree();
    }, 50);
  }

  /**
   * Nettoie les event listeners
   */
  public cleanup(): void {
    window.removeEventListener("resize", this.resizeHandler);
    console.log("🧹 Listener resize supprimé du tournoi");
  }
}
