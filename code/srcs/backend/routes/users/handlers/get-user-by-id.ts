import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, SafeUser, sanitizeUser, errorResponseSchema, createSuccessResponseSchema } from '../../types.js';
import { idParamSchema, userSchema } from '../../schemas.js';

interface GetUserByIdParams {
  id: number;
}

type GetUserByIdResponse =
  | SuccessResponse<SafeUser>
  | ErrorResponse;

export const getUserByIdSchema = {
  description: 'Récupère un utilisateur par son ID',
  tags: ['users'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(userSchema, 'Utilisateur trouvé'),
    404: { description: 'Utilisateur non trouvé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/users/:id
 * Récupère un utilisateur par son ID
 *
 * @param id - ID de l'utilisateur (params)
 * @returns 200 - Utilisateur trouvé
 * @returns 404 - Utilisateur non trouvé
 */
export async function getUserById(request: FastifyRequest<{ Params: GetUserByIdParams }>, reply: FastifyReply): Promise<GetUserByIdResponse> {
  const userId = request.params.id;

  const user = userRepo.getUserById(userId);
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
