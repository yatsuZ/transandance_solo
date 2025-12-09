import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { gameCustomizationRepo } from '../../../core/db/models/GameCustomization.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface DeleteCustomizationParams {
  game_type: 'pong' | 'tron';
}

type DeleteCustomizationResponse =
  | SuccessResponse<any>
  | ErrorResponse;

export const deleteCustomizationSchema = {
  description: 'Supprime la configuration de personnalisation d\'un jeu (retour aux valeurs par défaut)',
  tags: ['customization'],
  params: {
    type: 'object' as const,
    required: ['game_type'],
    properties: {
      game_type: { type: 'string', enum: ['pong', 'tron'] }
    }
  },
  response: {
    200: {
      description: 'Configuration supprimée',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    401: { description: 'Non authentifié', ...errorResponseSchema },
    404: { description: 'Aucune configuration à supprimer', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: DELETE /api/customization/:game_type
 * Supprime la config de personnalisation (retour aux valeurs par défaut)
 *
 * @param game_type - Type de jeu ('pong' ou 'tron')
 * @returns 200 - Configuration supprimée
 * @returns 401 - Non authentifié
 * @returns 404 - Aucune configuration à supprimer
 */
export async function deleteCustomization(
  request: FastifyRequest<{ Params: DeleteCustomizationParams }>,
  reply: FastifyReply
): Promise<DeleteCustomizationResponse> {
  const { game_type } = request.params;
  const userId = request.user?.userId;

  if (!userId) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Non authentifié'
    });
  }

  // Supprimer la config
  const deleted = gameCustomizationRepo.deleteCustomization(userId, game_type);

  if (!deleted) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'Aucune configuration à supprimer'
    });
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    message: 'Configuration supprimée - retour aux valeurs par défaut'
  });
}
