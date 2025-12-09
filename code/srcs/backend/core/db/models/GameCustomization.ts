import Database from 'better-sqlite3';
import { db } from '../config.js';

export interface GameCustomization {
  id: number;
  user_id: number;
  game_type: 'pong' | 'tron';

  // Couleurs PONG (format hex #RRGGBB)
  paddle_color_left: string | null;
  paddle_color_right: string | null;
  ball_color: string | null;

  // Couleurs TRON (format hex #RRGGBB)
  vehicle_color_left: string | null;
  vehicle_color_right: string | null;
  trail_color_left: string | null;
  trail_color_right: string | null;

  // Couleurs COMMUNES (format hex #RRGGBB)
  field_color: string | null;
  text_color: string | null;

  // Gameplay
  winning_score: number | null;
  powerups_enabled: number; // 0 = désactivés, 1 = activés
  countdown_delay: number; // Délai après chaque point (secondes, 1-5)

  // Meta
  created_at: string;
  updated_at: string;
}

export interface CreateGameCustomizationData {
  user_id: number;
  game_type: 'pong' | 'tron';

  paddle_color_left?: string;
  paddle_color_right?: string;
  ball_color?: string;

  vehicle_color_left?: string;
  vehicle_color_right?: string;
  trail_color_left?: string;
  trail_color_right?: string;

  field_color?: string;
  text_color?: string;

  winning_score?: number;
  powerups_enabled?: number;
  countdown_delay?: number;
}

export interface UpdateGameCustomizationData {
  paddle_color_left?: string;
  paddle_color_right?: string;
  ball_color?: string;

  vehicle_color_left?: string;
  vehicle_color_right?: string;
  trail_color_left?: string;
  trail_color_right?: string;

  field_color?: string;
  text_color?: string;

  winning_score?: number;
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
   * Récupère la config d'un jeu pour un utilisateur
   * @returns GameCustomization ou null si pas de config
   */
  getCustomization(userId: number, gameType: 'pong' | 'tron'): GameCustomization | null {
    const stmt = this.db.prepare(
      'SELECT * FROM game_customization WHERE user_id = ? AND game_type = ?'
    );
    const result = stmt.get(userId, gameType) as GameCustomization | undefined;
    return result || null;
  }

  /**
   * Crée ou met à jour la config d'un jeu pour un utilisateur
   * Utilise INSERT OR REPLACE pour gérer les deux cas
   */
  upsertCustomization(data: CreateGameCustomizationData): GameCustomization {
    const existing = this.getCustomization(data.user_id, data.game_type);

    if (existing) {
      // Update existant
      return this.updateCustomization(existing.id, data);
    } else {
      // Création
      const stmt = this.db.prepare(`
        INSERT INTO game_customization (
          user_id, game_type,
          paddle_color_left, paddle_color_right, ball_color,
          vehicle_color_left, vehicle_color_right, trail_color_left, trail_color_right,
          field_color, text_color,
          winning_score, powerups_enabled, countdown_delay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.user_id,
        data.game_type,
        data.paddle_color_left || null,
        data.paddle_color_right || null,
        data.ball_color || null,
        data.vehicle_color_left || null,
        data.vehicle_color_right || null,
        data.trail_color_left || null,
        data.trail_color_right || null,
        data.field_color || null,
        data.text_color || null,
        data.winning_score || null,
        data.powerups_enabled !== undefined ? data.powerups_enabled : 0,
        data.countdown_delay !== undefined ? data.countdown_delay : 3
      );

      return this.getCustomizationById(result.lastInsertRowid as number)!;
    }
  }

  /**
   * Met à jour partiellement une config existante
   */
  updateCustomization(id: number, data: UpdateGameCustomizationData): GameCustomization {
    const fields: string[] = [];
    const values: any[] = [];

    // Construction dynamique de la requête UPDATE
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      const stmt = this.db.prepare(`
        UPDATE game_customization
        SET ${fields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values, id);
    }

    return this.getCustomizationById(id)!;
  }

  /**
   * Supprime la config d'un jeu pour un utilisateur
   */
  deleteCustomization(userId: number, gameType: 'pong' | 'tron'): boolean {
    const stmt = this.db.prepare(
      'DELETE FROM game_customization WHERE user_id = ? AND game_type = ?'
    );
    const result = stmt.run(userId, gameType);
    return result.changes > 0;
  }

  /**
   * Récupère une config par son ID
   * @private Utilisé en interne uniquement
   */
  private getCustomizationById(id: number): GameCustomization | null {
    const stmt = this.db.prepare('SELECT * FROM game_customization WHERE id = ?');
    const result = stmt.get(id) as GameCustomization | undefined;
    return result || null;
  }
}

// Export d'une instance unique du repository
export const gameCustomizationRepo = new GameCustomizationRepository();
