import { FastifyInstance } from 'fastify';
import { getAllUsers, getAllUsersSchema } from './handlers/get-all-users.js';
import { getUserById, getUserByIdSchema } from './handlers/get-user-by-id.js';
import { getUserByUsername, getUserByUsernameSchema } from './handlers/get-user-by-username.js';
import { updateUser, updateUserSchema } from './handlers/update-user.js';
import { deleteUser, deleteUserSchema } from './handlers/delete-user.js';
import { getUserMatches, getUserMatchesSchema } from './handlers/get-user-matches.js';
import { getLeaderboard, getLeaderboardSchema } from './handlers/get-leaderboard.js';

/**
 * Routes users - fichier principal
 * Associe les routes HTTP aux handlers avec validation par schémas
 */
export default async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users - Récupérer tous les utilisateurs
  fastify.get('/', { schema: getAllUsersSchema }, getAllUsers);

  // GET /api/users/:id - Récupérer un utilisateur par ID
  fastify.get('/:id', { schema: getUserByIdSchema }, getUserById);

  // GET /api/users/username/:username - Récupérer un utilisateur par username
  fastify.get('/username/:username', { schema: getUserByUsernameSchema }, getUserByUsername);

  // PUT /api/users/:id - Mettre à jour un utilisateur
  fastify.put('/:id', { schema: updateUserSchema }, updateUser);

  // DELETE /api/users/:id - Supprimer un utilisateur
  fastify.delete('/:id', { schema: deleteUserSchema }, deleteUser);

  // GET /api/users/:id/matches - Récupérer les matchs d'un utilisateur
  fastify.get('/:id/matches', { schema: getUserMatchesSchema }, getUserMatches);

  // GET /api/users/leaderboard/top - Récupérer le classement
  fastify.get('/leaderboard/top', { schema: getLeaderboardSchema }, getLeaderboard);
}
