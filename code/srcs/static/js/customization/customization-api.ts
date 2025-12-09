/**
 * API Client pour les routes customization
 */

export interface CustomizationConfig {
  paddle_color_left: string | null;
  paddle_color_right: string | null;
  ball_color: string | null;
  vehicle_color_left: string | null;
  vehicle_color_right: string | null;
  trail_color_left: string | null;
  trail_color_right: string | null;
  field_color: string | null;
  text_color: string | null;
  border_color: string | null;
  card_border_color: string | null;
  winning_score: number | null;
  powerups_enabled: boolean;
  countdown_delay: number;
  initial_speed: number;   // Pong only: 50-150%
  max_speed: number;       // Pong only: 100-250%
}

export interface CustomizationResponse {
  success: boolean;
  data?: CustomizationConfig;
  message?: string;
  error?: string;
}

export class CustomizationAPI {
  /**
   * Récupère la config d'un jeu
   */
  static async getConfig(gameType: 'pong' | 'tron'): Promise<CustomizationConfig> {
    const response = await fetch(`/api/customization/${gameType}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const result: CustomizationResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erreur inconnue');
    }

    // console.log(`[Customization API] Config ${gameType} chargée:`, result.data);
    return result.data;
  }

  /**
   * Sauvegarde la config d'un jeu
   */
  static async saveConfig(gameType: 'pong' | 'tron', config: Partial<CustomizationConfig>): Promise<CustomizationConfig> {
    const response = await fetch(`/api/customization/${gameType}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const result: CustomizationResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erreur lors de la sauvegarde');
    }

    console.log(`✅ [Customization] Config ${gameType} sauvegardée`);
    return result.data;
  }

  /**
   * Supprime la config d'un jeu (retour aux valeurs par défaut)
   */
  static async deleteConfig(gameType: 'pong' | 'tron'): Promise<void> {
    const response = await fetch(`/api/customization/${gameType}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Erreur ${response.status}`);
    }

    console.log(`🔄 [Customization] Config ${gameType} réinitialisée`);
  }
}
