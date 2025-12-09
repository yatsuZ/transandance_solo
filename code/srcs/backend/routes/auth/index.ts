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
  fastify.post('/signup', { schema: signupSchema }, signup);

  fastify.post('/login', { schema: loginSchema }, login);

  fastify.post('/logout', { schema: logoutSchema }, logout);

  fastify.get('/me', { schema: meSchema, preHandler: [authMiddleware] }, me);

  fastify.put('/controls', { schema: updateControlsSchema, preHandler: [authMiddleware] }, updateControls as any);

  await fastify.register(async function googleOAuthPlugin(instance) {
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
      startRedirectPath: '/google',
      callbackUri: process.env.GOOGLE_REDIRECT_URI || 'https://localhost:8443/api/auth/google/callback'
    });

    instance.get('/google/callback', googleCallback);
  });
}
