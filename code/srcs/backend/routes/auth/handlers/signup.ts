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
                email: { type: ['string', 'null'] }
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

/**
 * Handler: POST /api/auth/signup
 * Crée un nouveau compte utilisateur et retourne un JWT
 *
 * @param body - Données du compte (username, email, password)
 * @returns 201 - Compte créé + JWT token
 * @returns 409 - Username ou email déjà utilisé
 */
export async function signup(request: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply): Promise<SignupResponse> {
  const { username, email, password } = request.body;

  // Vérifier si le username existe déjà
  const existingUserByUsername = userRepo.getUserByUsername(username);
  if (existingUserByUsername) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: 'Username already exists'
    });
  }

  // Vérifier si l'email existe déjà
  const existingUserByEmail = userRepo.getUserByEmail(email);
  if (existingUserByEmail) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: 'Email already exists'
    });
  }

  // Hasher le mot de passe
  const password_hash = await AuthService.hashPassword(password);

  // Créer l'utilisateur
  const user = userRepo.createUser({
    username,
    email,
    password_hash
  });

  // Générer le JWT
  const token = AuthService.generateToken({
    userId: user.id,
    username: user.username
  });

  // Envoyer le JWT dans un cookie HTTP-only sécurisé
  reply.setCookie('auth_token', token, {
    httpOnly: true,  // Pas accessible via JavaScript (sécurité XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
    sameSite: 'strict', // Protection CSRF
    path: '/',
    maxAge: 24 * 60 * 60 // 24 heures en secondes
  });

  // Marquer l'utilisateur comme en ligne
  userRepo.setOnline(user.id, true);

  // Retourner l'utilisateur (sans password_hash ni token dans le JSON)
  const { password_hash: _, ...safeUser } = user;
  return reply.code(StatusCodes.CREATED).send({
    success: true,
    data: {
      user: safeUser
    },
    message: 'Account created successfully'
  });
}
