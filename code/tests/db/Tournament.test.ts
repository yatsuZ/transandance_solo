import { DatabaseManager } from '../../srcs/backend/core/db/config';
import { TournamentRepository } from '../../srcs/backend/core/db/models/Tournament';
import { UserRepository } from '../../srcs/backend/core/db/models/User';
import { MatchRepository } from '../../srcs/backend/core/db/models/Match';

describe('TournamentRepository', () => {
  let db: DatabaseManager;
  let tournamentRepo: TournamentRepository;
  let userRepo: UserRepository;
  let matchRepo: MatchRepository;

  beforeEach(() => {
    db = new DatabaseManager(':memory:');
    tournamentRepo = new TournamentRepository(db.getConnection());
    userRepo = new UserRepository(db.getConnection());
    matchRepo = new MatchRepository(db.getConnection());
  });

  afterEach(() => {
    db.close();
  });

  describe('createTournament', () => {
    it('devrait créer un tournoi avec les valeurs par défaut', () => {
      const manager = userRepo.createUser({ username: 'manager1', password_hash: 'hash' });

      const tournament = tournamentRepo.createTournament({
        manager_id: manager.id,
      });

      expect(tournament.id).toBe(1);
      expect(tournament.manager_id).toBe(manager.id);
      expect(tournament.nbr_of_matches).toBe(3);
      expect(tournament.matches_remaining).toBe(3);
      expect(tournament.status).toBe('in_progress');
    });

    it('devrait créer un tournoi avec un nombre de matches personnalisé', () => {
      const manager = userRepo.createUser({ username: 'manager1', password_hash: 'hash' });

      const tournament = tournamentRepo.createTournament({
        manager_id: manager.id,
        nbr_of_matches: 7, // Pour 8 joueurs
      });

      expect(tournament.nbr_of_matches).toBe(7);
      expect(tournament.matches_remaining).toBe(7);
    });
  });

  describe('addParticipant', () => {
    it('devrait ajouter un participant user', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const player = userRepo.createUser({ username: 'player1', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const participant = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: player.id,
        display_name: 'CustomName',
      });

      expect(participant.user_id).toBe(player.id);
      expect(participant.display_name).toBe('CustomName');
      expect(participant.is_bot).toBe(false);
      expect(participant.is_eliminated).toBe(false);
    });

    it('devrait ajouter un participant bot', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const participant = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'AI_Bot',
        is_bot: true,
      });

      expect(participant.user_id).toBeNull();
      expect(participant.is_bot).toBe(true);
    });

    it('devrait ajouter un participant guest', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const participant = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'Guest123',
        is_bot: false,
      });

      expect(participant.user_id).toBeNull();
      expect(participant.is_bot).toBe(false);
    });
  });

  describe('getParticipants', () => {
    it('devrait récupérer tous les participants d\'un tournoi', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'Player1',
      });

      tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'Player2',
      });

      const participants = tournamentRepo.getParticipants(tournament.id);

      expect(participants.length).toBe(2);
    });
  });

  describe('eliminateParticipant', () => {
    it('devrait marquer un participant comme éliminé', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const participant = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'Player1',
      });

      tournamentRepo.eliminateParticipant(participant.id);

      const updated = tournamentRepo.getParticipantById(participant.id);
      expect(updated!.is_eliminated).toBe(true);
    });
  });

  describe('setPlacement', () => {
    it('devrait définir le placement final d\'un participant', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const participant = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'Winner',
      });

      tournamentRepo.setPlacement(participant.id, 1); // 1er place

      const updated = tournamentRepo.getParticipantById(participant.id);
      expect(updated!.placement).toBe(1);
    });
  });

  describe('addMatchToTournament', () => {
    it('devrait lier un match à un tournoi', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const match = matchRepo.createMatch({
        player_left_id: null,
        player_left_name: 'P1',
        player_right_id: null,
        player_right_name: 'P2',
      });

      const tournamentMatch = tournamentRepo.addMatchToTournament({
        tournament_id: tournament.id,
        match_id: match.id,
        match_index: 3,
        round: 'semi-final-1',
      });

      expect(tournamentMatch.tournament_id).toBe(tournament.id);
      expect(tournamentMatch.match_id).toBe(match.id);
      expect(tournamentMatch.match_index).toBe(3);
      expect(tournamentMatch.round).toBe('semi-final-1');
    });
  });

  describe('decrementMatchesRemaining', () => {
    it('devrait décrémenter le nombre de matches restants', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      expect(tournament.matches_remaining).toBe(3);

      tournamentRepo.decrementMatchesRemaining(tournament.id);
      const updated = tournamentRepo.getTournamentById(tournament.id);

      expect(updated!.matches_remaining).toBe(2);
    });
  });

  describe('endTournament', () => {
    it('devrait terminer un tournoi avec un vainqueur', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const winner = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'Champion',
      });

      const ended = tournamentRepo.endTournament(tournament.id, winner.id, 'completed');

      expect(ended!.status).toBe('completed');
      expect(ended!.winner_participant_id).toBe(winner.id);
      expect(ended!.matches_remaining).toBe(0);
      expect(ended!.end_at).not.toBeNull();
    });

    it('devrait terminer un tournoi comme abandonné', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const ended = tournamentRepo.markTournamentAsLeave(tournament.id);

      expect(ended!.status).toBe('leave');
      expect(ended!.winner_participant_id).toBeNull();
    });
  });

  describe('getActiveParticipants', () => {
    it('devrait retourner seulement les participants actifs', () => {
      const manager = userRepo.createUser({ username: 'manager', password_hash: 'hash' });
      const tournament = tournamentRepo.createTournament({ manager_id: manager.id });

      const p1 = tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'P1',
      });

      tournamentRepo.addParticipant({
        tournament_id: tournament.id,
        user_id: null,
        display_name: 'P2',
      });

      tournamentRepo.eliminateParticipant(p1.id);

      const active = tournamentRepo.getActiveParticipants(tournament.id);

      expect(active.length).toBe(1);
      expect(active[0].display_name).toBe('P2');
    });
  });
});
