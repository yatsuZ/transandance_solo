import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { friendshipRepo } from '../../../core/db/models/Friendship.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';

interface CheckFriendshipParams {
  userId: string;
}

interface CheckFriendshipData {
  areFriends: boolean;
}

type CheckFriendshipResponse = SuccessResponse<CheckFriendshipData> | ErrorResponse;

export const checkFriendshipSchema = {
  description: 'Vérifier si deux utilisateurs sont amis',
  tags: ['friendships'],
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string', description: 'ID de l\'utilisateur à vérifier' }
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
            areFriends: { type: 'boolean' }
          }
        }
      }
    }
  }
} as const;

/**
 * Handler: GET /api/friendships/check/:userId
 * Vérifie si l'utilisateur connecté est ami avec l'utilisateur spécifié
 *
 * @requires Authentication
 * @param userId - ID de l'utilisateur à vérifier
 * @returns 200 - Statut de l'amitié
 */
export async function checkFriendship(
  request: FastifyRequest<{ Params: CheckFriendshipParams }>,
  reply: FastifyReply
): Promise<CheckFriendshipResponse> {
  const currentUserId = request.user!.userId;
  const otherUserId = parseInt(request.params.userId, 10);

  if (isNaN(otherUserId)) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: 'Invalid user ID'
    });
  }

  const areFriends = friendshipRepo.areFriends(currentUserId, otherUserId);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      areFriends
    }
  });
}
