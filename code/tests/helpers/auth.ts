import { FastifyInstance } from 'fastify';

/**
 * Helper pour obtenir un cookie d'authentification valide pour les tests
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

  // Récupérer le cookie auth_token au lieu du token dans le JSON
  const authCookie = signupResponse.cookies.find(c => c.name === 'auth_token');
  if (!authCookie) {
    throw new Error('Cookie auth_token non trouvé après signup');
  }

  return authCookie.value;
}
