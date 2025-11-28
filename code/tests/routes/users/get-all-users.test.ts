import { FastifyInstance } from 'fastify';

interface UsersListResponse {
  success: boolean;
  data: Array<{
    id: number;
    username: string;
    email: string | null;
  }>;
  count: number;
}

export function testGetAllUsers(getApp: () => FastifyInstance) {
  describe('GET /api/users - Get All Users', () => {
    it('devrait récupérer tous les utilisateurs', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.statusCode).toBe(200);
      const data: UsersListResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThanOrEqual(0);
    });
  });
}
