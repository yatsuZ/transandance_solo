import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { friendshipRepo } from '../../../core/db/models/Friendship.js';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';

interface AddFriendBody {
  friendId: number;
}

type AddFriendResponse = SuccessResponse<{ message: string }> | ErrorResponse;

export const addFriendSchema = {
  description: 'Ajouter un ami (seulement les Top 3 peuvent être ajoutés)',
  tags: ['friendships'],
  body: {
    type: 'object',
    required: ['friendId'],
    properties: {
      friendId: { type: 'number', description: 'ID de l\'utilisateur à ajouter en ami' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }
} as const;

/**
 * Handler: POST /api/friendships/add
 * Ajoute un ami (restriction: seuls les Top 3 peuvent être ajoutés)
 *
 * @requires Authentication
 * @body friendId - ID de l'utilisateur à ajouter
 * @returns 200 - Amitié créée avec succès
 * @returns 400 - Erreur de validation
 * @returns 403 - L'utilisateur n'est pas dans le Top 3
 * @returns 409 - Déjà amis
 */
export async function addFriend(
  request: FastifyRequest<{ Body: AddFriendBody }>,
  reply: FastifyReply
): Promise<AddFriendResponse> {
  const userId = request.user!.userId;
  const { friendId } = request.body;

  if (userId === friendId) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: 'Cannot add yourself as friend'
    });
  }

  const friend = userRepo.getUserById(friendId);
  if (!friend) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  const isTop3 = userRepo.isInTopN(friendId, 3);
  if (!isTop3) {
    return reply.code(StatusCodes.FORBIDDEN).send({
      success: false,
      error: 'Can only add Top 3 players as friends'
    });
  }

  const alreadyFriends = friendshipRepo.areFriends(userId, friendId);
  if (alreadyFriends) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: 'Already friends with this user'
    });
  }

  friendshipRepo.addFriend(userId, friendId);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      message: `You are now friends with ${friend.username}`
    }
  });
}
