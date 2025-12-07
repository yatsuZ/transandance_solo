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
  winner_id?: number | null;
  winner_name?: string | null;
  score_left?: number;
  score_right?: number;
  status?: 'completed' | 'leave';
}

type EndMatchResponse =
  | SuccessResponse<Match>
  | ErrorResponse;

// Schéma de validation (réutilise les propriétés de matchSchema)
export const endMatchSchema = {
  description: 'Termine un match et met à jour les statistiques',
  tags: ['matches'],
  params: idParamSchema,
  body: {
    type: 'object' as const,
    properties: {
      winner_id: matchSchema.properties.winner_id,
      winner_name: matchSchema.properties.winner_name,
      score_left: matchSchema.properties.score_left,
      score_right: matchSchema.properties.score_right,
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

  // Mettre à jour le score final (si fourni)
  if (score_left !== undefined && score_right !== undefined) {
    matchRepo.updateMatchScore(matchId, { score_left, score_right });
  }

  // Calculer le winner_id si non fourni mais scores disponibles
  let finalWinnerId = winner_id || null;
  let finalWinnerName = winner_name || null;

  if (!finalWinnerId && status !== 'leave' && score_left !== undefined && score_right !== undefined) {
    // Déterminer le gagnant à partir des scores
    if (score_left > score_right) {
      finalWinnerId = match.player_left_id;
      finalWinnerName = match.player_left_name;
    } else if (score_right > score_left) {
      finalWinnerId = match.player_right_id;
      finalWinnerName = match.player_right_name;
    }
    // Si scores égaux, on laisse null (match nul)
  }

  // Terminer le match
  const endedMatch = matchRepo.endMatch(matchId, finalWinnerId, finalWinnerName, status || 'completed');

  // Mettre à jour les stats si le match est complété
  if (status !== 'leave') {
    // Mettre à jour les stats pour le joueur gauche s'il existe
    if (match.player_left_id) {
      const leftStats = matchRepo.getMatchStatsForPlayer(matchId, match.player_left_id);
      if (leftStats) userRepo.updateStats(match.player_left_id, leftStats);
    }

    // Mettre à jour les stats pour le joueur droit s'il existe
    if (match.player_right_id) {
      const rightStats = matchRepo.getMatchStatsForPlayer(matchId, match.player_right_id);
      if (rightStats) userRepo.updateStats(match.player_right_id, rightStats);
    }
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: endedMatch,
    message: 'Match ended successfully'
  });
}
