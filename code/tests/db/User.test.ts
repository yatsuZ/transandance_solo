import { DatabaseManager } from '../../srcs/backend/core/db/config';
import { UserRepository } from '../../srcs/backend/core/db/models/User';

describe('UserRepository', () => {
  let db: DatabaseManager;
  let userRepo: UserRepository;

  beforeEach(() => {
    // Utiliser une BDD en mémoire pour les tests
    db = new DatabaseManager(':memory:');
    userRepo = new UserRepository(db.getConnection());
  });

  afterEach(() => {
    db.close();
  });

  describe('createUser', () => {
    it('devrait créer un utilisateur avec les données minimales', () => {
      const user = userRepo.createUser({
        username: 'testuser',
        password_hash: 'hashedpassword123',
      });

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.password_hash).toBe('hashedpassword123');
      expect(user.wins).toBe(0);
      expect(user.losses).toBe(0);
      expect(user.total_matches).toBe(0);
    });

    it('devrait créer un utilisateur avec email et avatar', () => {
      const user = userRepo.createUser({
        username: 'player1',
        email: 'player1@example.com',
        password_hash: 'hash123',
        avatar_url: '/custom/avatar.png',
      });

      expect(user.email).toBe('player1@example.com');
      expect(user.avatar_url).toBe('/custom/avatar.png');
    });

    it('devrait utiliser l\'avatar par défaut si non fourni', () => {
      const user = userRepo.createUser({
        username: 'player2',
        password_hash: 'hash456',
      });

      expect(user.avatar_url).toBe('/static/util/icon/profile.png');
    });
  });

  describe('getUserById', () => {
    it('devrait récupérer un utilisateur existant', () => {
      const created = userRepo.createUser({
        username: 'testuser',
        password_hash: 'hash',
      });

      const user = userRepo.getUserById(created.id);

      expect(user).not.toBeNull();
      expect(user!.username).toBe('testuser');
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', () => {
      const user = userRepo.getUserById(999);
      expect(user).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('devrait récupérer un utilisateur par son username', () => {
      userRepo.createUser({
        username: 'uniqueuser',
        password_hash: 'hash',
      });

      const user = userRepo.getUserByUsername('uniqueuser');

      expect(user).not.toBeNull();
      expect(user!.username).toBe('uniqueuser');
    });

    it('devrait retourner null si le username n\'existe pas', () => {
      const user = userRepo.getUserByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour le username', () => {
      const user = userRepo.createUser({
        username: 'oldname',
        password_hash: 'hash',
      });

      const updated = userRepo.updateUser(user.id, {
        username: 'newname',
      });

      expect(updated!.username).toBe('newname');
    });

    it('devrait mettre à jour l\'email', () => {
      const user = userRepo.createUser({
        username: 'user',
        password_hash: 'hash',
      });

      const updated = userRepo.updateUser(user.id, {
        email: 'newemail@example.com',
      });

      expect(updated!.email).toBe('newemail@example.com');
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur existant', () => {
      const user = userRepo.createUser({
        username: 'todelete',
        password_hash: 'hash',
      });

      const deleted = userRepo.deleteUser(user.id);
      expect(deleted).toBe(true);

      const found = userRepo.getUserById(user.id);
      expect(found).toBeNull();
    });

    it('devrait retourner false si l\'utilisateur n\'existe pas', () => {
      const deleted = userRepo.deleteUser(999);
      expect(deleted).toBe(false);
    });
  });

  describe('incrementWins', () => {
    it('devrait incrémenter les victoires et le total de matches', () => {
      const user = userRepo.createUser({
        username: 'winner',
        password_hash: 'hash',
      });

      userRepo.incrementWins(user.id);

      const updated = userRepo.getUserById(user.id);
      expect(updated!.wins).toBe(1);
      expect(updated!.total_matches).toBe(1);
    });
  });

  describe('incrementLosses', () => {
    it('devrait incrémenter les défaites et le total de matches', () => {
      const user = userRepo.createUser({
        username: 'loser',
        password_hash: 'hash',
      });

      userRepo.incrementLosses(user.id);

      const updated = userRepo.getUserById(user.id);
      expect(updated!.losses).toBe(1);
      expect(updated!.total_matches).toBe(1);
    });
  });

  describe('updateStats', () => {
    it('devrait mettre à jour les stats après un match gagné', () => {
      const user = userRepo.createUser({
        username: 'player',
        password_hash: 'hash',
      });

      userRepo.updateStats(user.id, {
        goals_scored: 3,
        goals_conceded: 1,
        won: true,
      });

      const updated = userRepo.getUserById(user.id);
      expect(updated!.wins).toBe(1);
      expect(updated!.losses).toBe(0);
      expect(updated!.total_goals_scored).toBe(3);
      expect(updated!.total_goals_conceded).toBe(1);
      expect(updated!.total_matches).toBe(1);
    });

    it('devrait mettre à jour les stats après un match perdu', () => {
      const user = userRepo.createUser({
        username: 'player',
        password_hash: 'hash',
      });

      userRepo.updateStats(user.id, {
        goals_scored: 2,
        goals_conceded: 3,
        won: false,
      });

      const updated = userRepo.getUserById(user.id);
      expect(updated!.wins).toBe(0);
      expect(updated!.losses).toBe(1);
      expect(updated!.total_goals_scored).toBe(2);
      expect(updated!.total_goals_conceded).toBe(3);
    });
  });

  describe('getLeaderboard', () => {
    it('devrait retourner les joueurs triés par victoires', () => {
      userRepo.createUser({ username: 'player1', password_hash: 'hash' });
      userRepo.createUser({ username: 'player2', password_hash: 'hash' });
      userRepo.createUser({ username: 'player3', password_hash: 'hash' });

      userRepo.updateStats(1, { goals_scored: 3, goals_conceded: 0, won: true });
      userRepo.updateStats(2, { goals_scored: 3, goals_conceded: 0, won: true });
      userRepo.updateStats(2, { goals_scored: 3, goals_conceded: 0, won: true });
      userRepo.updateStats(3, { goals_scored: 3, goals_conceded: 0, won: true });
      userRepo.updateStats(3, { goals_scored: 3, goals_conceded: 0, won: true });
      userRepo.updateStats(3, { goals_scored: 3, goals_conceded: 0, won: true });

      const leaderboard = userRepo.getLeaderboard();

      expect(leaderboard[0].username).toBe('player3'); // 3 wins
      expect(leaderboard[1].username).toBe('player2'); // 2 wins
      expect(leaderboard[2].username).toBe('player1'); // 1 win
    });
  });
});
