import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface LoginBody {
  username: string;
  password: string;
}

interface LoginData {
  token: string;
  user: {
    id: number;
    username: string;
    email: string | null;
  };
}

type LoginResponse =
  | SuccessResponse<LoginData>
  | ErrorResponse;

export const loginSchema = {
  description: 'Authentifie un utilisateur et retourne un JWT',
  tags: ['auth'],
  body: {
    type: 'object' as const,
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', minLength: 1, description: 'Nom d\'utilisateur' },
      password: { type: 'string', minLength: 1, description: 'Mot de passe' }
    }
  },
  response: {
    200: {
      description: 'Login réussi',
      type: 'object' as const,
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object' as const,
          properties: {
            token: { type: 'string', description: 'JWT token' },
            user: {
              type: 'object' as const,
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: ['string', 'null'] }
              }
            }
          }
        },
        message: { type: 'string' }
      }
    },
    401: { description: 'Identifiants invalides', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: POST /api/auth/login
 * Authentifie un utilisateur et retourne un JWT
 *
 * @param body - Identifiants (username, password)
 * @returns 200 - JWT token et données utilisateur
 * @returns 401 - Identifiants invalides
 */
export async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply): Promise<LoginResponse> {
  const { username, password } = request.body;

  // Récupérer l'utilisateur par username
  const user = userRepo.getUserByUsername(username);
  if (!user) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Vérifier le mot de passe
  const isPasswordValid = await AuthService.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Générer le JWT
  const token = AuthService.generateToken({
    userId: user.id,
    username: user.username
  });

  // Retourner le token et les données utilisateur (sans password_hash)
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    },
    message: 'Login successful'
  });
}
