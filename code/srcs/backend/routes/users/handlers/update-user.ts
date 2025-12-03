import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { SuccessResponse, ErrorResponse, SafeUser, sanitizeUser } from '../../types.js';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

interface UpdateUserParams {
  id: number;
}

type UpdateUserResponse =
  | SuccessResponse<SafeUser>
  | ErrorResponse;

/**
 * Handler: PUT /api/users/:id
 * Met à jour un utilisateur avec support multipart/form-data pour upload avatar
 *
 * @param id - ID de l'utilisateur (params)
 * @param username - Nouveau username (field, optionnel)
 * @param email - Nouvel email (field, optionnel)
 * @param password - Nouveau mot de passe (field, optionnel)
 * @param avatar - Fichier avatar (file, optionnel)
 * @returns 200 - Utilisateur mis à jour avec succès
 * @returns 400 - Erreur de validation
 * @returns 404 - Utilisateur non trouvé
 * @returns 409 - Username ou email déjà pris
 */
export async function updateUser(request: FastifyRequest<{ Params: UpdateUserParams }>, reply: FastifyReply): Promise<UpdateUserResponse> {
  const userId = request.params.id;

  const existingUser = userRepo.getUserById(userId);
  if (!existingUser) {
    return reply.code(StatusCodes.NOT_FOUND).send({
      success: false,
      error: 'User not found'
    });
  }

  try {
    const parts = request.parts();

    let username: string | undefined;
    let email: string | undefined;
    let password: string | undefined;
    let avatarPath: string | undefined;

    for await (const part of parts) {
      if (part.type === 'field') {
        const fieldName = part.fieldname;
        const value = part.value as string;

        if (fieldName === 'username') username = value.trim();
        else if (fieldName === 'email') email = value.trim();
        else if (fieldName === 'password') password = value;
      } else if (part.type === 'file') {
        if (part.fieldname === 'avatar') {
          const mimeType = part.mimetype;
          if (!mimeType.startsWith('image/')) {
            return reply.code(StatusCodes.BAD_REQUEST).send({
              success: false,
              error: 'Avatar must be an image file'
            });
          }

          const ext = path.extname(part.filename);
          const filename = `avatar_${userId}_${Date.now()}${ext}`;
          const uploadPath = path.join(process.cwd(), 'uploads', 'avatars', filename);

          await pipeline(part.file, createWriteStream(uploadPath));
          avatarPath = `/uploads/avatars/${filename}`;
        }
      }
    }

    if (username !== undefined && (username.length < 1 || username.length > 16)) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: 'Username must be between 1 and 16 characters'
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

    if (username && username !== existingUser.username) {
      const userWithSameUsername = userRepo.getUserByUsername(username);
      if (userWithSameUsername) {
        return reply.code(StatusCodes.CONFLICT).send({
          success: false,
          error: 'Username already taken'
        });
      }
    }

    if (email && email !== existingUser.email) {
      const userWithSameEmail = userRepo.getUserByEmail(email);
      if (userWithSameEmail) {
        return reply.code(StatusCodes.CONFLICT).send({
          success: false,
          error: 'Email already taken'
        });
      }
    }

    let password_hash: string | undefined;
    if (password) {
      password_hash = await AuthService.hashPassword(password);
    }

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

    return reply.code(StatusCodes.OK).send({
      success: true,
      data: sanitizeUser(updatedUser),
      message: 'User updated successfully'
    });
  } catch (error: any) {
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: error.message || 'Failed to update user'
    });
  }
}
