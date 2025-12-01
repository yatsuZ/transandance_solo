import { AuthManager } from "../auth/auth-manager.js";

/**
 * MatchAPI
 * Gère toutes les requêtes API liées aux matchs solo
 */
export class MatchAPI {
  /**
   * Crée un match en BDD
   * @returns L'ID du match créé, ou null en cas d'erreur
   */
  public async createMatch(
    playerLeftName: string,
    playerRightName: string,
    playerLeftId: number | null,
    playerRightId: number | null,
    isBotLeft: number,
    isBotRight: number
  ): Promise<number | null> {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Envoie automatiquement le cookie auth_token
        body: JSON.stringify({
          player_left_id: playerLeftId,
          player_left_name: playerLeftName,
          is_bot_left: isBotLeft,
          player_right_id: playerRightId,
          player_right_name: playerRightName,
          is_bot_right: isBotRight,
          game_type: 'pong'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const matchId = data.data.id;
        console.log('✅ Match créé en BDD avec ID:', matchId);
        return matchId;
      } else {
        console.log('⚠️ Échec création match en BDD');
        return null;
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la création du match en BDD');
      return null;
    }
  }

  /**
   * Termine un match en BDD
   */
  public async endMatch(
    matchId: number,
    winnerId: number | null,
    winnerName: string | null,
    scoreLeft: number,
    scoreRight: number,
    status: 'completed' | 'leave'
  ): Promise<void> {
    try {
      const response = await fetch(`/api/matches/${matchId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Envoie automatiquement le cookie auth_token
        body: JSON.stringify({
          winner_id: winnerId,
          winner_name: winnerName,
          score_left: scoreLeft,
          score_right: scoreRight,
          status: status
        })
      });

      if (response.ok) {
        console.log(`✅ Match ${matchId} terminé en BDD (${status})`);
      } else {
        console.log('⚠️ Échec fin match en BDD');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la fin du match en BDD');
    }
  }
}
