import { FastifyInstance } from 'fastify';

import userRoutes from './users/index.js';
import matchRoutes from './matches/index.js';
import authRoutes from './auth/index.js';
import twofaRoutes from './auth/twofa.routes.js';
import tournamentRoutes from './tournaments/index.js';
import friendshipRoutes from './friendships/index.js';
import { customizationRoutes } from './customization/index.js';

export async function setupAllRoutesApi(fastify: FastifyInstance)
{
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(twofaRoutes, { prefix: '/api/auth/2fa' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(matchRoutes, { prefix: '/api/matches' });
  await fastify.register(tournamentRoutes, { prefix: '/api/tournaments' });
  await fastify.register(friendshipRoutes, { prefix: '/api/friendships' });
  await fastify.register(customizationRoutes, { prefix: '/api/customization' });
}