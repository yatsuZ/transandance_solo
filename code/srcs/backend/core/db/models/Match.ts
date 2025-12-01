import Database from 'better-sqlite3';
import { db } from '../config.js';

export interface Match {
  id: number;
  player_left_id: number | null;
  player_left_name: string;
  is_bot_left: number;  // 0 ou 1 (SQLite boolean)
  score_left: number;
  player_right_id: number | null;
  player_right_name: string;
  is_bot_right: number; // 0 ou 1 (SQLite boolean)
  score_right: number;
  winner_id: number | null;
  winner_name: string | null;
  status: 'in_progress' | 'completed' | 'leave';
  game_type: string;
  start_at: string;
  end_at: string | null;
}

export interface CreateMatchData {
  player_left_id: number | null;
  player_left_name: string;
  is_bot_left?: number;  // 0 ou 1 (défaut 0)
  player_right_id: number | null;
  player_right_name: string;
  is_bot_right?: number; // 0 ou 1 (défaut 0)
  game_type?: string;
}

export interface UpdateMatchScoreData {
  score_left: number;
  score_right: number;
}

/**
 * Repository pour gérer les opérations CRUD sur la table matches
 */
export class MatchRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  /**
   * Crée un nouveau match (statut 'in_progress' par défaut)
   */
  createMatch(data: CreateMatchData): Match {
    const stmt = this.db.prepare(`
      INSERT INTO matches (
        player_left_id, player_left_name, is_bot_left,
        player_right_id, player_right_name, is_bot_right,
        game_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result: Database.RunResult  = stmt.run(
      data.player_left_id,
      data.player_left_name,
      data.is_bot_left ?? 0,
      data.player_right_id,
      data.player_right_name,
      data.is_bot_right ?? 0,
      data.game_type || 'pong'
    );

    return this.getMatchById(result.lastInsertRowid as number)!;
  }

  /**
   * Récupère un match par son ID
   */
  getMatchById(id: number): Match | null {
    const stmt = this.db.prepare('SELECT * FROM matches WHERE id = ?');
    const result = stmt.get(id) as Match | undefined;
    return result || null;
  }

  /**
   * Récupère tous les matches d'un utilisateur
   */
  getMatchesByUser(userId: number): Match[] {
    const stmt = this.db.prepare(`
      SELECT * FROM matches
      WHERE player_left_id = ? OR player_right_id = ?
      ORDER BY start_at DESC
    `);
    return stmt.all(userId, userId) as Match[];
  }

  /**
   * Récupère tous les matches
   */
  getAllMatches(limit?: number): Match[] {
    const query = limit
      ? 'SELECT * FROM matches ORDER BY start_at DESC LIMIT ?'
      : 'SELECT * FROM matches ORDER BY start_at DESC';

    const stmt = this.db.prepare(query);
    return (limit ? stmt.all(limit) : stmt.all()) as Match[];
  }

  /**
   * Récupère les matches en cours
   */
  getInProgressMatches(): Match[] {
    const stmt = this.db.prepare(`
      SELECT * FROM matches
      WHERE status = 'in_progress'
      ORDER BY start_at DESC
    `);
    return stmt.all() as Match[];
  }

  /**
   * Récupère les matches complétés
   */
  getCompletedMatches(limit?: number): Match[] {
    const query = limit
      ? `SELECT * FROM matches WHERE status = 'completed' ORDER BY end_at DESC LIMIT ?`
      : `SELECT * FROM matches WHERE status = 'completed' ORDER BY end_at DESC`;

    const stmt = this.db.prepare(query);
    return (limit ? stmt.all(limit) : stmt.all()) as Match[];
  }

  /**
   * Met à jour les scores pendant un match
   */
  updateMatchScore(id: number, data: UpdateMatchScoreData): Match | null {
    const stmt = this.db.prepare(`
      UPDATE matches
      SET score_left = ?, score_right = ?
      WHERE id = ?
    `);

    stmt.run(data.score_left, data.score_right, id);
    return this.getMatchById(id);
  }

  /**
   * Termine un match avec un vainqueur
   */
  endMatch(
    id: number,
    winnerId: number | null,
    winnerName: string | null,
    status: 'completed' | 'leave' = 'completed'
  ): Match | null {
    const stmt = this.db.prepare(`
      UPDATE matches
      SET
        winner_id = ?,
        winner_name = ?,
        status = ?,
        end_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(winnerId, winnerName, status, id);
    return this.getMatchById(id);
  }

  /**
   * Marque un match comme abandonné (leave)
   */
  markMatchAsLeave(id: number): Match | null {
    return this.endMatch(id, null, null, 'leave');
  }

  /**
   * Supprime un match
   */
  deleteMatch(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM matches WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Récupère les statistiques d'un match pour un joueur
   */
  getMatchStatsForPlayer(matchId: number, playerId: number): {
    goals_scored: number;
    goals_conceded: number;
    won: boolean;
  } | null {
    const match = this.getMatchById(matchId);
    if (!match) return null;

    const isLeftPlayer = match.player_left_id === playerId;
    const isRightPlayer = match.player_right_id === playerId;

    if (!isLeftPlayer && !isRightPlayer) return null;

    const goals_scored = isLeftPlayer ? match.score_left : match.score_right;
    const goals_conceded = isLeftPlayer ? match.score_right : match.score_left;
    const won = match.winner_id === playerId;

    return { goals_scored, goals_conceded, won };
  }
}

// Export de l'instance unique
export const matchRepo = new MatchRepository();
