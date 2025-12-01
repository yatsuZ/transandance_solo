import { FastifyInstance } from 'fastify';

interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: number;
      username: string;
      email: string | null;
    };
  };
  error?: string;
  message?: string;
}

export function testLogin(getApp: () => FastifyInstance) {
  describe('POST /api/auth/login - Login', () => {
    it('devrait se connecter avec succès et retourner un cookie', async () => {
      const app = getApp();

      // Créer un compte d'abord
      await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123'
        }
      });

      // Se connecter
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          username: 'loginuser',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(200);
      const data: LoginResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.user.username).toBe('loginuser');
      expect(data.data!.user.email).toBe('login@example.com');

      // Vérifier que le cookie auth_token est présent
      const cookies = response.cookies;
      const authCookie = cookies.find(c => c.name === 'auth_token');
      expect(authCookie).toBeDefined();
      expect(authCookie!.value).toBeDefined();
      expect(authCookie!.httpOnly).toBe(true);
    });

    it('devrait rejeter avec un mauvais mot de passe', async () => {
      const app = getApp();

      // Créer un compte
      await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'wrongpassuser',
          email: 'wrongpass@example.com',
          password: 'correctpassword'
        }
      });

      // Tenter de se connecter avec un mauvais mot de passe
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          username: 'wrongpassuser',
          password: 'wrongpassword'
        }
      });

      expect(response.statusCode).toBe(401);
      const data: LoginResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid credentials');
    });

    it('devrait rejeter si l\'utilisateur n\'existe pas', async () => {
      const app = getApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          username: 'nonexistentuser',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(401);
      const data: LoginResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid credentials');
    });
  });
}
