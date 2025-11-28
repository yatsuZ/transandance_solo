import { FastifyInstance } from 'fastify';
import { createUser, createUserSchema } from './handlers/create-user.js';
import { getAllUsers, getAllUsersSchema } from './handlers/get-all-users.js';
import { getUserById, getUserByIdSchema } from './handlers/get-user-by-id.js';
import { getUserByUsername, getUserByUsernameSchema } from './handlers/get-user-by-username.js';
import { updateUser, updateUserSchema } from './handlers/update-user.js';
import { deleteUser, deleteUserSchema } from './handlers/delete-user.js';
import { getUserMatches, getUserMatchesSchema } from './handlers/get-user-matches.js';
import { getLeaderboard, getLeaderboardSchema } from './handlers/get-leaderboard.js';
import { authMiddleware } from '../../core/auth/auth.middleware.js';

/**
 * Routes users - fichier principal
 * Associe les routes HTTP aux handlers avec validation par schémas
 */
export default async function userRoutes(fastify: FastifyInstance) {
  // POST /api/users - Créer un nouvel utilisateur
  fastify.post('/', { schema: createUserSchema }, createUser);

  // GET /api/users - Récupérer tous les utilisateurs
  fastify.get('/', { schema: getAllUsersSchema }, getAllUsers);

  // GET /api/users/:id - Récupérer un utilisateur par ID
  fastify.get('/:id', { schema: getUserByIdSchema }, getUserById);

  // GET /api/users/username/:username - Récupérer un utilisateur par username
  fastify.get('/username/:username', { schema: getUserByUsernameSchema }, getUserByUsername);

  // PUT /api/users/:id - Mettre à jour un utilisateur (protégé)
  fastify.put('/:id', { schema: updateUserSchema, preHandler: [authMiddleware] }, updateUser as any);

  // DELETE /api/users/:id - Supprimer un utilisateur (protégé)
  fastify.delete('/:id', { schema: deleteUserSchema, preHandler: [authMiddleware] }, deleteUser as any);

  // GET /api/users/:id/matches - Récupérer les matchs d'un utilisateur
  fastify.get('/:id/matches', { schema: getUserMatchesSchema }, getUserMatches);

  // GET /api/users/leaderboard/top - Récupérer le classement
  fastify.get('/leaderboard/top', { schema: getLeaderboardSchema }, getLeaderboard);
}
