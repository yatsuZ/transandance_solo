import { FastifyInstance } from 'fastify';

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

export function testGetMatchById(getApp: () => FastifyInstance) {
  describe('GET /api/matches/:id - Get Match By ID', () => {
    it('devrait récupérer un match par ID', async () => {
      const app = getApp();
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'GetByIdTest1',
          player_right_name: 'GetByIdTest2'
        }
      });

      const created: MatchResponse = JSON.parse(createResponse.body);
      const matchId = created.data!.id;

      const response = await app.inject({
        method: 'GET',
        url: `/api/matches/${matchId}`
      });

      expect(response.statusCode).toBe(200);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.id).toBe(matchId);
    });

    it('devrait retourner 404 si le match n\'existe pas', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/matches/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });
}
