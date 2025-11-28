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

export function testDeleteTournament(getApp: () => FastifyInstance) {
  describe('DELETE /api/tournaments/:id - Delete Tournament', () => {
    it('devrait supprimer un tournoi', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'delete_manager',
          email: 'delete@example.com',
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
        method: 'DELETE',
        url: `/api/tournaments/${tournamentId}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);

      // Vérifier que le tournoi n'existe plus
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/tournaments/${tournamentId}`
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('devrait retourner 404 si le tournoi n\'existe pas', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/tournaments/99999',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });
}
