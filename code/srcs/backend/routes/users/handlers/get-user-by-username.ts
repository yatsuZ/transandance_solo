import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, SafeUser, sanitizeUser, errorResponseSchema, createSuccessResponseSchema } from '../../types.js';
import { userSchema } from '../../schemas.js';

interface GetUserByUsernameParams {
  username: string;
}

type GetUserByUsernameResponse =
  | SuccessResponse<SafeUser>
  | ErrorResponse;

export const getUserByUsernameSchema = {
  description: 'Récupère un utilisateur par son username',
  tags: ['users'],
  params: {
    type: 'object' as const,
    required: ['username'],
    properties: {
      username: { type: 'string', minLength: 1, maxLength: 16 }
    }
  },
  response: {
    200: createSuccessResponseSchema(userSchema, 'Utilisateur trouvé'),
    404: { description: 'Utilisateur non trouvé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/users/username/:username
 * Récupère un utilisateur par son username
 *
 * @param username - Username de l'utilisateur (params)
 * @returns 200 - Utilisateur trouvé
 * @returns 404 - Utilisateur non trouvé
 */
export async function getUserByUsername(request: FastifyRequest<{ Params: GetUserByUsernameParams }>, reply: FastifyReply): Promise<GetUserByUsernameResponse> {
  const user = userRepo.getUserByUsername(request.params.username);
  if (!user) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: sanitizeUser(user)
  });
}

