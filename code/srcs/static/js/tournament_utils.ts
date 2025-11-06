import { PlayerForTournament } from "./Tournament.js";
export declare const Treant: any; // Add type declaration for Treant

export function createTree(list_of_player: [PlayerForTournament, PlayerForTournament,PlayerForTournament,PlayerForTournament]): typeof Treant {
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
          "stroke": "#0f0",
        },
      },
      node: {
        HTMLclass: "tournament-node",
      },
      scrollable: true,
      zoom: {
        enabled: true,
        scale: 0.5,
        min: 0.3,
        max: 1,
      },
    },
  };

  // === Génération dynamique des noeuds de joueurs ===
  const match1Children = [
    { 
      text: { name: list_of_player[0].name }, 
      HTMLclass: list_of_player[0].aLive ? "player-leaf alive" : "player-leaf eliminate" 
    },
    { 
      text: { name: list_of_player[1].name }, 
      HTMLclass: list_of_player[1].aLive ? "player-leaf alive" : "player-leaf eliminate" 
    }
  ];

  const match2Children = [
    { 
      text: { name: list_of_player[2].name }, 
      HTMLclass: list_of_player[2].aLive ? "player-leaf alive" : "player-leaf eliminate" 
    },
    { 
      text: { name: list_of_player[3].name }, 
      HTMLclass: list_of_player[3].aLive ? "player-leaf alive" : "player-leaf eliminate" 
    }
  ];

  // === Définition de la structure du tournoi ===
  const tournamentStructure = {
    text: { name: "🏆 Vainqueur" },
    HTMLclass: "winner-node",
    children: [
      {
        text: { name: "Match 1" },
        HTMLclass: match1Children.every(p => p.HTMLclass.includes("eliminate")) ? "match-node past" : "match-node future",
        children: match1Children,
      },
      {
        text: { name: "Match 2" },
        HTMLclass: match2Children.every(p => p.HTMLclass.includes("eliminate")) ? "match-node past" : "match-node future",
        children: match2Children,
      },
    ],
  };

  // === Initialisation de l'arbre Treant ===
  return new Treant({
    ...BASE_CHART_CONFIG,
    nodeStructure: tournamentStructure,
  });
}
