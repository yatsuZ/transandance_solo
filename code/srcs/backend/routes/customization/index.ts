import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../core/auth/auth.middleware.js';
import {
  getCustomization,
  getCustomizationSchema
} from './handlers/get-customization.js';
import {
  updateCustomization,
  updateCustomizationSchema
} from './handlers/update-customization.js';
import {
  deleteCustomization,
  deleteCustomizationSchema
} from './handlers/delete-customization.js';

export async function customizationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/:game_type', { schema: getCustomizationSchema }, getCustomization);

  fastify.put('/:game_type', { schema: updateCustomizationSchema }, updateCustomization);

  fastify.delete('/:game_type', { schema: deleteCustomizationSchema }, deleteCustomization);
}
