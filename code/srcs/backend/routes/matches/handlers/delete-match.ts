import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo } from '../../../core/db/models/Match.js';
import { ErrorResponse, errorResponseSchema, successMessageSchema } from '../../types.js';
import { idParamSchema } from '../../schemas.js';

// Types pour ce handler
interface DeleteMatchParams {
  id: number;
}

type DeleteMatchResponse =
  | { success: true; message: string }
  | ErrorResponse;

// Schéma de validation
export const deleteMatchSchema = {
  description: 'Supprime un match',
  tags: ['matches'],
  params: idParamSchema,
  response: {
    200: { description: 'Match supprimé', ...successMessageSchema },
    404: { description: 'Match non trouvé', ...errorResponseSchema },
    500: { description: 'Erreur serveur', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: DELETE /api/matches/:id
 * Supprime un match
 *
 * @param id - ID du match (params)
 * @returns 200 - Match supprimé
 * @returns 404 - Match non trouvé
 * @returns 500 - Erreur lors de la suppression
 */
export async function deleteMatch(request: FastifyRequest<{ Params: DeleteMatchParams }>, reply: FastifyReply): Promise<DeleteMatchResponse> {
  const matchId = request.params.id; // Déjà un number !

  const match = matchRepo.getMatchById(matchId);
  if (!match) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'Match not found'
    });
  }

  const deleted = matchRepo.deleteMatch(matchId);
  if (!deleted) {
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: 'Failed to delete match'
    });
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    message: 'Match deleted successfully'
  });
}
