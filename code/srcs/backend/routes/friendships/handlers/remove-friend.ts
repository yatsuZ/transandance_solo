import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { friendshipRepo } from '../../../core/db/models/Friendship.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';

interface RemoveFriendParams {
  friendId: string;
}

type RemoveFriendResponse = SuccessResponse<{ message: string }> | ErrorResponse;

export const removeFriendSchema = {
  description: 'Retirer un ami',
  tags: ['friendships'],
  params: {
    type: 'object',
    required: ['friendId'],
    properties: {
      friendId: { type: 'string', description: 'ID de l\'ami à retirer' }
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
 * Handler: DELETE /api/friendships/:friendId
 * Retire un ami de la liste d'amis de l'utilisateur
 *
 * @requires Authentication
 * @param friendId - ID de l'ami à retirer
 * @returns 200 - Amitié supprimée avec succès
 * @returns 404 - Amitié introuvable
 */
export async function removeFriend(
  request: FastifyRequest<{ Params: RemoveFriendParams }>,
  reply: FastifyReply
): Promise<RemoveFriendResponse> {
  const userId = request.user!.userId;
  const friendId = parseInt(request.params.friendId, 10);

  if (isNaN(friendId)) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: 'Invalid friend ID'
    });
  }

  const removed = friendshipRepo.removeFriend(userId, friendId);

  if (!removed) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'Friendship not found'
    });
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      message: 'Friend removed successfully'
    }
  });
}
