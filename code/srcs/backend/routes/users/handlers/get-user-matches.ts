import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema, createSuccessArrayResponseSchema } from '../../types.js';
import { idParamSchema, matchSchema } from '../../schemas.js';

// Types pour ce handler
interface GetUserMatchesParams {
  id: number;
}

type GetUserMatchesResponse =
  | SuccessResponse<Match[]>
  | ErrorResponse;

// Schéma de validation
export const getUserMatchesSchema = {
  description: 'Récupère l\'historique des matchs d\'un utilisateur',
  tags: ['users'],
  params: idParamSchema,
  response: {
    200: createSuccessArrayResponseSchema(matchSchema, 'Historique des matchs'),
    404: { description: 'Utilisateur non trouvé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/users/:id/matches
 * Récupère l'historique des matchs d'un utilisateur
 *
 * @param id - ID de l'utilisateur (params)
 * @returns 200 - Liste des matchs de l'utilisateur
 * @returns 404 - Utilisateur non trouvé
 */
export async function getUserMatches(request: FastifyRequest<{ Params: GetUserMatchesParams }>, reply: FastifyReply): Promise<GetUserMatchesResponse> {
  const userId = request.params.id; // Déjà un number !

  const user = userRepo.getUserById(userId);
  if (!user) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  const matches = matchRepo.getMatchesByUser(userId);
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: matches,
    count: matches.length
  });
}
