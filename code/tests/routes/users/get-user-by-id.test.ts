import { FastifyInstance } from 'fastify';

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

interface UserResponse {
  success: boolean;
  data?: {
    id: number;
    username: string;
    email: string | null;
  };
  error?: string;
}

export function testGetUserById(getApp: () => FastifyInstance) {
  describe('GET /api/users/:id - Get User By ID', () => {
    it('devrait récupérer un utilisateur par ID', async () => {
      const app = getApp();
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'getbyid',
          email: 'getbyid@example.com',
          password: 'password123'
        }
      });

      const created: SignupResponse = JSON.parse(createResponse.body);
      const userId = created.data!.user.id;

      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);
      const data: UserResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.id).toBe(userId);
      expect(data.data!.username).toBe('getbyid');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/99999'
      });

      expect(response.statusCode).toBe(404);
      const data: UserResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });
  });
}
