import { FastifyInstance } from 'fastify';

/**
 * Crée un utilisateur de test et retourne son cookie d'authentification
 * Utile pour tester les routes protégées
 */
export async function createAuthenticatedUser(
  app: FastifyInstance,
  username: string,
  email: string,
  password: string
): Promise<{ userId: number; authCookie: string }> {
  const signupResponse = await app.inject({
    method: 'POST',
    url: '/api/auth/signup',
    payload: {
      username,
      email,
      password
    }
  });

  const signupData = JSON.parse(signupResponse.body);
  const userId = signupData.data!.user.id;

  // Récupérer le cookie auth_token
  const authCookie = signupResponse.cookies.find(c => c.name === 'auth_token');
  if (!authCookie) {
    throw new Error('Cookie auth_token non trouvé après signup');
  }

  return {
    userId,
    authCookie: authCookie.value
  };
}

/**
 * Retourne les cookies à utiliser dans app.inject pour les routes protégées
 */
export function getAuthCookies(authToken: string): { auth_token: string } {
  return { auth_token: authToken };
}
