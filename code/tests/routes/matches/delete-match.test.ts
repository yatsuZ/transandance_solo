import { FastifyInstance } from 'fastify';
import { getAuthToken } from '../../helpers/auth.js';

interface MatchResponse {
  success: boolean;
  data?: {
    id: number;
    player_left_id: number | null;
    player_right_id: number | null;
    player_left_name: string;
    player_right_name: string;
    status: string;
    score_left: number;
    score_right: number;
    game_type: string | null;
  };
  error?: string;
}

export function testDeleteMatch(getApp: () => FastifyInstance) {
  describe('DELETE /api/matches/:id - Delete Match', () => {
    it('devrait supprimer un match', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'DeleteTest1',
          player_right_name: 'DeleteTest2'
        }
      });

      const created: MatchResponse = JSON.parse(createResponse.body);
      const matchId = created.data!.id;

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/matches/${matchId}`,
        cookies: {
          auth_token: token
        }
      });

      expect(response.statusCode).toBe(200);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);

      // Vérifier que le match n'existe plus
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/matches/${matchId}`
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('devrait retourner 404 si le match n\'existe pas', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/matches/99999',
        cookies: {
          auth_token: token
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });
}
