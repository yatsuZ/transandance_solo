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

export function testGetAllMatches(getApp: () => FastifyInstance) {
  describe('GET /api/matches - Get All Matches', () => {
    it('devrait récupérer tous les matches', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/matches'
      });

      expect(response.statusCode).toBe(200);
      const data: MatchesListResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThanOrEqual(0);
    });
  });
}
