import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, SafeUser, sanitizeUser, createSuccessArrayResponseSchema } from '../../types.js';
import { limitQuerySchema, userSchema} from '../../schemas.js';

interface GetAllUsersQuery {
  limit?: number;
}

type GetAllUsersResponse =
  | SuccessResponse<SafeUser[]>
  | ErrorResponse;

export const getAllUsersSchema = {
  description: 'Récupère tous les utilisateurs',
  tags: ['users'],
  querystring: limitQuerySchema,
  response: {
    200: createSuccessArrayResponseSchema(userSchema, 'Liste des utilisateurs')
  }
} as const;

/**
 * Handler: GET /api/users
 * Récupère tous les utilisateurs de la base de données
 *
 * @param limit - Nombre d'utilisateurs à retourner (query, optionnel, si absent retourne tous)
 * @returns 200 - Liste des utilisateurs
 */
export async function getAllUsers(request: FastifyRequest<{ Querystring: GetAllUsersQuery }>, reply: FastifyReply): Promise<GetAllUsersResponse> {
  const limit = request.query.limit;
  const users = userRepo.getAllUsers(limit);
  const safeUsers = users.map(sanitizeUser);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: safeUsers,
    count: safeUsers.length
  });
}
