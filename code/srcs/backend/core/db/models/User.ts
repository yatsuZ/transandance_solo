import Database from 'better-sqlite3';
import { db } from '../config.js';

export interface User {
  id: number;
  username: string;
  email: string | null;
  password_hash: string | null;
  avatar_url: string;
  wins: number;
  losses: number;
  total_goals_scored: number;
  total_goals_conceded: number;
  total_matches: number;
  tournaments_played: number;
  tournaments_won: number;
  friend_count: number;
  controls: string;
  is_online: number;
  last_seen: string;
  twofa_secret: string | null;
  twofa_enabled: number;
  google_id: string | null;
  music_volume: number;
  music_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  password_hash?: string;
  avatar_url?: string;
  google_id?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password_hash?: string;
  avatar_url?: string;
  music_volume?: number;
  music_enabled?: number;
}

export interface UserStats {
  goals_scored: number;
  goals_conceded: number;
  won: boolean;
}

export class UserRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  createUser(data: CreateUserData): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, avatar_url, google_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.username,
      data.email || null,
      data.password_hash || null,
      data.avatar_url || '/static/util/icon/profile.png',
      data.google_id || null
    );

    return this.getUserById(result.lastInsertRowid as number)!;
  }

  getUserById(id: number): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id) as User | undefined;
    return result || null;
  }

  getUserByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const result = stmt.get(username) as User | undefined;
    return result || null;
  }

  getUserByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const result = stmt.get(email) as User | undefined;
    return result || null;
  }

  getAllUsers(limit?: number): User[] {
    let query = 'SELECT * FROM users ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = this.db.prepare(query);
    return stmt.all() as User[];
  }

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
    if (data.music_volume !== undefined) {
      updates.push('music_volume = ?');
      values.push(data.music_volume);
    }
    if (data.music_enabled !== undefined) {
      updates.push('music_enabled = ?');
      values.push(data.music_enabled);
    }

    if (updates.length === 0) {
      return this.getUserById(id);
    }

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

  deleteUser(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

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

  incrementTournamentsPlayed(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET tournaments_played = tournaments_played + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }

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

  updateControls(id: number, controls: string): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET controls = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(controls, id);
  }

  getLeaderboard(limit: number = 10): User[] {
    const stmt = this.db.prepare(`
      SELECT *,
        (
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

        ) as arcade_score
      FROM users
      WHERE total_matches > 0
      ORDER BY arcade_score DESC, total_matches DESC, total_goals_scored DESC
      LIMIT ?
    `);
    return stmt.all(limit) as User[];
  }

  getUserRank(userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM users
      WHERE total_matches > 0 AND (
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

  isInTopN(userId: number, n: number = 3): boolean {
    const rank = this.getUserRank(userId);
    return rank > 0 && rank <= n;
  }

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

  updateLastSeen(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET last_seen = datetime('now', 'localtime')
      WHERE id = ?
    `);
    stmt.run(userId);
  }

  set2FASecret(userId: number, secret: string): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET twofa_secret = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(secret, userId);
  }

  enable2FA(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET twofa_enabled = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(userId);
  }

  disable2FA(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET twofa_enabled = 0,
          twofa_secret = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(userId);
  }

  is2FAEnabled(userId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT twofa_enabled FROM users WHERE id = ?
    `);
    const result = stmt.get(userId) as { twofa_enabled: number } | undefined;
    return result?.twofa_enabled === 1;
  }

  get2FASecret(userId: number): string | null {
    const stmt = this.db.prepare(`
      SELECT twofa_secret FROM users WHERE id = ?
    `);
    const result = stmt.get(userId) as { twofa_secret: string | null } | undefined;
    return result?.twofa_secret || null;
  }

  getUserByGoogleId(googleId: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE google_id = ?');
    const result = stmt.get(googleId) as User | undefined;
    return result || null;
  }

  createUserFromGoogle(googleId: string, email: string, username: string, avatarUrl?: string): User {
    return this.createUser({
      username,
      email,
      google_id: googleId,
      avatar_url: avatarUrl || '/static/util/icon/profile.png',
    });
  }

  linkGoogleAccount(userId: number, googleId: string): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET google_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(googleId, userId);
  }
}

export const userRepo = new UserRepository();
