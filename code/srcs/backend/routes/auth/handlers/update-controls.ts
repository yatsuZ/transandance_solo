import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface UpdateControlsBody {
  controls: string; // JSON string
}

type UpdateControlsResponse = SuccessResponse<{}> | ErrorResponse;

export const updateControlsSchema = {
  description: 'Met à jour les contrôles clavier de l\'utilisateur connecté',
  tags: ['auth'],
  body: {
    type: 'object' as const,
    required: ['controls'],
    properties: {
      controls: { type: 'string', description: 'JSON string des contrôles' }
    }
  },
  response: {
    200: {
      description: 'Contrôles mis à jour',
      type: 'object' as const,
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    401: { description: 'Non authentifié', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: PUT /api/auth/controls
 * Met à jour les contrôles clavier de l'utilisateur connecté
 *
 * @param body - Contrôles (JSON string)
 * @returns 200 - Contrôles mis à jour
 * @returns 401 - Non authentifié
 */
export async function updateControls(
  request: FastifyRequest<{ Body: UpdateControlsBody }>,
  reply: FastifyReply
): Promise<UpdateControlsResponse> {
  const authenticatedUser = (request as any).user;

  if (!authenticatedUser || !authenticatedUser.userId) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Unauthorized'
    });
  }

  const { controls } = request.body;

  // Valider que c'est du JSON valide
  try {
    JSON.parse(controls);
  } catch (error) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: 'Invalid JSON format for controls'
    });
  }

  // Mettre à jour les contrôles en BDD
  userRepo.updateControls(authenticatedUser.userId, controls);

  return reply.code(StatusCodes.OK).send({
    success: true,
    message: 'Controls updated successfully'
  });
}
