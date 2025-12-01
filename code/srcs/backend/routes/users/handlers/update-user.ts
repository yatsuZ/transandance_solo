import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';
import { MultipartFile } from '@fastify/multipart';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// Types pour ce handler
type SafeUser = Omit<User, 'password_hash'>;

interface UpdateUserParams {
  id: number;
}

type UpdateUserResponse =
  | SuccessResponse<SafeUser>
  | ErrorResponse;

/**
 * Handler: PUT /api/users/:id
 * Met à jour un utilisateur (avec support multipart/form-data pour l'avatar)
 *
 * @param id - ID de l'utilisateur (params)
 * @param username - Nouveau username (field, optionnel)
 * @param email - Nouvel email (field, optionnel)
 * @param password - Nouveau mot de passe (field, optionnel)
 * @param avatar - Fichier avatar (file, optionnel)
 * @returns 200 - Utilisateur mis à jour
 * @returns 400 - Validation error
 * @returns 404 - Utilisateur non trouvé
 * @returns 409 - Username ou email déjà pris
 */
export async function updateUser(request: FastifyRequest<{ Params: UpdateUserParams }>, reply: FastifyReply): Promise<UpdateUserResponse> {
  const userId = request.params.id;

  // Vérifier que l'utilisateur existe
  const existingUser = userRepo.getUserById(userId);
  if (!existingUser) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  try {
    // Parser le multipart/form-data
    const parts = request.parts();

    let username: string | undefined;
    let email: string | undefined;
    let password: string | undefined;
    let avatarPath: string | undefined;

    // Parcourir les champs et fichiers
    for await (const part of parts) {
      if (part.type === 'field') {
        const fieldName = part.fieldname;
        const value = part.value as string;

        if (fieldName === 'username') username = value.trim();
        else if (fieldName === 'email') email = value.trim();
        else if (fieldName === 'password') password = value;
      } else if (part.type === 'file') {
        if (part.fieldname === 'avatar') {
          // Valider le type de fichier
          const mimeType = part.mimetype;
          if (!mimeType.startsWith('image/')) {
            return reply.code(StatusCodes.BAD_REQUEST).send({
              success: false,
              error: 'Avatar must be an image file'
            });
          }

          // Générer un nom de fichier unique
          const ext = path.extname(part.filename);
          const filename = `avatar_${userId}_${Date.now()}${ext}`;
          const uploadPath = path.join(process.cwd(), 'uploads', 'avatars', filename);

          // Sauvegarder le fichier
          await pipeline(part.file, createWriteStream(uploadPath));
          avatarPath = `/uploads/avatars/${filename}`;

          console.log(`✅ Avatar uploadé: ${avatarPath}`);
        }
      }
    }

    // Validation des champs modifiés
    if (username !== undefined && username.length < 1) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: 'Username cannot be empty'
      });
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    if (password !== undefined && password.length < 6) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: 'Password must be at least 6 characters'
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

    // Hasher le mot de passe si fourni
    let password_hash: string | undefined;
    if (password) {
      password_hash = await AuthService.hashPassword(password);
    }

    // Mettre à jour l'utilisateur avec les champs modifiés
    const updatedUser = userRepo.updateUser(userId, {
      username,
      email,
      password_hash,
      avatar_url: avatarPath
    });

    if (!updatedUser) {
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: 'Failed to update user'
      });
    }

    const { password_hash: _, ...safeUser } = updatedUser;
    return reply.code(StatusCodes.OK).send({
      success: true,
      data: safeUser,
      message: 'User updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: error.message || 'Failed to update user'
    });
  }
}
