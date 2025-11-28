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

export function testSignup(getApp: () => FastifyInstance) {
  describe('POST /api/auth/signup - Signup', () => {
    it('devrait créer un nouveau compte avec succès et retourner un JWT', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'signupuser',
          email: 'signup@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(201);
      const data: SignupResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.token).toBeDefined();
      expect(typeof data.data!.token).toBe('string');
      expect(data.data!.user.username).toBe('signupuser');
      expect(data.data!.user.email).toBe('signup@example.com');
      expect(data.data!.user).not.toHaveProperty('password_hash');
    });

    it('devrait rejeter si le username existe déjà', async () => {
      const app = getApp();
      await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'duplicatesignup',
          email: 'user1@example.com',
          password: 'password123'
        }
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'duplicatesignup',
          email: 'user2@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(409);
      const data: SignupResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Username already exists');
    });

    it('devrait rejeter si l\'email existe déjà', async () => {
      const app = getApp();
      await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'user3signup',
          email: 'duplicatesignup@example.com',
          password: 'password123'
        }
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'user4signup',
          email: 'duplicatesignup@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(409);
      const data: SignupResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email already exists');
    });
  });
}
