import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { AuthService, JWTPayload } from './auth.service.js';
import { ErrorResponse } from '../../routes/types.js';
import { userRepo } from '../db/models/User.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<ErrorResponse | void> {
  try {
    const token = request.cookies.auth_token;

    if (!token) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: 'No authentication token found'
      });
    }

    const payload = AuthService.verifyToken(token);

    request.user = payload;

    userRepo.updateLastSeen(payload.userId);

  } catch (error) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid or expired JWT token'
    });
  }
}
