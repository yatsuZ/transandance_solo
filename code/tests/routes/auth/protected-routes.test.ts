import { FastifyInstance } from 'fastify';

interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: any;
  };
  error?: string;
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

    it('devrait rejeter une requête avec un token invalide', async () => {
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

      // Essayer avec un token invalide
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${userId}`,
        headers: {
          authorization: 'Bearer invalid-token-here'
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

    it('devrait accepter une requête avec un token valide', async () => {
      const app = getApp();

      // Créer un compte et récupérer le token
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
      const token = signupData.data!.token;
      const userId = signupData.data!.user.id;

      // Modifier avec le token
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${userId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          username: 'protectedupdated'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.username).toBe('protectedupdated');
    });
  });
}
