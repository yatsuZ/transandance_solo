import Database from 'better-sqlite3';
import { db } from '../config.js';

export interface Tournament {
  id: number;
  manager_id: number;
  winner_participant_id: number | null;
  nbr_of_matches: number;
  matches_remaining: number;
  status: 'in_progress' | 'completed' | 'leave';
  created_at: string;
  end_at: string | null;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  user_id: number | null;
  display_name: string;
  placement: number | null;
  is_bot: boolean;
  is_eliminated: boolean;
}

export interface TournamentMatch {
  id: number;
  tournament_id: number;
  match_id: number;
  match_index: number;
  round: string;
}

export interface CreateTournamentData {
  manager_id: number;
  nbr_of_matches?: number;
}

export interface CreateParticipantData {
  tournament_id: number;
  user_id: number | null;
  display_name: string;
  is_bot?: boolean;
}

export interface AddMatchData {
  tournament_id: number;
  match_id: number;
  match_index: number;
  round: string;
}

/**
 * Convertit les booleans SQLite (0/1) en vrais booleans JavaScript
 */
function convertSQLiteBooleans(obj: any): any {
  if (!obj) return obj;
  const converted = { ...obj };
  if ('is_bot' in converted) {
    converted.is_bot = Boolean(converted.is_bot);
  }
  if ('is_eliminated' in converted) {
    converted.is_eliminated = Boolean(converted.is_eliminated);
  }
  return converted;
}

/**
 * Repository pour gérer les opérations CRUD sur les tournois
 */
