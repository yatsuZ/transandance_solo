import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { TwoFAService } from '../../../core/auth/twofa.service.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface LoginBody {
  username: string;
  password: string;
  twofa_token?: string;
}

interface LoginData {
  token: string;
  user: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
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
      description: 'Login reussi',
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
                email: { type: ['string', 'null'] },
                avatar_url: { type: ['string', 'null'] }
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

export async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply): Promise<LoginResponse> {
  const { username, password, twofa_token } = request.body;

  const user = userRepo.getUserByUsername(username);
  if (!user) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid credentials'
    });
  }

  if (!user.password_hash) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'This account uses Google Sign-In. Please use "Continue with Google" button.'
    });
  }

  const isPasswordValid = await AuthService.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const is2FAEnabled = userRepo.is2FAEnabled(user.id);

  if (is2FAEnabled) {
    if (!twofa_token) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        requires2FA: true,
        message: 'Code 2FA requis'
      });
    }

    const secret = userRepo.get2FASecret(user.id);

    if (!secret) {
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: 'Erreur 2FA'
      });
    }

    const isValid = TwoFAService.verifyToken(twofa_token, secret);

    if (!isValid) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: 'Code 2FA invalide'
      });
    }
  }

  const token = AuthService.generateToken({
    userId: user.id,
    username: user.username
  });

  reply.setCookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60
  });

  userRepo.setOnline(user.id, true);

  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    },
    message: 'Login successful'
  });
}
