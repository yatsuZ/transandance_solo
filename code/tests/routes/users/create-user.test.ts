import { FastifyInstance } from 'fastify';

interface UserResponse {
  success: boolean;
  data?: {
    id: number;
    username: string;
    email: string | null;
  };
  error?: string;
}

export function testCreateUser(getApp: () => FastifyInstance) {
  describe('POST /api/users - Create User (Internal/Admin)', () => {
    it('devrait créer un utilisateur (usage interne)', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          username: 'internaluser',
          email: 'internal@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(201);
      const data: UserResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.username).toBe('internaluser');
      expect(data.data!.email).toBe('internal@example.com');
      expect(data.data).not.toHaveProperty('password_hash');
      // Note: Pas de token retourné (différent de /api/auth/signup)
      expect(data.data).not.toHaveProperty('token');
    });
  });
}
