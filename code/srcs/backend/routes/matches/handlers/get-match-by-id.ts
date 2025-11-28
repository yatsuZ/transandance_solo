import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, createSuccessResponseSchema, errorResponseSchema } from '../../types.js';
import { idParamSchema, matchSchema } from '../../schemas.js';

// Types pour ce handler
interface GetMatchByIdParams {
  id: number;
}

type GetMatchByIdResponse =
  | SuccessResponse<Match>
  | ErrorResponse;

// Schéma de validation
export const getMatchByIdSchema = {
  description: 'Récupère un match par son ID',
  tags: ['matches'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(matchSchema, 'Match trouvé'),
    404: { description: 'Match non trouvé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/matches/:id
 * Récupère un match par son ID
 *
 * @param id - ID du match (params)
 * @returns 200 - Match trouvé
 * @returns 404 - Match non trouvé
 */
export async function getMatchById(request: FastifyRequest<{ Params: GetMatchByIdParams }>, reply: FastifyReply): Promise<GetMatchByIdResponse> {
  const matchId = request.params.id; // Déjà un number !

  const match = matchRepo.getMatchById(matchId);
  if (!match) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'Match not found'
    });
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: match
  });
}
