import Database from 'better-sqlite3';
import { db } from '../config.js';

export interface User {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  avatar_url: string;
  wins: number;
  losses: number;
  total_goals_scored: number;
  total_goals_conceded: number;
  total_matches: number;
  tournaments_played: number;
  tournaments_won: number;
  friend_count: number;
  controls: string; // JSON string: {"leftUp":"w","leftDown":"s","rightUp":"ArrowUp","rightDown":"ArrowDown"}
  is_online: number; // 1 = online, 0 = offline
  last_seen: string; // ISO timestamp of last activity
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  password_hash: string;
  avatar_url?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password_hash?: string;
  avatar_url?: string;
}

export interface UserStats {
  goals_scored: number;
  goals_conceded: number;
  won: boolean;
}

/**
 * Repository pour gérer les opérations CRUD sur la table users
 */
export class UserRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(data: CreateUserData): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, avatar_url)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.username,
      data.email || null,
      data.password_hash,
      data.avatar_url || '/static/util/icon/profile.png'
    );

    return this.getUserById(result.lastInsertRowid as number)!;
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id) as User | undefined;
    return result || null;
  }

  /**
   * Récupère un utilisateur par son username
   */
  getUserByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const result = stmt.get(username) as User | undefined;
    return result || null;
  }

  /**
   * Récupère un utilisateur par son email
   */
  getUserByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const result = stmt.get(email) as User | undefined;
    return result || null;
  }

  /**
   * Récupère tous les utilisateurs
   * @param limit - Nombre maximum d'utilisateurs à retourner (optionnel)
   */
  getAllUsers(limit?: number): User[] {
    let query = 'SELECT * FROM users ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = this.db.prepare(query);
    return stmt.all() as User[];
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(id: number, data: UpdateUserData): User | null {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.username !== undefined) {
      updates.push('username = ?');
      values.push(data.username);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.password_hash !== undefined) {
      updates.push('password_hash = ?');
      values.push(data.password_hash);
    }
    if (data.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(data.avatar_url);
    }

    if (updates.length === 0) {
      return this.getUserById(id);
    }

    // Ajouter updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getUserById(id);
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Incrémente le nombre de victoires
   */
  incrementWins(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET wins = wins + 1,
          total_matches = total_matches + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Incrémente le nombre de défaites
   */
  incrementLosses(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET losses = losses + 1,
          total_matches = total_matches + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Met à jour les statistiques d'un joueur après un match
   */
  updateStats(id: number, stats: UserStats): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET
        wins = wins + ?,
        losses = losses + ?,
        total_goals_scored = total_goals_scored + ?,
        total_goals_conceded = total_goals_conceded + ?,
        total_matches = total_matches + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      stats.won ? 1 : 0,
      stats.won ? 0 : 1,
      stats.goals_scored,
      stats.goals_conceded,
      id
    );
  }

  /**
   * Incrémente le nombre de tournois joués
   */
  incrementTournamentsPlayed(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET tournaments_played = tournaments_played + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Incrémente le nombre de tournois gagnés ET joués
   */
  incrementTournamentsWon(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET tournaments_won = tournaments_won + 1,
          tournaments_played = tournaments_played + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Met à jour les contrôles clavier d'un utilisateur
   */
  updateControls(id: number, controls: string): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET controls = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(controls, id);
  }

  /**
   * Récupère le classement des joueurs (leaderboard)
   * Algorithme de scoring arcade :
   * - Expérience (matchs joués) : poids important
   * - Ratio buts (goals_scored / goals_conceded) : qualité du joueur
   * - Taux de victoire (wins / total_matches) : performance
   * - Nombre d'amis : validation sociale
   */
  getLeaderboard(limit: number = 10): User[] {
    const stmt = this.db.prepare(`
      SELECT *,
        (
          -- Expérience (matchs joués) * 100 points
          (total_matches * 100) +

          -- Ratio buts * 50 points (éviter division par 0)
          (CASE
            WHEN total_goals_conceded > 0 THEN (total_goals_scored * 1.0 / total_goals_conceded) * 50
            ELSE total_goals_scored * 50
          END) +

          -- Taux de victoire * 200 points
          (CASE
            WHEN total_matches > 0 THEN (wins * 1.0 / total_matches) * 200
            ELSE 0
          END) +

          -- Nombre d'amis * 20 points (bonus social)
          (friend_count * 20)

        ) as arcade_score
      FROM users
      WHERE total_matches > 0
      ORDER BY arcade_score DESC, total_matches DESC, total_goals_scored DESC
      LIMIT ?
    `);
    return stmt.all(limit) as User[];
  }

  /**
   * Récupère le rang d'un utilisateur dans le classement
   * Retourne 0 si l'utilisateur n'a pas de matchs joués
   */
  getUserRank(userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM users
      WHERE total_matches > 0 AND (
        -- Calcul du même score arcade
        (total_matches * 100) +
        (CASE
          WHEN total_goals_conceded > 0 THEN (total_goals_scored * 1.0 / total_goals_conceded) * 50
          ELSE total_goals_scored * 50
        END) +
        (CASE
          WHEN total_matches > 0 THEN (wins * 1.0 / total_matches) * 200
          ELSE 0
        END) +
        (friend_count * 20)
      ) > (
        SELECT
          (total_matches * 100) +
          (CASE
            WHEN total_goals_conceded > 0 THEN (total_goals_scored * 1.0 / total_goals_conceded) * 50
            ELSE total_goals_scored * 50
          END) +
          (CASE
            WHEN total_matches > 0 THEN (wins * 1.0 / total_matches) * 200
            ELSE 0
          END) +
          (friend_count * 20)
        FROM users
        WHERE id = ?
      )
    `);

    const result = stmt.get(userId) as { rank: number } | undefined;
    return result?.rank || 0;
  }

  /**
   * Vérifie si un utilisateur est dans le Top N
   */
  isInTopN(userId: number, n: number = 3): boolean {
    const rank = this.getUserRank(userId);
    return rank > 0 && rank <= n;
  }

  /**
   * Met à jour le statut en ligne d'un utilisateur
   */
  setOnline(userId: number, isOnline: boolean): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET is_online = ?,
          last_seen = datetime('now', 'localtime'),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(isOnline ? 1 : 0, userId);
  }

  /**
   * Met à jour le timestamp de dernière activité
   */
  updateLastSeen(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET last_seen = datetime('now', 'localtime')
      WHERE id = ?
    `);
    stmt.run(userId);
  }
}

// Export de l'instance unique
export const userRepo = new UserRepository();
