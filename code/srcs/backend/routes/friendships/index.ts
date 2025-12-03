import { FastifyInstance } from 'fastify';
import { addFriend, addFriendSchema } from './handlers/add-friend.js';
import { removeFriend, removeFriendSchema } from './handlers/remove-friend.js';
import { getFriends, getFriendsSchema } from './handlers/get-friends.js';
import { checkFriendship, checkFriendshipSchema } from './handlers/check-friendship.js';
import { authMiddleware } from '../../core/auth/auth.middleware.js';

/**
 * Routes friendships - Système d'amitié
 * Toutes les routes nécessitent une authentification
 */
export default async function friendshipRoutes(fastify: FastifyInstance) {
  // POST /api/friendships/add - Ajouter un ami (seulement Top 3)
  fastify.post(
    '/add',
    { schema: addFriendSchema, preHandler: [authMiddleware] },
    addFriend as any
  );

  // DELETE /api/friendships/:friendId - Retirer un ami
  fastify.delete(
    '/:friendId',
    { schema: removeFriendSchema, preHandler: [authMiddleware] },
    removeFriend as any
  );

  // GET /api/friendships - Récupérer la liste de mes amis
  fastify.get(
    '/',
    { schema: getFriendsSchema, preHandler: [authMiddleware] },
    getFriends as any
  );

  // GET /api/friendships/check/:userId - Vérifier si on est ami avec quelqu'un
  fastify.get(
    '/check/:userId',
    { schema: checkFriendshipSchema, preHandler: [authMiddleware] },
    checkFriendship as any
  );
}
