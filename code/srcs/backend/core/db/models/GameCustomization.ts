import Database from 'better-sqlite3';
import { db } from '../config.js';

/**
 * Interface complète de la table game_customization
 * Une seule ligne par utilisateur contenant TOUS les champs (Pong + Tron)
 */
export interface GameCustomization {
  user_id: number;

  // Couleurs PONG (format hex #RRGGBB)
  pong_paddle_color_left: string | null;
  pong_paddle_color_right: string | null;
  pong_ball_color: string | null;
  pong_field_color: string | null;
  pong_text_color: string | null;
  pong_border_color: string | null;
  pong_card_border_color: string | null;

  // Couleurs TRON (format hex #RRGGBB)
  tron_vehicle_color_left: string | null;
  tron_vehicle_color_right: string | null;
  tron_trail_color_left: string | null;
  tron_trail_color_right: string | null;
  tron_field_color: string | null;
  tron_text_color: string | null;
  tron_border_color: string | null;
  tron_card_border_color: string | null;

  // Gameplay PONG
  pong_winning_score: number | null;
  pong_powerups_enabled: number; // 0 = désactivés, 1 = activés
  pong_countdown_delay: number;

  // Gameplay TRON
  tron_winning_score: number | null;
  tron_powerups_enabled: number;
  tron_countdown_delay: number;

  // Meta
  created_at: string;
  updated_at: string;
}

/**
 * Données de customization spécifiques à un jeu (Pong OU Tron)
 * Utilisé pour les GET/PUT par jeu
 */
export interface GameSpecificCustomization {
  // Couleurs Pong
  paddle_color_left?: string | null;
  paddle_color_right?: string | null;
  ball_color?: string | null;

  // Couleurs Tron
  vehicle_color_left?: string | null;
  vehicle_color_right?: string | null;
  trail_color_left?: string | null;
  trail_color_right?: string | null;

  // Couleurs communes
  field_color?: string | null;
  text_color?: string | null;
  border_color?: string | null;
  card_border_color?: string | null;

  // Gameplay
  winning_score?: number | null;
  powerups_enabled?: number;
  countdown_delay?: number;
}

/**
 * Repository pour gérer les opérations CRUD sur la table game_customization
 */
