import { FastifyInstance } from 'fastify';
import fastifyOAuth2 from '@fastify/oauth2';
import { signup, signupSchema } from './handlers/signup.js';
import { login, loginSchema } from './handlers/login.js';
import { logout, logoutSchema } from './handlers/logout.js';
import { me, meSchema } from './handlers/me.js';
import { updateControls, updateControlsSchema } from './handlers/update-controls.js';
import { googleCallback } from './handlers/google-oauth.js';
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

  // Enregistrer Google OAuth dans un sous-plugin pour s'assurer que le décorateur est disponible
  await fastify.register(async function googleOAuthPlugin(instance) {
    // Enregistrer le plugin OAuth2 dans ce scope
    await instance.register(fastifyOAuth2, {
      name: 'googleOAuth2',
      scope: ['profile', 'email'],
      credentials: {
        client: {
          id: process.env.GOOGLE_CLIENT_ID || '',
          secret: process.env.GOOGLE_CLIENT_SECRET || ''
        },
        auth: fastifyOAuth2.GOOGLE_CONFIGURATION
      },
      startRedirectPath: '/google',  // Relatif au prefix /api/auth
      callbackUri: process.env.GOOGLE_REDIRECT_URI || 'https://localhost:8443/api/auth/google/callback'
    });

    // NOTE: GET /api/auth/google est automatiquement créée par @fastify/oauth2 (via startRedirectPath)
    // On déclare seulement le callback ici
    instance.get('/google/callback', googleCallback);
  });
}
