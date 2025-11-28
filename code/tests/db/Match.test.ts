import { DatabaseManager } from '../../srcs/backend/core/db/config';
import { MatchRepository } from '../../srcs/backend/core/db/models/Match';
import { UserRepository } from '../../srcs/backend/core/db/models/User';

describe('MatchRepository', () => {
  let db: DatabaseManager;
  let matchRepo: MatchRepository;
  let userRepo: UserRepository;

  beforeEach(() => {
    db = new DatabaseManager(':memory:');
    matchRepo = new MatchRepository(db.getConnection());
    userRepo = new UserRepository(db.getConnection());
  });

  afterEach(() => {
    db.close();
  });

  describe('createMatch', () => {
    it('devrait créer un match PvP', () => {
      const player1 = userRepo.createUser({ username: 'player1', password_hash: 'hash' });
      const player2 = userRepo.createUser({ username: 'player2', password_hash: 'hash' });

      const match = matchRepo.createMatch({
        player_left_id: player1.id,
        player_left_name: player1.username,
        player_right_id: player2.id,
        player_right_name: player2.username,
      });

      expect(match.id).toBe(1);
      expect(match.player_left_id).toBe(player1.id);
      expect(match.player_right_id).toBe(player2.id);
      expect(match.status).toBe('in_progress');
      expect(match.score_left).toBe(0);
      expect(match.score_right).toBe(0);
    });

    it('devrait créer un match PvIA (IA à droite)', () => {
      const player = userRepo.createUser({ username: 'player1', password_hash: 'hash' });

      const match = matchRepo.createMatch({
        player_left_id: player.id,
        player_left_name: player.username,
        player_right_id: null, // IA
        player_right_name: 'AI_Easy',
      });

      expect(match.player_left_id).toBe(player.id);
      expect(match.player_right_id).toBeNull();
      expect(match.player_right_name).toBe('AI_Easy');
    });
  });

  describe('getMatchById', () => {
    it('devrait récupérer un match existant', () => {
      const created = matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'Guest1',
        player_right_id: null,
        player_right_name: 'Guest2',
      });

      const match = matchRepo.getMatchById(created.id);

      expect(match).not.toBeNull();
      expect(match!.player_left_name).toBe('Guest1');
    });

    it('devrait retourner null si le match n\'existe pas', () => {
      const match = matchRepo.getMatchById(999);
      expect(match).toBeNull();
    });
  });

  describe('updateMatchScore', () => {
    it('devrait mettre à jour les scores', () => {
      const match = matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'Player1',
        player_right_id: null,
        player_right_name: 'Player2',
      });

      const updated = matchRepo.updateMatchScore(match.id, {
        score_left: 2,
        score_right: 1,
      });

      expect(updated!.score_left).toBe(2);
      expect(updated!.score_right).toBe(1);
    });
  });

  describe('endMatch', () => {
    it('devrait terminer un match avec un vainqueur', () => {
      const player1 = userRepo.createUser({ username: 'player1', password_hash: 'hash' });
      const match = matchRepo.createMatch({
        player_left_id: player1.id,
        player_left_name: player1.username,
        player_right_id: null,
        player_right_name: 'AI',
      });

      matchRepo.updateMatchScore(match.id, { score_left: 3, score_right: 1 });
      const ended = matchRepo.endMatch(match.id, player1.id, player1.username, 'completed');

      expect(ended!.status).toBe('completed');
      expect(ended!.winner_id).toBe(player1.id);
      expect(ended!.winner_name).toBe(player1.username);
      expect(ended!.end_at).not.toBeNull();
    });

    it('devrait terminer un match sans vainqueur (leave)', () => {
      const match = matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'Player1',
        player_right_id: null,
        player_right_name: 'Player2',
      });

      const ended = matchRepo.markMatchAsLeave(match.id);

      expect(ended!.status).toBe('leave');
      expect(ended!.winner_id).toBeNull();
      expect(ended!.winner_name).toBeNull();
    });
  });

  describe('getMatchesByUser', () => {
    it('devrait récupérer les matches d\'un utilisateur', () => {
      const player = userRepo.createUser({ username: 'player1', password_hash: 'hash' });

      matchRepo.createMatch({
        player_left_id: player.id,
        player_left_name: player.username,
        player_right_id: null,
        player_right_name: 'AI',
      });

      matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'AI',
        player_right_id: player.id,
        player_right_name: player.username,
      });

      matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'Guest1',
        player_right_id: null,
        player_right_name: 'Guest2',
      });

      const matches = matchRepo.getMatchesByUser(player.id);

      expect(matches.length).toBe(2); // Seulement les 2 premiers
    });
  });

  describe('getInProgressMatches', () => {
    it('devrait retourner seulement les matches en cours', () => {
      const match1 = matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'P1',
        player_right_id: null,
        player_right_name: 'P2',
      });

      matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'P3',
        player_right_id: null,
        player_right_name: 'P4',
      });

      matchRepo.endMatch(match1.id, null, 'P1', 'completed');

      const inProgress = matchRepo.getInProgressMatches();

      expect(inProgress.length).toBe(1);
      expect(inProgress[0].status).toBe('in_progress');
    });
  });

  describe('getMatchStatsForPlayer', () => {
    it('devrait calculer les stats pour le joueur gauche', () => {
      const player = userRepo.createUser({ username: 'player1', password_hash: 'hash' });

      const match = matchRepo.createMatch({
        player_left_id: player.id,
        player_left_name: player.username,
        player_right_id: null,
        player_right_name: 'AI',
      });

      matchRepo.updateMatchScore(match.id, { score_left: 3, score_right: 1 });
      matchRepo.endMatch(match.id, player.id, player.username, 'completed');

      const stats = matchRepo.getMatchStatsForPlayer(match.id, player.id);

      expect(stats).not.toBeNull();
      expect(stats!.goals_scored).toBe(3);
      expect(stats!.goals_conceded).toBe(1);
      expect(stats!.won).toBe(true);
    });

    it('devrait calculer les stats pour le joueur droite', () => {
      const player = userRepo.createUser({ username: 'player1', password_hash: 'hash' });

      const match = matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'AI',
        player_right_id: player.id,
        player_right_name: player.username,
      });

      matchRepo.updateMatchScore(match.id, { score_left: 1, score_right: 2 });
      matchRepo.endMatch(match.id, player.id, player.username, 'completed');

      const stats = matchRepo.getMatchStatsForPlayer(match.id, player.id);

      expect(stats!.goals_scored).toBe(2);
      expect(stats!.goals_conceded).toBe(1);
      expect(stats!.won).toBe(true);
    });
  });
});
