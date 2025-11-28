import { FastifyInstance } from 'fastify';

/**
 * Helper pour obtenir un token JWT valide pour les tests
 */
export async function getAuthToken(app: FastifyInstance): Promise<string> {
  const signupResponse = await app.inject({
    method: 'POST',
    url: '/api/auth/signup',
    payload: {
      username: `testuser_${Date.now()}_${Math.random()}`,
      email: `test_${Date.now()}_${Math.random()}@example.com`,
      password: 'password123'
    }
  });
  const data = JSON.parse(signupResponse.body);
  return data.data.token;
}
