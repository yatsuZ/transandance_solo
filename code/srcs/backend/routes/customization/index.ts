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

/**
 * Routes pour la personnalisation des jeux (Pong & Tron)
 * Toutes les routes sont protégées par authentification
 *
 * Endpoints:
 * - GET    /api/customization/:game_type - Récupère la config
 * - PUT    /api/customization/:game_type - Crée/Met à jour la config
 * - DELETE /api/customization/:game_type - Supprime la config
 */
export async function customizationRoutes(fastify: FastifyInstance) {
  // Appliquer le middleware d'authentification à toutes les routes
  fastify.addHook('preHandler', authMiddleware);

  // GET /api/customization/:game_type - Récupère la config
  fastify.get('/:game_type', { schema: getCustomizationSchema }, getCustomization);

  // PUT /api/customization/:game_type - Crée ou met à jour la config
  fastify.put('/:game_type', { schema: updateCustomizationSchema }, updateCustomization);

  // DELETE /api/customization/:game_type - Supprime la config
  fastify.delete('/:game_type', { schema: deleteCustomizationSchema }, deleteCustomization);
}
