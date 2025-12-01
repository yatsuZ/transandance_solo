import { FastifyInstance } from 'fastify';
import { getAuthToken } from '../../helpers/auth.js';

interface SignupResponse {
  success: boolean;
  data?: {
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

export function testUpdateUser(getApp: () => FastifyInstance) {
  describe('PUT /api/users/:id - Update User', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const app = getApp();
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'updateme',
          email: 'updateme@example.com',
          password: 'password123'
        }
      });

      const created: SignupResponse = JSON.parse(createResponse.body);
      const userId = created.data!.user.id;

      // Récupérer le cookie
      const authCookie = createResponse.cookies.find(c => c.name === 'auth_token');

      // Utiliser FormData car la route attend multipart/form-data
      const FormData = require('form-data');
      const form = new FormData();
      form.append('username', 'updated');

      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${userId}`,
        cookies: {
          auth_token: authCookie!.value
        },
        headers: form.getHeaders(),
        payload: form
      });

      expect(response.statusCode).toBe(200);
      const data: UserResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.username).toBe('updated');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const app = getApp();
      const authCookie = await getAuthToken(app);

      // Utiliser FormData car la route attend multipart/form-data
      const FormData = require('form-data');
      const form = new FormData();
      form.append('username', 'test');

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/99999',
        cookies: {
          auth_token: authCookie
        },
        headers: form.getHeaders(),
        payload: form
      });

      expect(response.statusCode).toBe(404);
    });
  });
}
