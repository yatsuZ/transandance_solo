import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, createSuccessArrayResponseSchema } from '../../types.js';
import { limitQuerySchema, matchSchema } from '../../schemas.js';

// Types pour ce handler
interface GetAllMatchesQuery {
  limit?: number;
}

type GetAllMatchesResponse =
  | SuccessResponse<Match[]>
  | ErrorResponse;

// Schéma de validation
export const getAllMatchesSchema = {
  description: 'Récupère tous les matchs',
  tags: ['matches'],
  querystring: limitQuerySchema,
  response: {
    200: createSuccessArrayResponseSchema(matchSchema, 'Liste des matchs')
  }
} as const;

/**
 * Handler: GET /api/matches
 * Récupère tous les matchs
 *
 * @param limit - Nombre de matchs à retourner (query, optionnel, si absent = tout)
 * @returns 200 - Liste des matchs
 */
export async function getAllMatches(request: FastifyRequest<{ Querystring: GetAllMatchesQuery }>, reply: FastifyReply): Promise<GetAllMatchesResponse> {
  const limit = request.query.limit; // Déjà un number grâce au schéma !
  const matches = matchRepo.getAllMatches(limit);
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: matches,
    count: matches.length
  });
}
