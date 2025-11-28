import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { AuthService, JWTPayload } from './auth.service.js';
import { ErrorResponse } from '../../routes/types.js';

// Étendre le type FastifyRequest pour inclure user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

/**
 * Middleware d'authentification JWT
 * Vérifie que le token JWT est présent et valide
 *
 * @returns 401 - Si le token est manquant, invalide ou expiré
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<ErrorResponse | void> {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: 'No authorization header provided'
      });
    }

    // Format attendu: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: 'Invalid authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];

    // Vérifier et décoder le token
    const payload = AuthService.verifyToken(token);

    // Ajouter les données de l'utilisateur à la requête
    request.user = payload;

  } catch (error) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid or expired JWT token'
    });
  }
}
