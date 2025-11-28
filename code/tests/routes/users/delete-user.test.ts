import { FastifyInstance } from 'fastify';
import { getAuthToken } from '../../helpers/auth.js';

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

export function testDeleteUser(getApp: () => FastifyInstance) {
  describe('DELETE /api/users/:id - Delete User', () => {
    it('devrait supprimer un utilisateur', async () => {
      const app = getApp();
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'deleteme',
          email: 'deleteme@example.com',
          password: 'password123'
        }
      });

      const created: SignupResponse = JSON.parse(createResponse.body);
      const userId = created.data!.user.id;
      const token = created.data!.token;

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${userId}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const data: UserResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);

      // Vérifier que l'utilisateur n'existe plus
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const app = getApp();
      const token = await getAuthToken(app);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/99999',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });
}
