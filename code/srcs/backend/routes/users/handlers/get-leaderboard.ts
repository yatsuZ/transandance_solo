import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, createSuccessArrayResponseSchema } from '../../types.js';
import { limitQuerySchema, userSchema } from '../../schemas.js';

// Types pour ce handler
type SafeUser = Omit<User, 'password_hash'>;

interface GetLeaderboardQuery {
  limit?: number;
}

type GetLeaderboardResponse =
  | SuccessResponse<SafeUser[]>
  | ErrorResponse;

// Schéma de validation
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
 * Récupère le classement des meilleurs joueurs
 *
 * @param limit - Nombre de joueurs à retourner (query, optionnel, défaut: 10)
 * @returns 200 - Classement des joueurs
 */
export async function getLeaderboard(request: FastifyRequest<{ Querystring: GetLeaderboardQuery }>, reply: FastifyReply): Promise<GetLeaderboardResponse> {
  const limit = request.query.limit ?? 10; // Défaut: 10 si non fourni

  const leaderboard = userRepo.getLeaderboard(limit);
  const safeLeaderboard = leaderboard.map(({ password_hash, ...user }) => user);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: safeLeaderboard,
    count: safeLeaderboard.length
  });
}
