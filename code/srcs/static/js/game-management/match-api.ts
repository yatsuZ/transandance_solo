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
    isBotRight: number,
    gameType: string = 'pong'
  ): Promise<number | null> {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          player_left_id: playerLeftId,
          player_left_name: playerLeftName,
          is_bot_left: isBotLeft,
          player_right_id: playerRightId,
          player_right_name: playerRightName,
          is_bot_right: isBotRight,
          game_type: gameType
        })
      });

      if (response.ok) {
        const data = await response.json();
        const matchId = data.data.id;
        return matchId;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[MatchAPI] Erreur création match: ${response.status}`, errorData);
        return null;
      }
    } catch (error) {
      console.error('[MatchAPI] Erreur réseau lors de la création du match:', error);
      return null;
    }
  }

  /**
   * Termine un match en BDD
   * @returns true si succès, false si erreur
   */
  public async endMatch(
    matchId: number,
    winnerId: number | null,
    winnerName: string | null,
    scoreLeft: number,
    scoreRight: number,
    status: 'completed' | 'leave'
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/matches/${matchId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          winner_id: winnerId,
          winner_name: winnerName,
          score_left: scoreLeft,
          score_right: scoreRight,
          status: status
        })
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[MatchAPI] Erreur fin de match ${matchId}: ${response.status}`, errorData);
        return false;
      }
    } catch (error) {
      console.error(`[MatchAPI] Erreur réseau lors de la fin du match ${matchId}:`, error);
      return false;
    }
  }
}
