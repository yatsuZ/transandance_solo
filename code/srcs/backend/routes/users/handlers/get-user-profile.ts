import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { matchRepo } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, SafeUser, sanitizeUser, errorResponseSchema } from '../../types.js';

interface UserProfile {
  user: SafeUser;
  matchHistory: any[];
}

interface GetUserProfileParams {
  username: string;
}

type GetUserProfileResponse =
  | SuccessResponse<UserProfile>
  | ErrorResponse;

export const getUserProfileSchema = {
  description: 'Récupère le profil complet d\'un utilisateur avec stats et historique',
  tags: ['users'],
  params: {
    type: 'object' as const,
    required: ['username'],
    properties: {
      username: { type: 'string', minLength: 1, maxLength: 16 }
    }
  },
  response: {
    200: {
      description: 'Profil utilisateur trouvé',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            matchHistory: { type: 'array' }
          }
        }
      }
    },
    404: { description: 'Utilisateur non trouvé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/users/profile/:username
 * Récupère le profil complet d'un utilisateur avec ses stats et son historique de matchs
 *
 * @param username - Username de l'utilisateur (params)
 * @returns 200 - Profil complet
 * @returns 404 - Utilisateur non trouvé
 */
export async function getUserProfile(
  request: FastifyRequest<{ Params: GetUserProfileParams }>,
  reply: FastifyReply
): Promise<GetUserProfileResponse> {
  const { username } = request.params;

  const user = userRepo.getUserByUsername(username);
  if (!user) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  const matchHistory = matchRepo.getMatchesByUser(user.id);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      user: sanitizeUser(user),
      matchHistory
    }
  });
}
