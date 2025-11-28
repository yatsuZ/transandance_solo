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
    winner_name?: string | null;
  };
  error?: string;
}

export function testEndMatch(getApp: () => FastifyInstance) {
  describe('POST /api/matches/:id/end - End Match', () => {
    it('devrait terminer un match avec un vainqueur', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'Winner',
          player_right_name: 'Loser'
        }
      });

      const created: MatchResponse = JSON.parse(createResponse.body);
      const matchId = created.data!.id;

      const response = await app.inject({
        method: 'POST',
        url: `/api/matches/${matchId}/end`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          winner_name: 'Winner',
          status: 'completed'
        }
      });

      expect(response.statusCode).toBe(200);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.status).toBe('completed');
      expect(data.data!.winner_name).toBe('Winner');
    });

    it('devrait marquer un match comme abandonné', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'Leaver1',
          player_right_name: 'Leaver2'
        }
      });

      const created: MatchResponse = JSON.parse(createResponse.body);
      const matchId = created.data!.id;

      const response = await app.inject({
        method: 'POST',
        url: `/api/matches/${matchId}/end`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          status: 'leave'
        }
      });

      expect(response.statusCode).toBe(200);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.status).toBe('leave');
    });
  });
}
