import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, createSuccessResponseSchema, errorResponseSchema } from '../../types.js';
import { idParamSchema, matchSchema } from '../../schemas.js';

// Types pour ce handler
interface UpdateScoreParams {
  id: number;
}

interface UpdateScoreBody {
  score_left: number;
  score_right: number;
}

type UpdateScoreResponse =
  | SuccessResponse<Match>
  | ErrorResponse;

// Schéma de validation (réutilise les propriétés de matchSchema)
export const updateScoreSchema = {
  description: 'Met à jour le score d\'un match en cours',
  tags: ['matches'],
  params: idParamSchema,
  body: {
    type: 'object' as const,
    required: ['score_left', 'score_right'],
    properties: {
      score_left: matchSchema.properties.score_left,
      score_right: matchSchema.properties.score_right
    }
  },
  response: {
    200: createSuccessResponseSchema(matchSchema, 'Score mis à jour'),
    404: { description: 'Match non trouvé', ...errorResponseSchema },
    400: { description: 'Match déjà terminé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: PUT /api/matches/:id/score
 * Met à jour le score d'un match en cours
 *
 * @param id - ID du match (params)
 * @param score_left - Score du joueur gauche (body)
 * @param score_right - Score du joueur droit (body)
 * @returns 200 - Score mis à jour
 * @returns 404 - Match non trouvé
 * @returns 400 - Match déjà terminé
 */
export async function updateScore(request: FastifyRequest<{ Params: UpdateScoreParams; Body: UpdateScoreBody }>, reply: FastifyReply): Promise<UpdateScoreResponse> {
  const matchId = request.params.id; // Déjà un number !
  const { score_left, score_right } = request.body;

  const match = matchRepo.getMatchById(matchId);
  if (!match) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'Match not found'
    });
  }

  if (match.status !== 'in_progress') {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: 'Cannot update score of a finished match'
    });
  }

  const updatedMatch = matchRepo.updateMatchScore(matchId, { score_left, score_right });
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: updatedMatch,
    message: 'Score updated successfully'
  });
}
