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
  friendship_date: string;
}

export class FriendshipRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  addFriend(userId: number, friendId: number): Friendship {
    const [smallerId, biggerId] = userId < friendId ? [userId, friendId] : [friendId, userId];

    const stmt = this.db.prepare(`
      INSERT INTO friendships (user_id, friend_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(smallerId, biggerId);

    this.incrementFriendCount(userId);
    this.incrementFriendCount(friendId);

    return this.getFriendship(result.lastInsertRowid as number)!;
  }

  removeFriend(userId: number, friendId: number): boolean {
    const [smallerId, biggerId] = userId < friendId ? [userId, friendId] : [friendId, userId];

    const stmt = this.db.prepare(`
      DELETE FROM friendships
      WHERE user_id = ? AND friend_id = ?
    `);

    const result = stmt.run(smallerId, biggerId);

    if (result.changes > 0) {
      this.decrementFriendCount(userId);
      this.decrementFriendCount(friendId);
      return true;
    }

    return false;
  }

  areFriends(userId: number, friendId: number): boolean {
    const [smallerId, biggerId] = userId < friendId ? [userId, friendId] : [friendId, userId];

    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM friendships
      WHERE user_id = ? AND friend_id = ?
    `);

    const result = stmt.get(smallerId, biggerId) as { count: number };
    return result.count > 0;
  }

  getFriendship(id: number): Friendship | null {
    const stmt = this.db.prepare('SELECT * FROM friendships WHERE id = ?');
    const result = stmt.get(id) as Friendship | undefined;
    return result || null;
  }

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

  getFriendCount(userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM friendships
      WHERE user_id = ? OR friend_id = ?
    `);

    const result = stmt.get(userId, userId) as { count: number };
    return result.count;
  }

  private incrementFriendCount(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET friend_count = friend_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(userId);
  }

  private decrementFriendCount(userId: number): void {
    const stmt = this.db.prepare(`
      UPDATE users
      SET friend_count = friend_count - 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(userId);
  }

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

  getAllFriendships(): Friendship[] {
    const stmt = this.db.prepare('SELECT * FROM friendships ORDER BY created_at DESC');
    return stmt.all() as Friendship[];
  }
}

export const friendshipRepo = new FriendshipRepository();
