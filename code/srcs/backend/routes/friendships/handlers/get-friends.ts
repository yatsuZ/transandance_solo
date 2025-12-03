import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { friendshipRepo, FriendWithDetails } from '../../../core/db/models/Friendship.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';

type SafeFriend = Omit<FriendWithDetails, 'password_hash' | 'email' | 'controls'>;

type GetFriendsResponse = SuccessResponse<SafeFriend[]> | ErrorResponse;

export const getFriendsSchema = {
  description: 'Récupérer la liste des amis de l\'utilisateur connecté',
  tags: ['friendships'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
              avatar_url: { type: 'string' },
              wins: { type: 'number' },
              losses: { type: 'number' },
              total_matches: { type: 'number' },
              total_goals_scored: { type: 'number' },
              total_goals_conceded: { type: 'number' },
              friend_count: { type: 'number' },
              friendship_date: { type: 'string' }
            }
          }
        },
        count: { type: 'number' }
      }
    }
  }
} as const;

/**
 * Handler: GET /api/friendships
 * Récupère la liste des amis de l'utilisateur connecté avec leurs stats
 *
 * @requires Authentication
 * @returns 200 - Liste des amis avec leurs détails
 */
export async function getFriends(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<GetFriendsResponse> {
  const userId = request.user!.userId;

  const friends = friendshipRepo.getFriendsWithDetails(userId);
  const safeFriends = friends.map(({ password_hash, email, controls, ...friend }) => friend);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: safeFriends,
    count: safeFriends.length
  });
}
