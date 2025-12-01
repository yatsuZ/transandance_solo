import { FastifyInstance } from 'fastify';

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export function testLogout(getApp: () => FastifyInstance) {
  describe('POST /api/auth/logout - Logout', () => {
    it('devrait déconnecter l\'utilisateur et supprimer le cookie', async () => {
      const app = getApp();

      // Se connecter d'abord
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'password123'
        }
      });

      // Vérifier que le cookie existe après login
      const loginCookie = loginResponse.cookies.find(c => c.name === 'auth_token');
      expect(loginCookie).toBeDefined();

      // Se déconnecter
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        cookies: {
          auth_token: loginCookie!.value
        }
      });

      expect(logoutResponse.statusCode).toBe(200);
      const data: LogoutResponse = JSON.parse(logoutResponse.body);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logout successful');

      // Vérifier que le cookie a été supprimé (maxAge = 0 ou expires passé)
      const logoutCookie = logoutResponse.cookies.find(c => c.name === 'auth_token');
      expect(logoutCookie).toBeDefined();
      // Le cookie devrait avoir une expiration dans le passé ou maxAge = 0
      expect(logoutCookie!.value).toBe('');
    });

    it('devrait réussir même sans cookie (logout idempotent)', async () => {
      const app = getApp();

      // Logout sans être connecté
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout'
      });

      expect(response.statusCode).toBe(200);
      const data: LogoutResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });
}
