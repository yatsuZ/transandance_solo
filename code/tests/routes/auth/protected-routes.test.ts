import { FastifyInstance } from 'fastify';

interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
  };
  error?: string;
  message?: string;
}

export function testProtectedRoutes(getApp: () => FastifyInstance) {
  describe('Protected Routes - JWT Middleware', () => {
    it('devrait rejeter une requête sans token', async () => {
      const app = getApp();

      // Créer un user pour avoir un ID valide
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'protectedtest1',
          email: 'protected1@example.com',
          password: 'password123'
        }
      });

      const signupData: AuthResponse = JSON.parse(signupResponse.body);
      const userId = signupData.data!.user.id;

      // Essayer de modifier sans token
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${userId}`,
        payload: {
          username: 'updated'
        }
      });

      expect(response.statusCode).toBe(401);
      const data: AuthResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('devrait rejeter une requête avec un cookie invalide', async () => {
      const app = getApp();

      // Créer un user pour avoir un ID valide
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'protectedtest2',
          email: 'protected2@example.com',
          password: 'password123'
        }
      });

      const signupData: AuthResponse = JSON.parse(signupResponse.body);
      const userId = signupData.data!.user.id;

      // Essayer avec un cookie invalide
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${userId}`,
        cookies: {
          auth_token: 'invalid-token-here'
        },
        payload: {
          username: 'updated'
        }
      });

      expect(response.statusCode).toBe(401);
      const data: AuthResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid or expired');
    });

    it('devrait accepter une requête avec un cookie valide', async () => {
      const app = getApp();

      // Créer un compte et récupérer le cookie
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'protectedtest3',
          email: 'protected3@example.com',
          password: 'password123'
        }
      });

      const signupData: AuthResponse = JSON.parse(signupResponse.body);
      const userId = signupData.data!.user.id;

      // Récupérer le cookie auth_token
      const authCookie = signupResponse.cookies.find(c => c.name === 'auth_token');
      expect(authCookie).toBeDefined();

      // Modifier avec le cookie (utiliser FormData car la route attend multipart)
      const FormData = require('form-data');
      const form = new FormData();
      form.append('username', 'protectedupdated');

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
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.username).toBe('protectedupdated');
    });
  });
}
