import { DOMElements } from '../core/dom-elements.js';
import { userSession } from '../auth/user-session.js';

export class LeaderboardManager {
  private _DO: DOMElements;
  private currentUserId: number | null = null;
  private friendsList: Set<number> = new Set();

  constructor(dO: DOMElements) {
    this._DO = dO;
  }

  public async loadLeaderboard(): Promise<void> {
    this._DO.leaderboard.podiumSection.style.display = 'none';
    this._DO.leaderboard.rankingSection.style.display = 'none';
    this._DO.leaderboard.noMatchSection.style.display = 'none';

    try {
      this.currentUserId = userSession.getUserId();

      if (this.currentUserId) {
        await this.loadFriendsList();
      }

      const response = await fetch('/api/users/leaderboard/top?limit=20', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du leaderboard');
      }

      const result = await response.json();
      const players = result.data || [];

      if (players.length === 0) {
        this.showEmptyState();
        return;
      }

      this.showSections();

      this.displayPodium(players.slice(0, 3));
      this.displayRankingTable(players);
    } catch (error) {
      this.showEmptyState();
    }
  }

  private async loadFriendsList(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const response = await fetch('/api/friendships', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const friends = result.data || [];
        this.friendsList = new Set(friends.map((f: any) => f.id));
      }
    } catch (error) {
    }
  }

  private displayPodium(topPlayers: any[]): void {
    for (let i = 0; i < 3; i++) {
      const rank = i + 1;
      const player = topPlayers[i];

      const podiumPlace = document.getElementById(`podium-${rank}`);
      const avatar = document.getElementById(`leaderboard-avatar-${rank}`) as HTMLImageElement;
      const username = document.getElementById(`leaderboard-username-${rank}`);
      const matches = document.getElementById(`leaderboard-matches-${rank}`);
      const goals = document.getElementById(`leaderboard-goals-${rank}`);
      const goalsConceded = document.getElementById(`leaderboard-goals-conceded-${rank}`);
      const friends = document.getElementById(`leaderboard-friends-${rank}`);
      const addFriendBtn = podiumPlace?.querySelector('.btn-add-friend') as HTMLButtonElement;

      if (!player) {
        if (podiumPlace) podiumPlace.style.display = 'none';
        continue;
      }

      if (podiumPlace) podiumPlace.style.display = 'flex';

      if (avatar) avatar.src = player.avatar_url || '/static/util/icon/profile.png';
      if (username) username.textContent = player.username;
      if (matches) matches.textContent = player.total_matches?.toString() || '0';
      if (goals) goals.textContent = player.total_goals_scored?.toString() || '0';
      if (goalsConceded) goalsConceded.textContent = player.total_goals_conceded?.toString() || '0';
      if (friends) friends.textContent = player.friend_count?.toString() || '0';

      if (addFriendBtn && this.currentUserId) {
        const isCurrentUser = player.id === this.currentUserId;
        const isFriend = this.friendsList.has(player.id);

        if (isCurrentUser) {
          addFriendBtn.style.display = 'none';
        } else if (isFriend) {
          addFriendBtn.style.display = 'block';
          addFriendBtn.textContent = '✓ AMI';
          addFriendBtn.classList.add('already-friend');
          addFriendBtn.disabled = true;
        } else {
          addFriendBtn.style.display = 'block';
          addFriendBtn.textContent = '+ AJOUTER AMI';
          addFriendBtn.classList.remove('already-friend');
          addFriendBtn.disabled = false;
          addFriendBtn.dataset.userId = player.id.toString();

          addFriendBtn.onclick = () => this.addFriend(player.id, player.username, addFriendBtn);
        }
      } else if (addFriendBtn) {
        addFriendBtn.style.display = 'none';
      }
    }
  }

  private displayRankingTable(players: any[]): void {
    const tableBody = document.getElementById('ranking-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (players.length === 0) {
      document.getElementById('ranking-empty')!.style.display = 'block';
      return;
    }

    document.getElementById('ranking-empty')!.style.display = 'none';

    players.forEach((player, index) => {
      const rank = index + 1; // Commence à 1
      const winRate = player.total_matches > 0
        ? ((player.wins / player.total_matches) * 100).toFixed(1)
        : '0.0';

      const goalsDiff = player.total_goals_scored - player.total_goals_conceded;
      const goalsClass = goalsDiff > 0 ? 'stat-positive' : goalsDiff < 0 ? 'stat-negative' : '';

      const isTop3 = rank <= 3;
      const top3Class = isTop3 ? 'top3-row' : '';
      const rankColor = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';

      const row = document.createElement('tr');
      row.className = top3Class;
      row.innerHTML = `
        <td class="col-rank ${rankColor}">${rank}</td>
        <td class="col-player">
          <img class="player-avatar" src="${player.avatar_url || '/static/util/icon/profile.png'}" alt="${player.username}">
          <span class="player-name">${player.username}</span>
        </td>
        <td class="col-stat">${player.total_matches || 0}</td>
        <td class="col-stat">${player.wins || 0}</td>
        <td class="col-stat ${goalsClass}">+${player.total_goals_scored || 0} / -${player.total_goals_conceded || 0}</td>
        <td class="col-stat">${winRate}%</td>
        <td class="col-stat">${player.friend_count || 0}</td>
      `;

      tableBody.appendChild(row);
    });
  }

  private async addFriend(friendId: number, friendUsername: string, button: HTMLButtonElement): Promise<void> {
    if (!this.currentUserId) {
      alert('Vous devez être connecté pour ajouter des amis');
      return;
    }

    button.disabled = true;
    button.textContent = '...';

    try {
      const response = await fetch('/api/friendships/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ friendId })
      });

      const result = await response.json();

      if (response.ok) {
        button.textContent = '✓ AMI';
        button.classList.add('already-friend');
        this.friendsList.add(friendId);

        alert(`Vous êtes maintenant ami avec ${friendUsername} !`);
      } else {
        alert(result.error || 'Erreur lors de l\'ajout de l\'ami');
        button.disabled = false;
        button.textContent = '+ AJOUTER AMI';
      }
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'ami');
      button.disabled = false;
      button.textContent = '+ AJOUTER AMI';
    }
  }

  private showSections(): void {
    this._DO.leaderboard.noMatchSection.style.display = 'none';
    this._DO.leaderboard.podiumSection.style.display = 'block';
    this._DO.leaderboard.rankingSection.style.display = 'block';
  }

  private showEmptyState(): void {
    this._DO.leaderboard.noMatchSection.style.display = 'flex';
    this._DO.leaderboard.podiumSection.style.display = 'none';
    this._DO.leaderboard.rankingSection.style.display = 'none';
  }
}
