import { FastifyInstance } from 'fastify';

interface MatchesListResponse {
  success: boolean;
  data: Array<{
    id: number;
    player_left_id: number | null;
    player_right_id: number | null;
    player_left_name: string;
    player_right_name: string;
    status: string;
    score_left: number;
    score_right: number;
    game_type: string | null;
  }>;
  count: number;
}

export function testGetMatchesByStatus(getApp: () => FastifyInstance) {
  describe('GET /api/matches/status/:status - Get Matches By Status', () => {
    it('devrait récupérer les matches en cours', async () => {
      const app = getApp();
      // Créer un match en cours
      await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'InProgress1',
          player_right_name: 'InProgress2'
        }
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/matches/status/in_progress'
      });

      expect(response.statusCode).toBe(200);
      const data: MatchesListResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.every((m) => m.status === 'in_progress')).toBe(true);
    });

    it('devrait récupérer les matches complétés', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/matches/status/completed'
      });

      expect(response.statusCode).toBe(200);
      const data: MatchesListResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
}
