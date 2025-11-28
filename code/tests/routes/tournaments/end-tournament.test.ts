import { FastifyInstance } from 'fastify';
import { getAuthToken } from '../../helpers/auth.js';

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

export function testEndTournament(getApp: () => FastifyInstance) {
  describe('POST /api/tournaments/:id/end - End Tournament', () => {
    it('devrait terminer un tournoi avec un vainqueur', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'end_manager',
          email: 'end@example.com',
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

      const partResponse = await app.inject({
        method: 'POST',
        url: `/api/tournaments/${tournamentId}/participants`,
        payload: {
          user_id: null,
          display_name: 'Winner'
        }
      });

      const participant: ParticipantResponse = JSON.parse(partResponse.body);
      const winnerId = participant.data!.id;

      const response = await app.inject({
        method: 'POST',
        url: `/api/tournaments/${tournamentId}/end`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          winner_participant_id: winnerId,
          status: 'completed'
        }
      });

      expect(response.statusCode).toBe(200);
      const data: TournamentResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.status).toBe('completed');
      expect(data.data!.winner_participant_id).toBe(winnerId);
      expect(data.data!.matches_remaining).toBe(0);
      expect(data.data!.end_at).not.toBeNull();
    });

    it('devrait marquer un tournoi comme abandonné', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'leave_manager',
          email: 'leave@example.com',
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
        url: `/api/tournaments/${tournamentId}/end`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          status: 'leave'
        }
      });

      expect(response.statusCode).toBe(200);
      const data: TournamentResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.status).toBe('leave');
      expect(data.data!.winner_participant_id).toBeNull();
    });
  });
}
