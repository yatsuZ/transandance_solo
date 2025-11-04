export declare const Treant: any; // Add type declaration for Treant

export function createTree(): typeof Treant {

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
        HTMLclass: "match-node past", // match passé
        children: [
          { text: { name: "Joueur 1" }, HTMLclass: "player-leaf eliminate" },
          { text: { name: "Joueur 2" }, HTMLclass: "player-leaf alive" }
        ]
      },
      {
        text: { name: "Match 2" },
        HTMLclass: "match-node future", // match à venir
        children: [
          { text: { name: "Joueur 3" }, HTMLclass: "player-leaf alive" },
          { text: { name: "Joueur 4" }, HTMLclass: "player-leaf alive" }
        ]
      }
    ]
  };

  // Initialiser l'arbre Treant.js avec la structure et la config
  const verif = new Treant({
    ...BASE_CHART_CONFIG,
    nodeStructure: tournamentStructure
  });
  // console.log("verif = ", verif);
  return verif;
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
