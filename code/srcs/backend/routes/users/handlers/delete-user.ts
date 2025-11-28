import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { ErrorResponse, errorResponseSchema, successMessageSchema } from '../../types.js';
import { idParamSchema } from '../../schemas.js';

// Types pour ce handler
interface DeleteUserParams {
  id: number;
}

type DeleteUserResponse =
  | { success: true; message: string }
  | ErrorResponse;

// Schéma de validation
export const deleteUserSchema = {
  description: 'Supprime un utilisateur',
  tags: ['users'],
  params: idParamSchema,
  response: {
    200: { description: 'Utilisateur supprimé', ...successMessageSchema },
    404: { description: 'Utilisateur non trouvé', ...errorResponseSchema },
    500: { description: 'Erreur serveur', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: DELETE /api/users/:id
 * Supprime un utilisateur
 *
 * @param id - ID de l'utilisateur (params)
 * @returns 200 - Utilisateur supprimé
 * @returns 404 - Utilisateur non trouvé
 */
export async function deleteUser(request: FastifyRequest<{ Params: DeleteUserParams }>, reply: FastifyReply): Promise<DeleteUserResponse> {
  const userId = request.params.id; // Déjà un number !

  const user = userRepo.getUserById(userId);
  if (!user) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  const deleted = userRepo.deleteUser(userId);
  if (!deleted) {
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: 'Failed to delete user'
    });
  }

  return reply.code(StatusCodes.OK).send({
    success: true,
    message: 'User deleted successfully'
  });
}
