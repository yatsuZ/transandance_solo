import { DOMElements } from '../core/dom-elements.js';

/**
 * LeaderboardManager
 * Gère l'affichage du classement des joueurs
 */
export class LeaderboardManager {
  private _DO: DOMElements;

  constructor(dO: DOMElements) {
    this._DO = dO;
  }

  /**
   * Charge et affiche le leaderboard
   */
  public async loadLeaderboard(): Promise<void> {
    try {
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

      this.displayPodium(players.slice(0, 3));
      this.displayTable(players.slice(3, 20));
    } catch (error) {
      console.error('❌ Erreur lors du chargement du leaderboard:', error);
      this.showEmptyState();
    }
  }

  /**
   * Affiche le podium (Top 3)
   */
  private displayPodium(topPlayers: any[]): void {
    // Tableau des éléments du podium
    const podiumElements = [
      {
        avatar: this._DO.leaderboard.avatar1,
        username: this._DO.leaderboard.username1,
        wins: this._DO.leaderboard.wins1
      },
      {
        avatar: this._DO.leaderboard.avatar2,
        username: this._DO.leaderboard.username2,
        wins: this._DO.leaderboard.wins2
      },
      {
        avatar: this._DO.leaderboard.avatar3,
        username: this._DO.leaderboard.username3,
        wins: this._DO.leaderboard.wins3
      }
    ];

    // Remplir les 3 places du podium
    for (let i = 0; i < 3; i++) {
      const player = topPlayers[i];
      const elements = podiumElements[i];

      if (player) {
        elements.avatar.src = player.avatar_url || '/static/util/icon/profile.png';
        elements.username.textContent = player.username;
        elements.wins.textContent = player.wins?.toString() || '0';
      } else {
        // Pas de joueur pour cette place
        elements.username.textContent = '---';
        elements.wins.textContent = '0';
      }
    }
  }

  /**
   * Affiche le tableau (4-20)
   */
  private displayTable(players: any[]): void {
    const tableBody = this._DO.leaderboard.tableBody;
    tableBody.innerHTML = '';

    players.forEach((player, index) => {
      const rank = index + 4; // Commence à 4
      const ratio = player.total_matches > 0
        ? ((player.wins / player.total_matches) * 100).toFixed(1)
        : '0.0';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="rank-cell">${rank}</td>
        <td class="player-cell">
          <img class="player-avatar" src="${player.avatar_url || '/static/util/icon/profile.png'}" alt="${player.username}">
          <span class="player-username">${player.username}</span>
        </td>
        <td class="stat-positive">${player.wins || 0}</td>
        <td class="stat-negative">${player.losses || 0}</td>
        <td>${ratio}%</td>
        <td>${player.tournaments_won || 0} / ${player.tournaments_played || 0}</td>
      `;

      tableBody.appendChild(row);
    });
  }

  /**
   * Affiche l'état vide si aucun joueur
   */
  private showEmptyState(): void {
    this._DO.leaderboard.empty.style.display = 'block';
    this._DO.leaderboard.tableContainer.style.display = 'none';
    this._DO.leaderboard.podium.style.display = 'none';
  }
}
