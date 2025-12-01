import { AuthManager } from '../auth/auth-manager.js';
import { DOMElements } from '../core/dom-elements.js';
import { ProfileAPI } from './profile-api.js';
import { ProfileControlsManager } from './profile-controls-manager.js';
import { ProfileEditManager } from './profile-edit-manager.js';

/**
 * Interface pour les stats utilisateur
 */
interface UserProfileData {
  id: number;
  username: string;
  avatar_url: string;
  wins: number;
  losses: number;
  total_matches: number;
  total_goals_scored: number;
  total_goals_conceded: number;
  tournaments_played: number;
  tournaments_won: number;
}

/**
 * Interface pour un match de l'historique
 */
interface MatchHistoryItem {
  id: number;
  player_left_id: number | null;
  player_left_name: string;
  is_bot_left: number;
  player_right_id: number | null;
  player_right_name: string;
  is_bot_right: number;
  score_left: number;
  score_right: number;
  winner_id: number | null;
  status: 'completed' | 'leave';
  start_at: string;
}

/**
 * ProfilePageManager
 * Orchestre l'affichage de la page Profile :
 * - Stats utilisateur
 * - Contrôles clavier
 * - Édition du profil
 * - Historique des matchs
 */
export class ProfilePageManager {
  private _DO: DOMElements;
  private profileAPI: ProfileAPI;
  private controlsManager: ProfileControlsManager;
  private editManager: ProfileEditManager;

  constructor(dO: DOMElements) {
    this._DO = dO;
    this.profileAPI = new ProfileAPI();
    this.controlsManager = new ProfileControlsManager(dO);
    this.editManager = new ProfileEditManager(dO);

    // Attacher l'event pour ouvrir la modal d'édition via l'icône
    this._DO.icons.edit.addEventListener('click', () => {
      this.editManager.openEditModal();
    });
  }

  /**
   * Charge et affiche les données du profil
   * Point d'entrée principal appelé lors de l'accès à la page Profile
   */
  public async loadProfile(): Promise<void> {
    // Vérifier l'auth pour rafraîchir la session avec les données du serveur
    const isAuthenticated = await AuthManager.verifyAuth();

    if (!isAuthenticated) {
      console.error('❌ Non authentifié');
      return;
    }

    const userData = AuthManager.getUserData();

    if (!userData) {
      console.error('❌ Pas de données utilisateur');
      return;
    }

    // Charger les stats utilisateur
    const user = await this.profileAPI.getUserStats(userData.id);
    if (user) {
      this.displayUserStats(user);
    }

    // Afficher les contrôles clavier
    this.controlsManager.displayControls();

    // Charger l'historique des matchs
    await this.loadMatchHistory(userData.id);
  }

  /**
   * Affiche les stats de l'utilisateur
   */
  private displayUserStats(user: UserProfileData): void {
    // Afficher le username dans le titre (CSS fera la transformation en majuscules)
    this._DO.profile.username.textContent = user.username || 'Inconnu';

    // Afficher la photo de profil
    this._DO.profile.pdp.src = user.avatar_url || '/static/util/icon/profile.png';
    this._DO.profile.pdp.alt = `Photo de profil de ${user.username}`;

    // Afficher les stats
    this._DO.profile.statMatch.textContent = user.total_matches?.toString() || '0';
    this._DO.profile.statWin.textContent = user.wins?.toString() || '0';
    this._DO.profile.statLose.textContent = user.losses?.toString() || '0';
    this._DO.profile.statTournamentsPlayed.textContent = user.tournaments_played?.toString() || '0';
    this._DO.profile.statTournamentsWon.textContent = user.tournaments_won?.toString() || '0';
    this._DO.profile.statGoal.textContent = user.total_goals_scored?.toString() || '0';
    this._DO.profile.statGoalAgainst.textContent = user.total_goals_conceded?.toString() || '0';

    console.log('✅ Profil chargé avec succès');
  }

  /**
   * Charge et affiche l'historique des matchs de l'utilisateur
   */
  private async loadMatchHistory(userId: number): Promise<void> {
    const matches = await this.profileAPI.getMatchHistory(userId);

    const historyList = this._DO.profile.historyList;
    const historyEmpty = this._DO.profile.historyEmpty;

    // Vider la liste existante
    historyList.innerHTML = '';

    if (matches.length === 0) {
      // Aucun match : afficher le message
      historyEmpty.style.display = 'block';
      historyList.style.display = 'none';
    } else {
      // Des matchs existent : afficher la liste
      historyEmpty.style.display = 'none';
      historyList.style.display = 'block';

      // Afficher les 10 derniers matchs
      const recentMatches = matches.slice(0, 10);

      recentMatches.forEach((match: any) => {
        const matchItem = this.createMatchHistoryItem(match, userId);
        historyList.appendChild(matchItem);
      });

      console.log(`✅ ${matches.length} match(s) chargé(s)`);
    }
  }

  /**
   * Crée un élément HTML pour un match de l'historique
   */
  private createMatchHistoryItem(match: MatchHistoryItem, userId: number): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'match-item';

    // Déterminer le nom du user, l'adversaire et son type
    const { userName, opponent } = this.getMatchPlayers(match, userId);
    const { resultClass, resultText } = this.getMatchResult(match, userId);

    // Formater la date
    const date = new Date(match.start_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Construire le HTML
    li.innerHTML = `
      <span class="match-date">${date}</span>
      <span class="match-players">${userName} vs ${opponent}</span>
      <span class="match-score">${match.score_left} - ${match.score_right}</span>
      <span class="match-result ${resultClass}">${resultText}</span>
    `;

    return li;
  }

  /**
   * Détermine les noms et types des joueurs
   */
  private getMatchPlayers(match: MatchHistoryItem, userId: number): { userName: string; opponent: string } {
    let userName = '';
    let opponent = '';
    let opponentType = '';

    if (match.player_left_id === userId) {
      // Je suis à gauche, l'adversaire est à droite
      userName = match.player_left_name;
      opponent = match.player_right_name;
      opponentType = this.getPlayerType(match.player_right_id, match.is_bot_right);
    } else {
      // Je suis à droite, l'adversaire est à gauche
      userName = match.player_right_name;
      opponent = match.player_left_name;
      opponentType = this.getPlayerType(match.player_left_id, match.is_bot_left);
    }

    opponent += opponentType;

    return { userName, opponent };
  }

  /**
   * Détermine le type d'un joueur (HUMAIN, BOT, GUEST)
   */
  private getPlayerType(playerId: number | null, isBot: number): string {
    // HUMAIN : player_id > 0 (user enregistré)
    // BOT : player_id === null ET is_bot === 1
    // GUEST : player_id === null ET is_bot === 0
    if (playerId !== null && playerId > 0) {
      return ' (HUMAIN)';
    } else if (isBot === 1) {
      return ' (BOT)';
    } else {
      return ' (GUEST)';
    }
  }

  /**
   * Détermine le résultat d'un match (VICTOIRE, DÉFAITE, ABANDON)
   */
  private getMatchResult(match: MatchHistoryItem, userId: number): { resultClass: string; resultText: string } {
    if (match.status === 'leave') {
      return {
        resultClass: 'abandon',
        resultText: 'ABANDON'
      };
    }

    const isWinner = match.winner_id === userId;
    return {
      resultClass: isWinner ? 'win' : 'lose',
      resultText: isWinner ? 'VICTOIRE' : 'DÉFAITE'
    };
  }
}
