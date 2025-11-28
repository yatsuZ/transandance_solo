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
   * Récupère le classement des joueurs (leaderboard)
   */
  getLeaderboard(limit: number = 10): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users
      ORDER BY wins DESC, total_goals_scored DESC
      LIMIT ?
    `);
    return stmt.all(limit) as User[];
  }
}

// Export de l'instance unique
export const userRepo = new UserRepository();
