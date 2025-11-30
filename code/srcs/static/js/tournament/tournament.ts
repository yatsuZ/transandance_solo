import { ConfigMatch, PongGame } from "../pong/pong-game.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { arePlayersValid, clear_Formulaire_Of_Tournament, collectPlayers } from "../utils/validators.js";
import { updateUrl } from "../utils/url-helpers.js";
import { DOMElements } from "../core/dom-elements.js";
import { AuthManager } from "../auth/auth-manager.js";
import { TournamentForm } from "../forms/tournament-form.js";

export type PlayerForTournament = {
  name: string;
  isHuman: boolean;
  aLive: boolean;
};

export declare const Treant: any;

export class Tournament {
  private _DO: DOMElements;
  private players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament];
  private tournamentTree: any = null;
  private stopTournament: boolean = false;
  private onDoMatchTournamentClick: (() => void) | null = null;

  private currentMatch: PongGame | null = null;
  private resizeHandler = () => this.handleResize();
  private onTournamentEndCallback?: () => void;

  private tournamentId: number | null = null;
  private participantIds: Map<string, number> = new Map(); // Map player name → participant_id
  private authenticatedPlayerIndex: number; // Index du joueur qui est le user (-1 si aucun)

  constructor(DO_of_SiteManagement: DOMElements, players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament], authenticatedPlayerIndex: number, onTournamentEnd?: () => void) {
    this._DO = DO_of_SiteManagement;
    this.onTournamentEndCallback = onTournamentEnd;
    this.authenticatedPlayerIndex = authenticatedPlayerIndex;
    // update whovs who ici
    this.players = players;

    console.log("🎮 Tournament créé :", this.players);

    const boutonDeTournoi = this._DO.tournamentElement.divOfButton;
    if (boutonDeTournoi.classList.contains("hidden"))
      boutonDeTournoi.classList.remove("hidden");

    activeAnotherPage(this._DO.pages.treeTournament);
    this.initButtons();
    this.updateWhoVsWhoTexte();

    updateUrl(this._DO.pages.treeTournament, '/tournament')
    this.createTree();
    window.addEventListener("resize", this.resizeHandler);

    // Créer le tournoi en BDD
    this.createTournamentInDatabase();
  }

  // met a jour larbre et re affiche correctmeent on fonction de la taille de la fenetre
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
  public static checkPlayerForTournament(dO: DOMElements, tournamentForm: TournamentForm, createTournament: (players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament] | null, authenticatedPlayerIndex: number) => void): void {
    const form = dO.tournamentElement.form;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const playerNames = collectPlayers(dO.tournamentElement.formPseudoTournament);
      if (!playerNames || !arePlayersValid(playerNames))
        return createTournament(null, -1);

      // Récupérer si c'est un humain ou une IA
      const players  = playerNames.map((name, i) => {
          const isHuman = dO.tournamentElement.formIsHumanCheckbox[i].checked;
          return { name, isHuman, aLive: true };
        }
      ) as [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament];

      // Récupérer quel joueur est le user connecté
      const authenticatedPlayerIndex = tournamentForm.getAuthenticatedPlayerIndex();

      clear_Formulaire_Of_Tournament(dO.tournamentElement.formPseudoTournament);

      createTournament(players, authenticatedPlayerIndex);
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
    const doMatchTournamentBtn = this._DO.buttons.startMatchTournament;

    // metre sa dans une methode a pars et handler
     this.onDoMatchTournamentClick = () => {
      if (this.stopTournament === true) return console.log("Pas de match pour ce tournoi car ce tournoi si est desactiver")
      const configMatch = this.creatConfig();
      console.log("A faire : ⚔️ Début du match suivant. ConfigMatch =", configMatch);
      const matchPage = this._DO.pages.match;

      // Exemple: simulation du vainqueur aléatoire
      activeAnotherPage(matchPage)
      updateUrl(matchPage, "/tournament")

      if (configMatch == null)
        return console.log("Le tournoi est fini il y a un vainquer.");
      this.currentMatch = new PongGame(this._DO, configMatch, true);
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
      // desactiver les bouton un pars un manuellment
      const boutonDeTournoi = this._DO.tournamentElement.divOfButton;
      activeOrHiden(boutonDeTournoi, "Off");
      console.log("FIN du tournoi montrer le vainquer du tournoi.");

      // Envoyer la fin du tournoi en BDD (completed avec winner)
      if (this.tournamentId && alivePlayers.length === 1) {
        const winnerName = alivePlayers[0].name;
        const winnerParticipantId = this.participantIds.get(winnerName);
        this.endTournamentInDatabase(winnerParticipantId || null, 'completed');
      }

      // Notifier SiteManagement que le tournoi est terminé
      if (this.onTournamentEndCallback) {
        this.onTournamentEndCallback();
      }
    }
  }

  private updateWhoVsWhoTexte(){
    const nextMatch = this.creatConfig();
    const texteLabel = this._DO.tournamentElement.texteWhovsWho;
    const spanWhoVsWho = this._DO.tournamentElement.spanWhoVsWho;

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
    const doMatchTournamentBtn = this._DO.buttons.startMatchTournament;

    if (this.onDoMatchTournamentClick) {
      doMatchTournamentBtn.removeEventListener("click", this.onDoMatchTournamentClick);
      console.log("🧹 Listener supprimé sur #doMatchTournament");
    }
    this.onDoMatchTournamentClick = null;

    // Nettoyer le listener resize
    window.removeEventListener("resize", this.resizeHandler);
    console.log("🧹 Listener resize supprimé du tournoi");

    // Envoyer la fin du tournoi en BDD (leave)
    if (this.tournamentId) {
      this.endTournamentInDatabase(null, 'leave');
    }

    if (this.currentMatch) this.currentMatch.stop("Leave Tournament");
    this.currentMatch = null;
    this.stopTournament = true;
  }

  /**
   * Crée un tournoi en BDD et ajoute les participants
   */
  private async createTournamentInDatabase(): Promise<void> {
    try {
      // Récupérer l'ID du user connecté (manager du tournoi)
      const userData = AuthManager.getUserData();
      if (!userData) {
        console.log('⚠️ Pas de user connecté, impossible de créer le tournoi en BDD');
        return;
      }

      // Créer le tournoi
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthManager.getAuthHeader()
        },
        body: JSON.stringify({
          manager_id: userData.id,
          nbr_of_matches: 3
        })
      });

      if (!response.ok) {
        console.log('⚠️ Échec création tournoi en BDD');
        return;
      }

      const data = await response.json();
      this.tournamentId = data.data.id;
      console.log('✅ Tournoi créé en BDD avec ID:', this.tournamentId);

      // Ajouter les 4 participants
      for (let i = 0; i < this.players.length; i++) {
        await this.addParticipantToDatabase(this.players[i], i);
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la création du tournoi en BDD');
    }
  }

  /**
   * Ajoute un participant au tournoi en BDD
   */
  private async addParticipantToDatabase(player: PlayerForTournament, playerIndex: number): Promise<void> {
    if (!this.tournamentId) return;

    try {
      // Récupérer le user connecté
      const userData = AuthManager.getUserData();

      // Si ce joueur est le user connecté (via l'index de la checkbox)
      const userId = (playerIndex === this.authenticatedPlayerIndex && userData) ? userData.id : null;

      const response = await fetch(`/api/tournaments/${this.tournamentId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthManager.getAuthHeader()
        },
        body: JSON.stringify({
          user_id: userId,
          display_name: player.name,
          is_bot: !player.isHuman
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.participantIds.set(player.name, data.data.id);
        console.log(`✅ Participant ${player.name} ajouté (ID: ${data.data.id})`);
      } else {
        console.log(`⚠️ Échec ajout participant ${player.name}`);
      }
    } catch (error) {
      console.log(`⚠️ Erreur ajout participant ${player.name}`);
    }
  }

  /**
   * Termine le tournoi en BDD
   */
  private async endTournamentInDatabase(
    winnerParticipantId: number | null,
    status: 'completed' | 'leave'
  ): Promise<void> {
    if (!this.tournamentId) return;

    try {
      const response = await fetch(`/api/tournaments/${this.tournamentId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthManager.getAuthHeader()
        },
        body: JSON.stringify({
          winner_participant_id: winnerParticipantId,
          status: status
        })
      });

      if (response.ok) {
        console.log(`✅ Tournoi ${this.tournamentId} terminé en BDD (${status})`);
      } else {
        console.log('⚠️ Échec fin tournoi en BDD');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la fin du tournoi en BDD');
    }
  }
}