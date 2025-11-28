import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema, createSuccessResponseSchema } from '../../types.js';
import { idParamSchema, userSchema } from '../../schemas.js';

// Types pour ce handler
type SafeUser = Omit<User, 'password_hash'>;

interface UpdateUserParams {
  id: number;
}

interface UpdateUserBody {
  username?: string;
  email?: string;
  avatar_url?: string;
}

type UpdateUserResponse =
  | SuccessResponse<SafeUser>
  | ErrorResponse;

// Schéma de validation (réutilise les propriétés de userSchema)
export const updateUserSchema = {
  description: 'Met à jour un utilisateur',
  tags: ['users'],
  params: idParamSchema,
  body: {
    type: 'object' as const,
    properties: {
      username: userSchema.properties.username,
      email: userSchema.properties.email,
      avatar_url: userSchema.properties.avatar_url
    }
  },
  response: {
    200: createSuccessResponseSchema(userSchema, 'Utilisateur mis à jour'),
    404: { description: 'Utilisateur non trouvé', ...errorResponseSchema },
    409: { description: 'Username ou email déjà pris', ...errorResponseSchema },
    500: { description: 'Erreur serveur', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: PUT /api/users/:id
 * Met à jour un utilisateur
 *
 * @param id - ID de l'utilisateur (params)
 * @param username - Nouveau username (body, optionnel)
 * @param email - Nouvel email (body, optionnel)
 * @param avatar_url - Nouvelle URL d'avatar (body, optionnel)
 * @returns 200 - Utilisateur mis à jour
 * @returns 404 - Utilisateur non trouvé
 * @returns 409 - Username ou email déjà pris
 */
export async function updateUser(request: FastifyRequest<{ Params: UpdateUserParams; Body: UpdateUserBody }>, reply: FastifyReply): Promise<UpdateUserResponse> {
  const userId = request.params.id; // Déjà un number !
  const { username, email, avatar_url } = request.body;

  const existingUser = userRepo.getUserById(userId);
  if (!existingUser) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  // Vérifier username unique
  if (username && username !== existingUser.username) {
    const userWithSameUsername = userRepo.getUserByUsername(username);
    if (userWithSameUsername) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: 'Username already taken'
      });
    }
  }

  // Vérifier email unique
  if (email && email !== existingUser.email) {
    const userWithSameEmail = userRepo.getUserByEmail(email);
    if (userWithSameEmail) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: 'Email already taken'
      });
    }
  }

  const updatedUser = userRepo.updateUser(userId, { username, email, avatar_url });
  if (!updatedUser) {
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: 'Failed to update user'
    });
  }

  const { password_hash, ...safeUser } = updatedUser;
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: safeUser,
    message: 'User updated successfully'
  });
}
