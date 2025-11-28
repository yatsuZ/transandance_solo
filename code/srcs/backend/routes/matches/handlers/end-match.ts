import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, createSuccessResponseSchema, errorResponseSchema } from '../../types.js';
import { idParamSchema, matchSchema } from '../../schemas.js';

// Types pour ce handler
interface EndMatchParams {
  id: number;
}

interface EndMatchBody {
  winner_id: number | null;
  winner_name: string | null;
  score_left: number;
  score_right: number;
  status?: 'completed' | 'leave';
}

type EndMatchResponse =
  | SuccessResponse<Match>
  | ErrorResponse;

// Schéma de validation
export const endMatchSchema = {
  description: 'Termine un match et met à jour les statistiques',
  tags: ['matches'],
  params: idParamSchema,
  body: {
    type: 'object' as const,
    required: ['score_left', 'score_right'],
    properties: {
      winner_id: { type: ['integer', 'null'] },
      winner_name: { type: ['string', 'null'] },
      score_left: { type: 'integer', minimum: 0 },
      score_right: { type: 'integer', minimum: 0 },
      status: { type: 'string', enum: ['completed', 'leave'] }
    }
  },
  response: {
    200: createSuccessResponseSchema(matchSchema, 'Match terminé'),
    404: { description: 'Match non trouvé', ...errorResponseSchema },
    400: { description: 'Match déjà terminé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: POST /api/matches/:id/end
 * Termine un match et met à jour les statistiques des joueurs
 *
 * @param id - ID du match (params)
 * @param winner_id - ID du gagnant (body, optionnel)
 * @param winner_name - Nom du gagnant (body, optionnel)
 * @param score_left - Score final du joueur gauche (body)
 * @param score_right - Score final du joueur droit (body)
 * @param status - Statut final (body, optionnel, défaut: 'completed')
 * @returns 200 - Match terminé
 * @returns 404 - Match non trouvé
 * @returns 400 - Match déjà terminé
 */
export async function endMatch(request: FastifyRequest<{ Params: EndMatchParams; Body: EndMatchBody }>, reply: FastifyReply): Promise<EndMatchResponse> {
  const matchId = request.params.id; // Déjà un number !
  const { winner_id, winner_name, score_left, score_right, status } = request.body;

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
      error: 'Match already finished'
    });
  }

  // Mettre à jour le score final
  matchRepo.updateMatchScore(matchId, { score_left, score_right });

  // Terminer le match
  const endedMatch = matchRepo.endMatch(matchId, winner_id, winner_name, status || 'completed');

  // Mettre à jour les stats si le match est complété
  if (status !== 'leave' && winner_id) {
    const loserId = match.player_left_id === winner_id ? match.player_right_id : match.player_left_id;

    if (winner_id) {
      const winnerStats = matchRepo.getMatchStatsForPlayer(matchId, winner_id);
      if (winnerStats) userRepo.updateStats(winner_id, winnerStats);
    }

    if (loserId) {
      const loserStats = matchRepo.getMatchStatsForPlayer(matchId, loserId);
      if (loserStats) userRepo.updateStats(loserId, loserStats);
    }
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: endedMatch,
    message: 'Match ended successfully'
  });
}
