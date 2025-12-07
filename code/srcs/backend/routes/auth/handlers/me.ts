import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface MeData {
  user: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
    controls: string;
  };
}

type MeResponse =
  | SuccessResponse<MeData>
  | ErrorResponse;

export const meSchema = {
  description: 'Récupère les informations de l\'utilisateur connecté via le cookie JWT',
  tags: ['auth'],
  response: {
    200: {
      description: 'Utilisateur authentifié',
      type: 'object' as const,
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object' as const,
          properties: {
            user: {
              type: 'object' as const,
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: ['string', 'null'] },
                avatar_url: { type: ['string', 'null'] },
                controls: { type: 'string' }
              }
            }
          }
        }
      }
    },
    401: { description: 'Non authentifié ou token invalide', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/auth/me
 * Retourne les informations de l'utilisateur connecté (via JWT cookie)
 *
 * Cette route nécessite le middleware d'authentification qui vérifie le cookie JWT
 * et ajoute request.user avec les données du token décodé
 *
 * @returns 200 - Données utilisateur
 * @returns 401 - Token invalide/expiré ou utilisateur inexistant
 */
export async function me(request: FastifyRequest, reply: FastifyReply): Promise<MeResponse> {
  // Le middleware d'auth a déjà vérifié le token et ajouté request.user
  const authenticatedUser = (request as any).user;

  if (!authenticatedUser || !authenticatedUser.userId) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Unauthorized'
    });
  }

  // Récupérer les données complètes de l'utilisateur depuis la BDD
  const user = userRepo.getUserById(authenticatedUser.userId);

  if (!user) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'User not found'
    });
  }

  // Retourner les données utilisateur
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        controls: user.controls
      }
    }
  });
}
