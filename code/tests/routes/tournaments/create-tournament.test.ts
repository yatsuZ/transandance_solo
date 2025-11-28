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

export function testCreateTournament(getApp: () => FastifyInstance) {
  describe('POST /api/tournaments - Create Tournament', () => {
    it('devrait créer un tournoi avec les valeurs par défaut', async () => {
      const app = getApp();
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'tournament_manager',
          email: 'manager@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      const response = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: {
          manager_id: managerId
        }
      });

      expect(response.statusCode).toBe(201);
      const data: TournamentResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.manager_id).toBe(managerId);
      expect(data.data!.nbr_of_matches).toBe(3);
      expect(data.data!.matches_remaining).toBe(3);
      expect(data.data!.status).toBe('in_progress');
    });

    it('devrait créer un tournoi avec un nombre de matches personnalisé', async () => {
      const app = getApp();
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'manager2',
          email: 'manager2@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      const response = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: {
          manager_id: managerId,
          nbr_of_matches: 7
        }
      });

      expect(response.statusCode).toBe(201);
      const data: TournamentResponse = JSON.parse(response.body);
      expect(data.data!.nbr_of_matches).toBe(7);
      expect(data.data!.matches_remaining).toBe(7);
    });

    it('devrait retourner 404 si le manager n\'existe pas', async () => {
      const app = getApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: {
          manager_id: 99999
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });
}
