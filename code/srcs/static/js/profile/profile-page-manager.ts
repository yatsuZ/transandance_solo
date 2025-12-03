import { AuthManager } from '../auth/auth-manager.js';
import { DOMElements } from '../core/dom-elements.js';
import { ProfileAPI } from './profile-api.js';
import { ProfileControlsManager } from './profile-controls-manager.js';
import { ProfileEditManager } from './profile-edit-manager.js';
import { refreshPageDescription } from '../ui/description-manager.js';

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
   *
   * @param friendUsername - Si fourni, charge le profil de cet ami (mode lecture seule)
   */
  public async loadProfile(friendUsername?: string): Promise<void> {
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

    // Mode ami : charger le profil d'un ami
    if (friendUsername) {
      await this.loadFriendProfile(friendUsername);
      return;
    }

    // Mode normal : charger son propre profil
    // Charger les stats utilisateur
    const user = await this.profileAPI.getUserStats(userData.id);
    if (user) {
      this.displayUserStats(user);
    }

    // Afficher les contrôles clavier
    this.controlsManager.displayControls();

    // Charger l'historique des matchs
    await this.loadMatchHistory(userData.id);

    // Charger la liste des amis
    await this.loadFriendsList();

    // Afficher les éléments d'édition
    this.showEditElements();

    // Cacher le bouton de retour si présent
    this.hideBackButton();

    // Réafficher les sections cachées
    this.showControlsSection();
    this.showFriendsSection();

    // Rafraîchir la description de la page
    refreshPageDescription();
  }

  /**
   * Charge le profil d'un ami (mode lecture seule)
   */
  private async loadFriendProfile(username: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/profile/${username}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        alert('Impossible de charger le profil de cet ami');
        return;
      }

      const result = await response.json();
      const { user, matchHistory } = result.data;

      // Afficher les stats de l'ami
      this.displayUserStats(user);

      // Afficher l'historique de l'ami
      this.displayFriendMatchHistory(matchHistory, user.id);

      // Cacher les éléments d'édition et les contrôles
      this.hideEditElements();
      this.hideControlsSection();
      this.hideFriendsSection();

      // Ajouter un bouton de retour
      this.showBackButton();

      // Rafraîchir la description de la page
      refreshPageDescription();

      console.log(`✅ Profil de ${username} chargé`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil ami:', error);
      alert('Erreur lors du chargement du profil');
    }
  }

  /**
   * Affiche un bouton de retour vers son propre profil
   */
  private showBackButton(): void {
    // Vérifier si le bouton existe déjà
    let backBtn = document.getElementById('back-to-my-profile-btn') as HTMLButtonElement;

    if (!backBtn) {
      // Créer le bouton
      backBtn = document.createElement('button');
      backBtn.id = 'back-to-my-profile-btn';
      backBtn.className = 'btn-back-profile';
      backBtn.textContent = '← Retour à mon profil';

      // Insérer le bouton au début du profil
      const profileSection = document.querySelector('.profile-section');
      if (profileSection) {
        profileSection.insertBefore(backBtn, profileSection.firstChild);
      }
    }

    backBtn.style.display = 'block';

    // Event listener
    backBtn.onclick = () => {
      window.history.pushState({}, '', '/profile');
      this.loadProfile(); // Charger son propre profil
    };
  }

  /**
   * Cache le bouton de retour
   */
  private hideBackButton(): void {
    const backBtn = document.getElementById('back-to-my-profile-btn');
    if (backBtn) {
      backBtn.style.display = 'none';
    }
  }

  /**
   * Affiche l'historique des matchs d'un ami
   */
  private displayFriendMatchHistory(matches: any[], userId: number): void {
    const historyList = this._DO.profile.historyList;
    const historyEmpty = this._DO.profile.historyEmpty;

    // Vider la liste existante
    historyList.innerHTML = '';

    if (matches.length === 0) {
      historyEmpty.style.display = 'block';
      historyList.style.display = 'none';
    } else {
      historyEmpty.style.display = 'none';
      historyList.style.display = 'block';

      const recentMatches = matches.slice(0, 10);
      recentMatches.forEach((match: any) => {
        const matchItem = this.createMatchHistoryItem(match, userId);
        historyList.appendChild(matchItem);
      });
    }
  }

  /**
   * Cache les éléments d'édition (icône edit, boutons, etc.)
   */
  private hideEditElements(): void {
    // Cacher l'icône d'édition
    if (this._DO.icons.edit) {
      this._DO.icons.edit.style.display = 'none';
    }
  }

  /**
   * Affiche les éléments d'édition
   */
  private showEditElements(): void {
    if (this._DO.icons.edit) {
      this._DO.icons.edit.style.display = 'block';
    }
  }

  /**
   * Cache la section des contrôles
   */
  private hideControlsSection(): void {
    const controlsSection = document.querySelector('.controls-section') as HTMLElement;
    if (controlsSection) {
      controlsSection.style.display = 'none';
    }
  }

  /**
   * Affiche la section des contrôles
   */
  private showControlsSection(): void {
    const controlsSection = document.querySelector('.controls-section') as HTMLElement;
    if (controlsSection) {
      controlsSection.style.display = 'block';
    }
  }

  /**
   * Cache la section des amis
   */
  private hideFriendsSection(): void {
    const friendsSection = document.querySelector('.friends-section') as HTMLElement;
    if (friendsSection) {
      friendsSection.style.display = 'none';
    }
  }

  /**
   * Affiche la section des amis
   */
  private showFriendsSection(): void {
    const friendsSection = document.querySelector('.friends-section') as HTMLElement;
    if (friendsSection) {
      friendsSection.style.display = 'block';
    }
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

  /**
   * Charge et affiche la liste des amis
   */
  private async loadFriendsList(): Promise<void> {
    try {
      const response = await fetch('/api/friendships', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Erreur lors du chargement des amis');
        return;
      }

      const result = await response.json();
      const friends = result.data || [];

      const friendsCount = document.getElementById('friends-count');
      const friendsList = document.getElementById('friends-list');
      const friendsEmpty = document.getElementById('friends-empty');

      if (!friendsList || !friendsEmpty || !friendsCount) return;

      // Mettre à jour le compteur
      friendsCount.textContent = friends.length.toString();

      if (friends.length === 0) {
        // Aucun ami
        friendsEmpty.style.display = 'block';
        friendsList.innerHTML = '';
      } else {
        // Afficher les amis
        friendsEmpty.style.display = 'none';
        friendsList.innerHTML = '';

        friends.forEach((friend: any) => {
          const friendCard = this.createFriendCard(friend);
          friendsList.appendChild(friendCard);
        });

        console.log(`✅ ${friends.length} ami(s) chargé(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des amis:', error);
    }
  }

  /**
   * Crée une carte d'ami
   */
  private createFriendCard(friend: any): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.style.cursor = 'pointer';

    const winRate = friend.total_matches > 0
      ? ((friend.wins / friend.total_matches) * 100).toFixed(0)
      : '0';

    card.innerHTML = `
      <img class="friend-avatar" src="${friend.avatar_url || '/static/util/icon/profile.png'}" alt="${friend.username}">
      <div class="friend-username">${friend.username}</div>
      <div class="friend-stats">
        <div class="friend-stat">
          <span class="friend-stat-label">Matchs</span>
          <span class="friend-stat-value">${friend.total_matches || 0}</span>
        </div>
        <div class="friend-stat">
          <span class="friend-stat-label">Victoires</span>
          <span class="friend-stat-value">${friend.wins || 0}</span>
        </div>
        <div class="friend-stat">
          <span class="friend-stat-label">%</span>
          <span class="friend-stat-value">${winRate}%</span>
        </div>
      </div>
      <button class="friend-remove-btn" data-friend-id="${friend.id}">Retirer</button>
    `;

    // Event listener pour voir le profil de l'ami (cliquer sur la carte)
    card.addEventListener('click', () => {
      window.history.pushState({}, '', `/profile/ami/${friend.username}`);
      this.loadProfile(friend.username);
    });

    // Event listener pour retirer l'ami (bouton)
    const removeBtn = card.querySelector('.friend-remove-btn') as HTMLButtonElement;
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher le clic sur la carte
        this.removeFriend(friend.id, friend.username, card);
      });
    }

    return card;
  }

  /**
   * Retire un ami
   */
  private async removeFriend(friendId: number, friendUsername: string, card: HTMLElement): Promise<void> {
    const confirm = window.confirm(`Êtes-vous sûr de vouloir retirer ${friendUsername} de vos amis ?`);
    if (!confirm) return;

    try {
      const response = await fetch(`/api/friendships/${friendId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        // Succès - retirer la carte visuellement
        card.remove();

        // Mettre à jour le compteur
        const friendsCount = document.getElementById('friends-count');
        if (friendsCount) {
          const currentCount = parseInt(friendsCount.textContent || '0');
          friendsCount.textContent = (currentCount - 1).toString();
        }

        // Vérifier s'il reste des amis
        const friendsList = document.getElementById('friends-list');
        if (friendsList && friendsList.children.length === 0) {
          const friendsEmpty = document.getElementById('friends-empty');
          if (friendsEmpty) friendsEmpty.style.display = 'block';
        }

        alert(`${friendUsername} a été retiré de vos amis`);
      } else {
        alert(result.error || 'Erreur lors du retrait de l\'ami');
      }
    } catch (error) {
      console.error('❌ Erreur lors du retrait de l\'ami:', error);
      alert('Erreur lors du retrait de l\'ami');
    }
  }
}
