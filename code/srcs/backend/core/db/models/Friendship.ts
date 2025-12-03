import Database from 'better-sqlite3';
import { db } from '../config.js';
import { User } from './User.js';

export interface Friendship {
  id: number;
  user_id: number;
  friend_id: number;
  created_at: string;
}

export interface FriendWithDetails extends User {
  friendship_date: string; // Date à laquelle l'amitié a été créée
}

/**
 * Repository pour gérer les opérations sur la table friendships
 */
export class FriendshipRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  /**
   * Ajoute une amitié entre deux utilisateurs
   * Note: On normalise toujours user_id < friend_id
   */
  addFriend(userId: number, friendId: number): Friendship {
    // Normaliser les IDs pour éviter les doublons
    const [smallerId, biggerId] = userId < friendId ? [userId, friendId] : [friendId, userId];

    const stmt = this.db.prepare(`
      INSERT INTO friendships (user_id, friend_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(smallerId, biggerId);

    // Incrémenter le compteur d'amis pour les deux utilisateurs
    this.incrementFriendCount(userId);
    this.incrementFriendCount(friendId);

    return this.getFriendship(result.lastInsertRowid as number)!;
  }

  /**
   * Retire une amitié entre deux utilisateurs
   */
  removeFriend(userId: number, friendId: number): boolean {
    // Normaliser les IDs
    const [smallerId, biggerId] = userId < friendId ? [userId, friendId] : [friendId, userId];

    const stmt = this.db.prepare(`
      DELETE FROM friendships
      WHERE user_id = ? AND friend_id = ?
    `);

    const result = stmt.run(smallerId, biggerId);

    if (result.changes > 0) {
      // Décrémenter le compteur d'amis pour les deux utilisateurs
      this.decrementFriendCount(userId);
      this.decrementFriendCount(friendId);
      return true;
    }

    return false;
  }

  /**
   * Vérifie si deux utilisateurs sont amis
   */
  areFriends(userId: number, friendId: number): boolean {
    // Normaliser les IDs
    const [smallerId, biggerId] = userId < friendId ? [userId, friendId] : [friendId, userId];

    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM friendships
      WHERE user_id = ? AND friend_id = ?
    `);

    const result = stmt.get(smallerId, biggerId) as { count: number };
    return result.count > 0;
  }

  /**
   * Récupère une amitié par son ID
   */
  getFriendship(id: number): Friendship | null {
    const stmt = this.db.prepare('SELECT * FROM friendships WHERE id = ?');
    const result = stmt.get(id) as Friendship | undefined;
    return result || null;
  }

  /**
   * Récupère la liste des amis d'un utilisateur avec leurs détails
   */
  getFriendsWithDetails(userId: number): FriendWithDetails[] {
    const stmt = this.db.prepare(`
      SELECT
        u.*,
        f.created_at as friendship_date
      FROM users u
      INNER JOIN friendships f ON (
        (f.user_id = ? AND f.friend_id = u.id) OR
        (f.friend_id = ? AND f.user_id = u.id)
      )
      WHERE u.id != ?
      ORDER BY f.created_at DESC
    `);

    return stmt.all(userId, userId, userId) as FriendWithDetails[];
  }

  /**
   * Récupère uniquement les IDs des amis d'un utilisateur
   */
  getFriendIds(userId: number): number[] {
    const stmt = this.db.prepare(`
      SELECT
        CASE
          WHEN user_id = ? THEN friend_id
          ELSE user_id
        END as friend_id
      FROM friendships
      WHERE user_id = ? OR friend_id = ?
    `);

    const results = stmt.all(userId, userId, userId) as { friend_id: number }[];
    return results.map((r) => r.friend_id);
  }

  /**
   * Compte le nombre d'amis d'un utilisateur
   */
  getFriendCount(userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM friendships
      WHERE user_id = ? OR friend_id = ?
    `);

    const result = stmt.get(userId, userId) as { count: number };
    return result.count;
  }

  /**
   * Incrémente le compteur d'amis d'un utilisateur
   */
  private incrementFriendCount(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET friend_count = friend_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(userId);
  }

  /**
   * Décrémente le compteur d'amis d'un utilisateur
   */
  private decrementFriendCount(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET friend_count = friend_count - 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(userId);
  }

  /**
   * Synchronise le compteur d'amis pour tous les utilisateurs
   * Utile après une migration ou des incohérences
   */
  syncAllFriendCounts(): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET friend_count = (
        SELECT COUNT(*)
        FROM friendships
        WHERE friendships.user_id = users.id OR friendships.friend_id = users.id
      )
    `);
    stmt.run();
  }

  /**
   * Récupère toutes les amitiés (pour debug/admin)
   */
  getAllFriendships(): Friendship[] {
    const stmt = this.db.prepare('SELECT * FROM friendships ORDER BY created_at DESC');
    return stmt.all() as Friendship[];
  }
}

// Export de l'instance unique
export const friendshipRepo = new FriendshipRepository();
