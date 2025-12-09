import { AuthManager } from "../auth/auth-manager.js";

/**
 * ProfileAPI
 * Gère toutes les requêtes API liées au profil utilisateur
 */
export class ProfileAPI {
  /**
   * Récupère les stats complètes d'un utilisateur
   */
  public async getUserStats(userId: number): Promise<any | null> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Envoie automatiquement le cookie auth_token
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données utilisateur');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère l'historique des matchs d'un utilisateur
   */
  public async getMatchHistory(userId: number): Promise<any[]> {
    try {
      const response = await fetch(`/api/users/${userId}/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Envoie automatiquement le cookie auth_token
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      return [];
    }
  }
}
