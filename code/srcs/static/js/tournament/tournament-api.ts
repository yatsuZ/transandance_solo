import { AuthManager } from "../auth/auth-manager.js";
import { PlayerForTournament } from "./tournament.js";

/**
 * TournamentAPI
 * Gère toutes les requêtes API liées aux tournois
 */
export class TournamentAPI {
  private tournamentId: number | null = null;
  private participantIds: Map<string, number> = new Map(); // Map player name → participant_id

  /**
   * Crée un tournoi en BDD
   * @returns L'ID du tournoi créé, ou null en cas d'erreur
   */
  public async createTournament(): Promise<number | null> {
    try {
      const userData = AuthManager.getUserData();
      if (!userData) {
        return null;
      }

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Envoie automatiquement le cookie auth_token
        body: JSON.stringify({
          manager_id: userData.id,
          nbr_of_matches: 3
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      this.tournamentId = data.data.id;
      return this.tournamentId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Ajoute un participant au tournoi en BDD
   */
  public async addParticipant(
    player: PlayerForTournament,
    playerIndex: number,
    authenticatedPlayerIndex: number
  ): Promise<number | null> {
    if (!this.tournamentId) return null;

    try {
      const userData = AuthManager.getUserData();
      const userId = (playerIndex === authenticatedPlayerIndex && userData) ? userData.id : null;

      const response = await fetch(`/api/tournaments/${this.tournamentId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Envoie automatiquement le cookie auth_token
        body: JSON.stringify({
          user_id: userId,
          display_name: player.name,
          is_bot: !player.isHuman
        })
      });

      if (response.ok) {
        const data = await response.json();
        const participantId = data.data.id;
        this.participantIds.set(player.name, participantId);
        return participantId;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Termine le tournoi en BDD
   */
  public async endTournament(
    winnerParticipantId: number | null,
    status: 'completed' | 'leave'
  ): Promise<void> {
    if (!this.tournamentId) return;

    try {
      const response = await fetch(`/api/tournaments/${this.tournamentId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Envoie automatiquement le cookie auth_token
        body: JSON.stringify({
          winner_participant_id: winnerParticipantId,
          status: status
        })
      });

      if (response.ok) {
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * Récupère l'ID du participant par son nom
   */
  public getParticipantId(playerName: string): number | null {
    return this.participantIds.get(playerName) || null;
  }

  /**
   * Récupère l'ID du tournoi actuel
   */
  public getTournamentId(): number | null {
    return this.tournamentId;
  }
}
