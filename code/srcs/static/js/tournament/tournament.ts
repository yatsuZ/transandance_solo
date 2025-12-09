import { ConfigMatch, PongGame } from "../pong/pong-game.js";
import { activeAnotherPage, activeOrHiden } from "../navigation/page-manager.js";
import { arePlayersValid, clear_Formulaire_Of_Tournament, collectPlayers } from "../utils/validators.js";
import { updateUrl } from "../utils/url-helpers.js";
import { DOMElements } from "../core/dom-elements.js";
import { TournamentForm } from "../game-management/forms/tournament-form.js";
import { TournamentAPI } from "./tournament-api.js";
import { TournamentTree } from "./tournament-tree.js";
import { AuthManager } from "../auth/auth-manager.js";

export type PlayerForTournament = {
  name: string;
  isHuman: boolean;
  aLive: boolean;
  difficulty?: string; // Niveau de difficulté pour les IA (EASY, MEDIUM, HARD, EXPERT)
  avatarUrl?: string | null; // URL de l'avatar si c'est le user connecté
};

/**
 * Tournament
 * Gère la logique métier d'un tournoi (statuts joueurs, matchs, fin)
 */
export class Tournament {
  private _DO: DOMElements;
  private players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament];
  private stopTournament: boolean = false;
  private onDoMatchTournamentClick: (() => void) | null = null;

  private currentMatch: PongGame | null = null;
  private onTournamentEndCallback?: () => void;
  private authenticatedPlayerIndex: number;

  // Modules séparés
  private tournamentAPI: TournamentAPI;
  private tournamentTree: TournamentTree;

  constructor(
    DO_of_SiteManagement: DOMElements,
    players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament],
    authenticatedPlayerIndex: number,
    onTournamentEnd?: () => void
  ) {
    this._DO = DO_of_SiteManagement;
    this.onTournamentEndCallback = onTournamentEnd;
    this.authenticatedPlayerIndex = authenticatedPlayerIndex;
    this.players = players;


    // Initialiser les modules
    this.tournamentAPI = new TournamentAPI();
    this.tournamentTree = new TournamentTree(this.players);

    const boutonDeTournoi = this._DO.tournamentElement.divOfButton;
    if (boutonDeTournoi.classList.contains("hidden"))
      boutonDeTournoi.classList.remove("hidden");

    activeAnotherPage(this._DO.pages.treeTournament);
    this.initButtons();
    this.updateWhoVsWhoTexte();

    updateUrl(this._DO.pages.treeTournament, '/tournament');

    // Créer le tournoi en BDD et ajouter les participants
    this.initTournamentInDatabase();
  }

  /**
   * Écoute le submit du formulaire et crée un tournoi si tout est valide
   */
  public static checkPlayerForTournament(
    dO: DOMElements,
    tournamentForm: TournamentForm,
    createTournament: (
      players: [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament] | null,
      authenticatedPlayerIndex: number
    ) => void
  ): void {
    const form = dO.tournamentElement.form;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const playerNames = collectPlayers(dO.tournamentElement.formPseudoTournament);
      if (!playerNames || !arePlayersValid(playerNames))
        return createTournament(null, -1);

      // Récupérer quel joueur est le user connecté
      const authenticatedPlayerIndex = tournamentForm.getAuthenticatedPlayerIndex();

      // Récupérer l'avatar du user connecté
      const userData = AuthManager.getUserData();
      const userAvatar = userData?.avatar_url || null;

      // Récupérer si c'est un humain ou une IA + la difficulté + l'avatar
      const players = playerNames.map((name, i) => {
        const isHuman = dO.tournamentElement.formIsHumanCheckbox[i].checked;
        const difficulty = isHuman ? undefined : tournamentForm.getAIDifficulty(i);
        const avatarUrl = (i === authenticatedPlayerIndex && isHuman) ? userAvatar : null;
        return { name, isHuman, aLive: true, difficulty, avatarUrl };
      }) as [PlayerForTournament, PlayerForTournament, PlayerForTournament, PlayerForTournament];

      clear_Formulaire_Of_Tournament(dO.tournamentElement.formPseudoTournament);

      createTournament(players, authenticatedPlayerIndex);
    });
  }

  /**
   * Crée la configuration du prochain match
   */
  public creatConfig(): ConfigMatch | null {
    const alivePlayers = this.players.filter(p => p.aLive);

    // Si un seul vivant → fin du tournoi
    if (alivePlayers.length <= 1) {
      this.stopTournament = true;
      return null;
    }

    // Détermination des duels
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
      difficulty: [p1.difficulty, p2.difficulty],
      avatarUrls: [p1.avatarUrl || null, p2.avatarUrl || null],
    };
  }

  /**
   * Initialise les boutons (accueil, abandon, etc.)
   */
  private initButtons(): void {
    const doMatchTournamentBtn = this._DO.buttons.startMatchTournament;

    this.onDoMatchTournamentClick = () => {
      if (this.stopTournament === true) return;

      const configMatch = this.creatConfig();
      const matchPage = this._DO.pages.match;

      activeAnotherPage(matchPage);
      updateUrl(matchPage, "/tournament");

      if (configMatch == null) return;

      this.currentMatch = new PongGame(this._DO, configMatch, true);
    };

    doMatchTournamentBtn.addEventListener("click", this.onDoMatchTournamentClick);
  }

  /**
   * Mise à jour de l'état d'un joueur par nom
   */
  public updatePlayerStatus(name: string, alive: boolean): void {
    const player = this.players.find(p => p.name === name);
    if (!player) return;
    player.aLive = alive;
    this.tournamentTree.createTree();
  }

  /**
   * Mise à jour de l'état d'un joueur par index
   */
  public updatePlayerStatusByIndex(index: number, alive: boolean): void {
    this.players[index].aLive = alive;
    this.tournamentTree.createTree();
  }

  /**
   * Met à jour le tournoi après la fin d'un match
   */
  public updateEndMatch(): void {
    const winnerAndLosser = this.currentMatch ? this.currentMatch.getWinnerAndLooser() : null;

    if (this.currentMatch === null || winnerAndLosser === null) {
      return;
    }

    // Mettre à jour l'arbre + joueurs vivants/morts + détruire l'entité match
    this.updatePlayerStatus(winnerAndLosser.Looser.name, false);
    this.currentMatch = null;

    const alivePlayers = this.players.filter(p => p.aLive);

    this.updateWhoVsWhoTexte();

    if (alivePlayers.length <= 1) {
      // Désactiver les boutons
      const boutonDeTournoi = this._DO.tournamentElement.divOfButton;
      activeOrHiden(boutonDeTournoi, "Off");

      // Envoyer la fin du tournoi en BDD (completed avec winner)
      if (alivePlayers.length === 1) {
        const winnerName = alivePlayers[0].name;
        const winnerParticipantId = this.tournamentAPI.getParticipantId(winnerName);
        this.tournamentAPI.endTournament(winnerParticipantId, 'completed');
      }

      // Notifier SiteManagement que le tournoi est terminé
      if (this.onTournamentEndCallback) {
        this.onTournamentEndCallback();
      }
    }
  }

  /**
   * Met à jour le texte "Qui vs Qui"
   */
  private updateWhoVsWhoTexte(): void {
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

  /**
   * Arrête le tournoi (abandon)
   */
  public ft_stopTournament(): void {
    const doMatchTournamentBtn = this._DO.buttons.startMatchTournament;

    if (this.onDoMatchTournamentClick) {
      doMatchTournamentBtn.removeEventListener("click", this.onDoMatchTournamentClick);
    }
    this.onDoMatchTournamentClick = null;

    // Nettoyer l'arbre
    this.tournamentTree.cleanup();

    // Envoyer la fin du tournoi en BDD (leave)
    this.tournamentAPI.endTournament(null, 'leave');

    if (this.currentMatch) this.currentMatch.stop("Leave Tournament");
    this.currentMatch = null;
    this.stopTournament = true;
  }

  /**
   * Initialise le tournoi en BDD et ajoute les participants
   */
  private async initTournamentInDatabase(): Promise<void> {
    const tournamentId = await this.tournamentAPI.createTournament();
    if (!tournamentId) return;

    // Ajouter les 4 participants
    for (let i = 0; i < this.players.length; i++) {
      await this.tournamentAPI.addParticipant(this.players[i], i, this.authenticatedPlayerIndex);
    }
  }
}
