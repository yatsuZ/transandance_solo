import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema, createSuccessResponseSchema } from '../../types.js';
import { userSchema } from '../../schemas.js';
import { AuthService } from '../../../core/auth/auth.service.js';

// Types pour ce handler
type SafeUser = Omit<User, 'password_hash'>;

interface CreateUserBody {
  username: string;
  email: string;
  password: string;
}

type CreateUserResponse =
  | SuccessResponse<SafeUser>
  | ErrorResponse;

// Schéma de validation (réutilise les propriétés de userSchema)
export const createUserSchema = {
  description: 'Crée un nouvel utilisateur (usage interne/admin)',
  tags: ['users'],
  body: {
    type: 'object' as const,
    required: ['username', 'email', 'password'],
    properties: {
      username: userSchema.properties.username,
      email: userSchema.properties.email,
      password: { type: 'string', minLength: 1, description: 'Mot de passe (sera hashé)' }
    }
  },
  response: {
    201: createSuccessResponseSchema(userSchema, 'Utilisateur créé avec succès'),
    409: { description: 'Username ou email déjà utilisé', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: POST /api/users
 * Crée un nouvel utilisateur
 *
 * @param body - Données de l'utilisateur (username, email, password)
 * @returns 201 - Utilisateur créé
 * @returns 409 - Username ou email déjà utilisé
 */
export async function createUser(request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply): Promise<CreateUserResponse> {
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

  // Hasher le mot de passe avec bcrypt
  const password_hash = await AuthService.hashPassword(password);

  // Créer l'utilisateur
  const user = userRepo.createUser({
    username,
    email,
    password_hash
  });

  // Retourner l'utilisateur sans le password_hash
  const { password_hash: _, ...safeUser } = user;
  return reply.code(StatusCodes.CREATED).send({
    success: true,
    data: safeUser,
    message: 'User created successfully'
  });
}