export class GameCustomizationRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  /**
   * Récupère la config complète d'un utilisateur
   * @returns GameCustomization ou null si pas de config
   */
  getFullCustomization(userId: number): GameCustomization | null {
    const stmt = this.db.prepare('SELECT * FROM game_customization WHERE user_id = ?');
    const result = stmt.get(userId) as GameCustomization | undefined;
    return result || null;
  }

  /**
   * Récupère la config d'un jeu spécifique pour un utilisateur
   * Extrait seulement les champs pong_* ou tron_* selon le gameType
   * @returns GameSpecificCustomization ou null si pas de config
   */
  getCustomization(userId: number, gameType: 'pong' | 'tron'): GameSpecificCustomization | null {
    const fullConfig = this.getFullCustomization(userId);
    if (!fullConfig) return null;

    if (gameType === 'pong') {
      return {
        paddle_color_left: fullConfig.pong_paddle_color_left,
        paddle_color_right: fullConfig.pong_paddle_color_right,
        ball_color: fullConfig.pong_ball_color,
        field_color: fullConfig.pong_field_color,
        text_color: fullConfig.pong_text_color,
        border_color: fullConfig.pong_border_color,
        card_border_color: fullConfig.pong_card_border_color,
        winning_score: fullConfig.pong_winning_score,
        powerups_enabled: fullConfig.pong_powerups_enabled,
        countdown_delay: fullConfig.pong_countdown_delay
      };
    } else {
      return {
        vehicle_color_left: fullConfig.tron_vehicle_color_left,
        vehicle_color_right: fullConfig.tron_vehicle_color_right,
        trail_color_left: fullConfig.tron_trail_color_left,
        trail_color_right: fullConfig.tron_trail_color_right,
        field_color: fullConfig.tron_field_color,
        text_color: fullConfig.tron_text_color,
        border_color: fullConfig.tron_border_color,
        card_border_color: fullConfig.tron_card_border_color,
        winning_score: fullConfig.tron_winning_score,
        powerups_enabled: fullConfig.tron_powerups_enabled,
        countdown_delay: fullConfig.tron_countdown_delay
      };
    }
  }

  /**
   * Crée ou met à jour la config d'un jeu pour un utilisateur
   * Met à jour seulement les champs du jeu concerné (pong_* ou tron_*)
   */
  upsertCustomization(
    userId: number,
    gameType: 'pong' | 'tron',
    data: GameSpecificCustomization
  ): GameSpecificCustomization {
    const existing = this.getFullCustomization(userId);

    if (existing) {
      // Mettre à jour seulement les champs du jeu concerné
      return this.updateCustomization(userId, gameType, data);
    } else {
      // Créer une nouvelle ligne avec seulement les colonnes du jeu concerné
      if (gameType === 'pong') {
        const stmt = this.db.prepare(`
          INSERT INTO game_customization (
            user_id,
            pong_paddle_color_left, pong_paddle_color_right, pong_ball_color,
            pong_field_color, pong_text_color, pong_border_color, pong_card_border_color,
            pong_winning_score, pong_powerups_enabled, pong_countdown_delay
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          userId,
          data.paddle_color_left || null,
          data.paddle_color_right || null,
          data.ball_color || null,
          data.field_color || null,
          data.text_color || null,
          data.border_color || null,
          data.card_border_color || null,
          data.winning_score || null,
          data.powerups_enabled !== undefined ? data.powerups_enabled : 0,
          data.countdown_delay !== undefined ? data.countdown_delay : 3
        );
      } else {
        const stmt = this.db.prepare(`
          INSERT INTO game_customization (
            user_id,
            tron_vehicle_color_left, tron_vehicle_color_right,
            tron_trail_color_left, tron_trail_color_right,
            tron_field_color, tron_text_color, tron_border_color, tron_card_border_color,
            tron_winning_score, tron_powerups_enabled, tron_countdown_delay
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          userId,
          data.vehicle_color_left || null,
          data.vehicle_color_right || null,
          data.trail_color_left || null,
          data.trail_color_right || null,
          data.field_color || null,
          data.text_color || null,
          data.border_color || null,
          data.card_border_color || null,
          data.winning_score || null,
          data.powerups_enabled !== undefined ? data.powerups_enabled : 0,
          data.countdown_delay !== undefined ? data.countdown_delay : 3
        );
      }

      return this.getCustomization(userId, gameType)!;
    }
  }

  /**
   * Met à jour partiellement la config d'un jeu pour un utilisateur
   * Met à jour seulement les champs pong_* ou tron_* selon le gameType
   */
  updateCustomization(
    userId: number,
    gameType: 'pong' | 'tron',
    data: GameSpecificCustomization
  ): GameSpecificCustomization {
    const prefix = gameType === 'pong' ? 'pong' : 'tron';
    const fields: string[] = [];
    const values: any[] = [];

    // Map les champs génériques vers les colonnes préfixées
    const fieldMap: { [key: string]: string } = {
      paddle_color_left: `${prefix}_paddle_color_left`,
      paddle_color_right: `${prefix}_paddle_color_right`,
      ball_color: `${prefix}_ball_color`,
      vehicle_color_left: `${prefix}_vehicle_color_left`,
      vehicle_color_right: `${prefix}_vehicle_color_right`,
      trail_color_left: `${prefix}_trail_color_left`,
      trail_color_right: `${prefix}_trail_color_right`,
      field_color: `${prefix}_field_color`,
      text_color: `${prefix}_text_color`,
      border_color: `${prefix}_border_color`,
      card_border_color: `${prefix}_card_border_color`,
      winning_score: `${prefix}_winning_score`,
      powerups_enabled: `${prefix}_powerups_enabled`,
      countdown_delay: `${prefix}_countdown_delay`
    };

    // Construction dynamique de la requête UPDATE
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      const stmt = this.db.prepare(`
        UPDATE game_customization
        SET ${fields.join(', ')}
        WHERE user_id = ?
      `);

      stmt.run(...values, userId);
    }

    return this.getCustomization(userId, gameType)!;
  }

  /**
   * Réinitialise la config d'un jeu pour un utilisateur (met à NULL les champs du jeu)
   * Ne supprime PAS la ligne, juste les valeurs du jeu concerné
   * @returns true si une config a été supprimée, false si aucune config n'existait
   */
  deleteCustomization(userId: number, gameType: 'pong' | 'tron'): boolean {
    // Vérifier si une config existe pour ce jeu
    const config = this.getCustomization(userId, gameType);

    // Si aucune config (null) ou si tous les champs sont déjà NULL, rien à supprimer
    if (!config) return false;

    // Vérifier si au moins un champ non-NULL existe
    const hasNonNullFields = Object.entries(config).some(([key, value]) => {
      // Ignorer countdown_delay et powerups_enabled car ils ont toujours une valeur par défaut
      if (key === 'countdown_delay' || key === 'powerups_enabled') return false;
      return value !== null;
    });

    if (!hasNonNullFields) return false;

    // Il y a des valeurs à supprimer, procéder à l'UPDATE
    if (gameType === 'pong') {
      const stmt = this.db.prepare(`
        UPDATE game_customization
        SET
          pong_paddle_color_left = NULL,
          pong_paddle_color_right = NULL,
          pong_ball_color = NULL,
          pong_field_color = NULL,
          pong_text_color = NULL,
          pong_border_color = NULL,
          pong_card_border_color = NULL,
          pong_winning_score = NULL,
          pong_powerups_enabled = 0,
          pong_countdown_delay = 3,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      stmt.run(userId);
      return true;
    } else {
      const stmt = this.db.prepare(`
        UPDATE game_customization
        SET
          tron_vehicle_color_left = NULL,
          tron_vehicle_color_right = NULL,
          tron_trail_color_left = NULL,
          tron_trail_color_right = NULL,
          tron_field_color = NULL,
          tron_text_color = NULL,
          tron_border_color = NULL,
          tron_card_border_color = NULL,
          tron_winning_score = NULL,
          tron_powerups_enabled = 0,
          tron_countdown_delay = 3,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      stmt.run(userId);
      return true;
    }
  }
}

// Export d'une instance unique du repository
export const gameCustomizationRepo = new GameCustomizationRepository();
