import { FastifyInstance } from 'fastify';

interface SignupResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string | null;
    };
  };
  error?: string;
}

interface TournamentResponse {
  success: boolean;
  data?: {
    id: number;
    manager_id: number;
    winner_participant_id: number | null;
    nbr_of_matches: number;
    matches_remaining: number;
    status: string;
    created_at: string;
    end_at: string | null;
  };
  error?: string;
}

interface ParticipantResponse {
  success: boolean;
  data?: {
    id: number;
    tournament_id: number;
    user_id: number | null;
    display_name: string;
    placement: number | null;
    is_bot: boolean;
    is_eliminated: boolean;
  };
  error?: string;
}

export function testAddParticipant(getApp: () => FastifyInstance) {
  describe('POST /api/tournaments/:id/participants - Add Participant', () => {
    it('devrait ajouter un participant utilisateur', async () => {
      const app = getApp();
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'part_manager',
          email: 'part@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: { manager_id: managerId }
      });

      const created: TournamentResponse = JSON.parse(createResponse.body);
      const tournamentId = created.data!.id;

      const response = await app.inject({
        method: 'POST',
        url: `/api/tournaments/${tournamentId}/participants`,
        payload: {
          user_id: managerId,
          display_name: 'Player1'
        }
      });

      expect(response.statusCode).toBe(201);
      const data: ParticipantResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.tournament_id).toBe(tournamentId);
      expect(data.data!.user_id).toBe(managerId);
      expect(data.data!.display_name).toBe('Player1');
      expect(data.data!.is_bot).toBe(false);
      expect(data.data!.is_eliminated).toBe(false);
    });

    it('devrait ajouter un participant bot', async () => {
      const app = getApp();
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'bot_manager',
          email: 'bot@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: { manager_id: managerId }
      });

      const created: TournamentResponse = JSON.parse(createResponse.body);
      const tournamentId = created.data!.id;

      const response = await app.inject({
        method: 'POST',
        url: `/api/tournaments/${tournamentId}/participants`,
        payload: {
          user_id: null,
          display_name: 'AI_Bot',
          is_bot: true
        }
      });

      expect(response.statusCode).toBe(201);
      const data: ParticipantResponse = JSON.parse(response.body);
      expect(data.data!.user_id).toBeNull();
      expect(data.data!.is_bot).toBe(true);
    });

    it('devrait retourner 404 si le tournoi n\'existe pas', async () => {
      const app = getApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/tournaments/99999/participants',
        payload: {
          user_id: null,
          display_name: 'Player'
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/tournaments/:id/participants - Get Participants', () => {
    it('devrait récupérer tous les participants d\'un tournoi', async () => {
      const app = getApp();

      // Créer un manager
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'list_part_manager',
          email: 'listpart@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      // Créer un tournoi
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: { manager_id: managerId }
      });
      expect(createResponse.statusCode).toBe(201);

      const created: TournamentResponse = JSON.parse(createResponse.body);
      const tournamentId = created.data!.id;

      // Ajouter plusieurs participants
      const add1 = await app.inject({
        method: 'POST',
        url: `/api/tournaments/${tournamentId}/participants`,
        payload: { user_id: null, display_name: 'Player1' }
      });
      expect(add1.statusCode).toBe(201);

      const add2 = await app.inject({
        method: 'POST',
        url: `/api/tournaments/${tournamentId}/participants`,
        payload: { user_id: null, display_name: 'Player2' }
      });
      expect(add2.statusCode).toBe(201);

      // Récupérer les participants
      const response = await app.inject({
        method: 'GET',
        url: `/api/tournaments/${tournamentId}/participants`
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(2);
    });
  });
}
