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

export function testCreateMatch(getApp: () => FastifyInstance) {
  describe('POST /api/matches - Create Match', () => {
    it('devrait créer un nouveau match PvP', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'Player1',
          player_right_name: 'Player2',
          game_type: 'pong'
        }
      });

      expect(response.statusCode).toBe(201);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.player_left_name).toBe('Player1');
      expect(data.data!.player_right_name).toBe('Player2');
      expect(data.data!.status).toBe('in_progress');
      expect(data.data!.score_left).toBe(0);
      expect(data.data!.score_right).toBe(0);
    });

    it('devrait créer un match PvIA', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'POST',
        url: '/api/matches',
        payload: {
          player_left_name: 'Player1',
          player_right_name: 'AI_Easy'
        }
      });

      expect(response.statusCode).toBe(201);
      const data: MatchResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.player_right_name).toBe('AI_Easy');
    });
  });
}
