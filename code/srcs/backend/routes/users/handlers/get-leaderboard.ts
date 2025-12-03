import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, SafeUser, sanitizeUser, createSuccessArrayResponseSchema } from '../../types.js';
import { limitQuerySchema, userSchema } from '../../schemas.js';

interface GetLeaderboardQuery {
  limit?: number;
}

type GetLeaderboardResponse =
  | SuccessResponse<SafeUser[]>
  | ErrorResponse;

export const getLeaderboardSchema = {
  description: 'Récupère le classement des meilleurs joueurs',
  tags: ['users'],
  querystring: limitQuerySchema,
  response: {
    200: createSuccessArrayResponseSchema(userSchema, 'Classement des joueurs')
  }
} as const;

/**
 * Handler: GET /api/users/leaderboard/top
 * Récupère le classement des meilleurs joueurs classés par score arcade
 *
 * @param limit - Nombre de joueurs à retourner (query, optionnel, défaut: 10)
 * @returns 200 - Classement des joueurs
 */
export async function getLeaderboard(request: FastifyRequest<{ Querystring: GetLeaderboardQuery }>, reply: FastifyReply): Promise<GetLeaderboardResponse> {
  const limit = request.query.limit ?? 10;

  const leaderboard = userRepo.getLeaderboard(limit);
  const safeLeaderboard = leaderboard.map(sanitizeUser);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: safeLeaderboard,
    count: safeLeaderboard.length
  });
}
