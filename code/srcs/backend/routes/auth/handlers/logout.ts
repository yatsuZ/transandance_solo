import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../../types.js';

type LogoutResponse = SuccessResponse<null>;

export const logoutSchema = {
  description: 'Déconnecte l\'utilisateur en supprimant le cookie auth_token',
  tags: ['auth'],
  response: {
    200: {
      description: 'Déconnexion réussie',
      type: 'object' as const,
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
} as const;

/**
 * Handler: POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant le cookie JWT
 *
 * @returns 200 - Déconnexion réussie
 */
export async function logout(request: FastifyRequest, reply: FastifyReply): Promise<LogoutResponse> {
  // Supprimer le cookie auth_token
  reply.clearCookie('auth_token', {
    path: '/'
  });

  return reply.code(StatusCodes.OK).send({
    success: true,
    message: 'Logout successful'
  });
}
