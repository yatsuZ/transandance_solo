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

export function testUpdateScore(getApp: () => FastifyInstance) {
  describe('PUT /api/matches/:id/score - Update Score', () => {
    it('devrait mettre à jour le score d\'un match', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'ScoreTest1',
          player_right_name: 'ScoreTest2'
        }
      });

      const created: MatchResponse = JSON.parse(createResponse.body);
      const matchId = created.data!.id;

      const response = await app.inject({
        method: 'PUT',
        url: `/api/matches/${matchId}/score`,
        cookies: {
          auth_token: token
        },
        payload: {
          score_left: 3,
          score_right: 2
        }
      });

      expect(response.statusCode).toBe(200);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.score_left).toBe(3);
      expect(data.data!.score_right).toBe(2);
    });

    it('devrait rejeter si le match est déjà terminé', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'FinishedTest1',
          player_right_name: 'FinishedTest2'
        }
      });

      const created: MatchResponse = JSON.parse(createResponse.body);
      const matchId = created.data!.id;

      // Terminer le match
      await app.inject({
        method: 'POST',
        url: `/api/matches/${matchId}/end`,
        cookies: {
          auth_token: token
        },
        payload: {
          winner_name: 'FinishedTest1',
          status: 'completed'
        }
      });

      // Essayer de mettre à jour le score
      const response = await app.inject({
        method: 'PUT',
        url: `/api/matches/${matchId}/score`,
        cookies: {
          auth_token: token
        },
        payload: {
          score_left: 5,
          score_right: 3
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });
}
