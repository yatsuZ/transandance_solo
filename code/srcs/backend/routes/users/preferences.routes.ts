import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { userRepo } from '../../core/db/models/User.js';
import { errorResponseSchema } from '../types.js';
import { authMiddleware } from '../../core/auth/auth.middleware.js';

export async function preferencesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/music', {
    schema: {
      response: {
        200: Type.Object({
          volume: Type.Number({ minimum: 0, maximum: 100 }),
          enabled: Type.Number({ minimum: 0, maximum: 2 }),
        }),
        401: { description: 'Non authentifié', ...errorResponseSchema },
        404: { description: 'Utilisateur introuvable', ...errorResponseSchema },
      },
    },
  }, async (request, reply) => {
    const userId = request.user?.userId;
    if (!userId) {
      return reply.code(401).send({ success: false, error: 'Non authentifié' });
    }

    const user = userRepo.getUserById(userId);
    if (!user) {
      return reply.code(404).send({ success: false, error: 'Utilisateur introuvable' });
    }

    return reply.code(200).send({
      volume: user.music_volume ?? 50,
      enabled: user.music_enabled ?? 0,
    });
  });

  fastify.put('/music', {
    schema: {
      body: Type.Object({
        volume: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
        enabled: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
      }),
      response: {
        200: Type.Object({
          message: Type.String(),
          volume: Type.Number(),
          enabled: Type.Number(),
        }),
        401: { description: 'Non authentifié', ...errorResponseSchema },
        404: { description: 'Utilisateur introuvable', ...errorResponseSchema },
      },
    },
  }, async (request, reply) => {
    const userId = request.user?.userId;
    if (!userId) {
      return reply.code(401).send({ success: false, error: 'Non authentifié' });
    }

    const { volume, enabled } = request.body as { volume?: number; enabled?: number };

    const user = userRepo.getUserById(userId);
    if (!user) {
      return reply.code(404).send({ success: false, error: 'Utilisateur introuvable' });
    }

    // Mettre à jour les préférences
    const updateData: any = {};
    if (volume !== undefined) updateData.music_volume = volume;
    if (enabled !== undefined) updateData.music_enabled = enabled;

    userRepo.updateUser(userId, updateData);

    return reply.code(200).send({
      message: 'Préférences musicales mises à jour',
      volume: volume ?? user.music_volume ?? 50,
      enabled: enabled ?? user.music_enabled ?? 0,
    });
  });
}
