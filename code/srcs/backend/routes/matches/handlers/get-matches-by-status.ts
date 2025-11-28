import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, createSuccessArrayResponseSchema } from '../../types.js';
import { limitQuerySchema, matchSchema } from '../../schemas.js';

// Types pour ce handler
interface GetMatchesByStatusParams {
  status: string;
}

interface GetMatchesByStatusQuery {
  limit?: number;
}

type GetMatchesByStatusResponse =
  | SuccessResponse<Match[]>
  | ErrorResponse;

// Schéma de validation
export const getMatchesByStatusSchema = {
  description: 'Récupère les matchs filtrés par statut',
  tags: ['matches'],
  params: {
    type: 'object' as const,
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['in_progress', 'completed', 'leave'] }
    }
  },
  querystring: limitQuerySchema,
  response: {
    200: createSuccessArrayResponseSchema(matchSchema, 'Liste des matchs filtrés')
  }
} as const;

/**
 * Handler: GET /api/matches/status/:status
 * Récupère les matchs filtrés par statut
 *
 * @param status - Statut du match (params: 'in_progress', 'completed', 'leave')
 * @param limit - Nombre de matchs à retourner (query, optionnel, si absent = tout)
 * @returns 200 - Liste des matchs
 */
export async function getMatchesByStatus(request: FastifyRequest<{ Params: GetMatchesByStatusParams; Querystring: GetMatchesByStatusQuery }>, reply: FastifyReply): Promise<GetMatchesByStatusResponse> {
  const { status } = request.params;
  const limit = request.query.limit; // Déjà un number grâce au schéma !

  let matches;
  if (status === 'in_progress') {
    matches = matchRepo.getInProgressMatches();
  } else if (status === 'completed') {
    matches = matchRepo.getCompletedMatches(limit);
  } else {
    matches = matchRepo.getAllMatches().filter(m => m.status === 'leave');
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: matches,
    count: matches.length
  });
}
