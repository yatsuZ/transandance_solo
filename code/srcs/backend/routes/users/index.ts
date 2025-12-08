import { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { createUser, createUserSchema } from './handlers/create-user.js';
import { getAllUsers, getAllUsersSchema } from './handlers/get-all-users.js';
import { getUserById, getUserByIdSchema } from './handlers/get-user-by-id.js';
import { getUserByUsername, getUserByUsernameSchema } from './handlers/get-user-by-username.js';
import { getUserProfile, getUserProfileSchema } from './handlers/get-user-profile.js';
import { updateUser } from './handlers/update-user.js';
import { deleteUser, deleteUserSchema } from './handlers/delete-user.js';
import { getUserMatches, getUserMatchesSchema } from './handlers/get-user-matches.js';
import { getLeaderboard, getLeaderboardSchema } from './handlers/get-leaderboard.js';
import { authMiddleware } from '../../core/auth/auth.middleware.js';
import { preferencesRoutes } from './preferences.routes.js';

/**
 * Routes users - fichier principal de routage
 * Associe les routes HTTP aux handlers avec validation par schémas
 */
export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/', { schema: createUserSchema }, createUser);
  fastify.get('/', { schema: getAllUsersSchema }, getAllUsers);
  fastify.get('/:id', { schema: getUserByIdSchema }, getUserById);
  fastify.get('/username/:username', { schema: getUserByUsernameSchema }, getUserByUsername);
  fastify.get('/profile/:username', { schema: getUserProfileSchema }, getUserProfile);

  // Route protégée - multipart/form-data pour upload avatar, pas de validation schema
  fastify.put('/:id', { preHandler: [authMiddleware] }, updateUser as RouteHandlerMethod);

  // Route protégée - nécessite authentification
  fastify.delete('/:id', { schema: deleteUserSchema, preHandler: [authMiddleware] }, deleteUser as RouteHandlerMethod);

  fastify.get('/:id/matches', { schema: getUserMatchesSchema }, getUserMatches);
  fastify.get('/leaderboard/top', { schema: getLeaderboardSchema }, getLeaderboard);

  // Routes des préférences utilisateur (musique, etc.) - protégées par authMiddleware dans preferences.routes.ts
  fastify.register(preferencesRoutes, { prefix: '/preferences' });
}
