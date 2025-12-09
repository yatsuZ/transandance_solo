import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';
import { userSchema } from '../../schemas.js';

type SafeUser = Omit<User, 'password_hash'>;

interface SignupBody {
  username: string;
  email: string;
  password: string;
}

interface SignupData {
  token: string;
  user: SafeUser;
}

type SignupResponse =
  | SuccessResponse<SignupData>
  | ErrorResponse;

export const signupSchema = {
  description: 'Crée un nouveau compte utilisateur et retourne un JWT',
  tags: ['auth'],
  body: {
    type: 'object' as const,
    required: ['username', 'email', 'password'],
    properties: {
      username: userSchema.properties.username,
      email: userSchema.properties.email,
      password: { type: 'string', minLength: 6, description: 'Mot de passe (min 6 caractères)' }
    }
  },
  response: {
    201: {
      description: 'Compte créé avec succès',
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
    409: { description: 'Username ou email déjà utilisé', ...errorResponseSchema }
  }
} as const;

export async function signup(request: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply): Promise<SignupResponse> {
  const { username, email, password } = request.body;

  const existingUserByUsername = userRepo.getUserByUsername(username);
  if (existingUserByUsername) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: 'Username already exists'
    });
  }

  if (!email || email.trim() === '') {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: 'Email is required'
    });
  }

  const existingUserByEmail = userRepo.getUserByEmail(email);
  if (existingUserByEmail) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: 'Email already exists'
    });
  }

  const password_hash = await AuthService.hashPassword(password);

  const user = userRepo.createUser({
    username,
    email,
    password_hash
  });

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

  const { password_hash: _, ...safeUser } = user;
  return reply.code(StatusCodes.CREATED).send({
    success: true,
    data: {
      user: safeUser
    },
    message: 'Account created successfully'
  });
}
