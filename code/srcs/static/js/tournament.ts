import { PlayerForTournament } from "./SiteManagement.js"
export declare const Treant: any; // Add type declaration for Treant

export function startTournament(ft_after_submit: (players: [string, string, string, string] | null) => void): void {
  const form = document.getElementById("tournament-form") as HTMLFormElement | null;
  if (!form) {
    console.error("form tournament-form introuvable");
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const inputIds = ["player1", "player2", "player3", "player4"];
    const players: string[] = [];

    for (const id of inputIds) {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (!input) {
        alert(`Le champ ${id} est introuvable dans le DOM !`);
        return (ft_after_submit(null));
      }
      players.push(input.value.trim());
    }

    // Vérifie que tous les pseudos sont remplis
    if (players.some(p => p === "")) {
      alert("Tous les joueurs doivent avoir un pseudo !");
      return (ft_after_submit(null));
    }

    // Vérifie l’unicité
    const uniquePlayers = new Set(players);
    if (uniquePlayers.size !== players.length) {
      alert("Les pseudos des joueurs doivent être uniques !");
      return (ft_after_submit(null));
    }

    inputIds.forEach(id => {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input) input.value = "";
    });

    console.log("Joueurs du tournoi :", players);
    ft_after_submit(players as [string, string, string, string]);
  });
}


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