export class TournamentRepository {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || db.getConnection();
  }

  // ========================================
  // CRUD Tournaments
  // ========================================

  /**
   * Crée un nouveau tournoi
   */
  createTournament(data: CreateTournamentData): Tournament {
    const nbrMatches = data.nbr_of_matches || 3;

    const stmt = this.db.prepare(`
      INSERT INTO tournaments (manager_id, nbr_of_matches, matches_remaining)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(data.manager_id, nbrMatches, nbrMatches);
    return this.getTournamentById(result.lastInsertRowid as number)!;
  }

  /**
   * Récupère un tournoi par son ID
   */
  getTournamentById(id: number): Tournament | null {
    const stmt = this.db.prepare('SELECT * FROM tournaments WHERE id = ?');
    return stmt.get(id) as Tournament | null;
  }

  /**
   * Récupère tous les tournois
   */
  getAllTournaments(limit?: number): Tournament[] {
    const query = limit
      ? 'SELECT * FROM tournaments ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM tournaments ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    return (limit ? stmt.all(limit) : stmt.all()) as Tournament[];
  }

  /**
   * Récupère les tournois d'un manager
   */
  getTournamentsByManager(managerId: number): Tournament[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tournaments
      WHERE manager_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(managerId) as Tournament[];
  }

  /**
   * Récupère les tournois en cours
   */
  getInProgressTournaments(): Tournament[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tournaments
      WHERE status = 'in_progress'
      ORDER BY created_at DESC
    `);
    return stmt.all() as Tournament[];
  }

  /**
   * Décrémente le nombre de matches restants
   */
  decrementMatchesRemaining(id: number): Tournament | null {
    const stmt = this.db.prepare(`
      UPDATE tournaments
      SET matches_remaining = matches_remaining - 1
      WHERE id = ?
    `);

    stmt.run(id);
    return this.getTournamentById(id);
  }

  /**
   * Termine un tournoi avec un vainqueur
   */
  endTournament(id: number, winnerParticipantId: number | null, status: 'completed' | 'leave' = 'completed'): Tournament | null {
    const stmt = this.db.prepare(`
      UPDATE tournaments
      SET
        winner_participant_id = ?,
        status = ?,
        end_at = CURRENT_TIMESTAMP,
        matches_remaining = 0
      WHERE id = ?
    `);

    stmt.run(winnerParticipantId, status, id);
    return this.getTournamentById(id);
  }

  /**
   * Marque un tournoi comme abandonné
   */
  markTournamentAsLeave(id: number): Tournament | null {
    return this.endTournament(id, null, 'leave');
  }

  /**
   * Supprime un tournoi (CASCADE: participants et matches aussi)
   */
  deleteTournament(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM tournaments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // ========================================
  // CRUD Tournament Participants
  // ========================================

  /**
   * Ajoute un participant à un tournoi
   */
  addParticipant(data: CreateParticipantData): TournamentParticipant {
    const stmt = this.db.prepare(`
      INSERT INTO tournament_participants (tournament_id, user_id, display_name, is_bot)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.tournament_id,
      data.user_id,
      data.display_name,
      data.is_bot ? 1 : 0
    );

    return this.getParticipantById(result.lastInsertRowid as number)!;
  }

  /**
   * Récupère un participant par son ID
   */
  getParticipantById(id: number): TournamentParticipant | null {
    const stmt = this.db.prepare('SELECT * FROM tournament_participants WHERE id = ?');
    const result = stmt.get(id) as TournamentParticipant | undefined;
    return convertSQLiteBooleans(result) || null;
  }

  /**
   * Récupère tous les participants d'un tournoi
   */
  getParticipants(tournamentId: number): TournamentParticipant[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tournament_participants
      WHERE tournament_id = ?
      ORDER BY id ASC
    `);
    const results = stmt.all(tournamentId) as TournamentParticipant[];
    return results.map(convertSQLiteBooleans);
  }

  /**
   * Récupère les participants encore en lice
   */
  getActiveParticipants(tournamentId: number): TournamentParticipant[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tournament_participants
      WHERE tournament_id = ? AND is_eliminated = 0
      ORDER BY id ASC
    `);
    const results = stmt.all(tournamentId) as TournamentParticipant[];
    return results.map(convertSQLiteBooleans);
  }

  /**
   * Élimine un participant
   */
  eliminateParticipant(id: number): TournamentParticipant | null {
    const stmt = this.db.prepare(`
      UPDATE tournament_participants
      SET is_eliminated = 1
      WHERE id = ?
    `);

    stmt.run(id);
    return this.getParticipantById(id);
  }

  /**
   * Définit le placement final d'un participant
   */
  setPlacement(id: number, placement: number): TournamentParticipant | null {
    const stmt = this.db.prepare(`
      UPDATE tournament_participants
      SET placement = ?
      WHERE id = ?
    `);

    stmt.run(placement, id);
    return this.getParticipantById(id);
  }

  // ========================================
  // CRUD Tournament Matches
  // ========================================

  /**
   * Ajoute un match à un tournoi
   */
  addMatchToTournament(data: AddMatchData): TournamentMatch {
    const stmt = this.db.prepare(`
      INSERT INTO tournament_matches (tournament_id, match_id, match_index, round)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.tournament_id,
      data.match_id,
      data.match_index,
      data.round
    );

    return this.getTournamentMatchById(result.lastInsertRowid as number)!;
  }

  /**
   * Récupère un tournament_match par son ID
   */
  getTournamentMatchById(id: number): TournamentMatch | null {
    const stmt = this.db.prepare('SELECT * FROM tournament_matches WHERE id = ?');
    return stmt.get(id) as TournamentMatch | null;
  }

  /**
   * Récupère tous les matches d'un tournoi
   */
  getMatches(tournamentId: number): TournamentMatch[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tournament_matches
      WHERE tournament_id = ?
      ORDER BY match_index DESC
    `);
    return stmt.all(tournamentId) as TournamentMatch[];
  }

  /**
   * Récupère le prochain match à jouer (match_index le plus élevé)
   */
  getNextMatch(tournamentId: number): TournamentMatch | null {
    const stmt = this.db.prepare(`
      SELECT * FROM tournament_matches
      WHERE tournament_id = ?
      ORDER BY match_index DESC
      LIMIT 1
    `);
    return stmt.get(tournamentId) as TournamentMatch | null;
  }
}

// Export de l'instance unique
export const tournamentRepo = new TournamentRepository();
