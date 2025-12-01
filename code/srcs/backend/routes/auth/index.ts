import { FastifyInstance } from 'fastify';
import { signup, signupSchema } from './handlers/signup.js';
import { login, loginSchema } from './handlers/login.js';
import { logout, logoutSchema } from './handlers/logout.js';
import { me, meSchema } from './handlers/me.js';
import { updateControls, updateControlsSchema } from './handlers/update-controls.js';
import { authMiddleware } from '../../core/auth/auth.middleware.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/signup - Créer un compte
  fastify.post('/signup', { schema: signupSchema }, signup);

  // POST /api/auth/login - Se connecter
  fastify.post('/login', { schema: loginSchema }, login);

  // POST /api/auth/logout - Se déconnecter (supprime le cookie)
  fastify.post('/logout', { schema: logoutSchema }, logout);

  // GET /api/auth/me - Récupérer les infos de l'utilisateur connecté (nécessite auth)
  fastify.get('/me', { schema: meSchema, preHandler: [authMiddleware] }, me);

  // PUT /api/auth/controls - Mettre à jour les contrôles clavier (nécessite auth)
  fastify.put('/controls', { schema: updateControlsSchema, preHandler: [authMiddleware] }, updateControls as any);
}
