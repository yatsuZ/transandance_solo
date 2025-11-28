import { FastifyInstance } from 'fastify';
import { createMatch, createMatchSchema } from './handlers/create-match.js';
import { getAllMatches, getAllMatchesSchema } from './handlers/get-all-matches.js';
import { getMatchById, getMatchByIdSchema } from './handlers/get-match-by-id.js';
import { updateScore, updateScoreSchema } from './handlers/update-score.js';
import { endMatch, endMatchSchema } from './handlers/end-match.js';
import { getMatchesByStatus, getMatchesByStatusSchema } from './handlers/get-matches-by-status.js';
import { deleteMatch, deleteMatchSchema } from './handlers/delete-match.js';

/**
 * Routes matches - fichier principal
 * Associe les routes HTTP aux handlers avec validation par schémas
 */
export default async function matchRoutes(fastify: FastifyInstance) {
  // POST /api/matches - Créer un nouveau match
  fastify.post('/', { schema: createMatchSchema }, createMatch);

  // GET /api/matches - Récupérer tous les matchs
  fastify.get('/', { schema: getAllMatchesSchema }, getAllMatches);

  // GET /api/matches/:id - Récupérer un match par ID
  fastify.get('/:id', { schema: getMatchByIdSchema }, getMatchById);

  // PUT /api/matches/:id/score - Mettre à jour le score
  fastify.put('/:id/score', { schema: updateScoreSchema }, updateScore);

  // POST /api/matches/:id/end - Terminer un match
  fastify.post('/:id/end', { schema: endMatchSchema }, endMatch);

  // GET /api/matches/status/:status - Récupérer les matchs par statut
  fastify.get('/status/:status', { schema: getMatchesByStatusSchema }, getMatchesByStatus);

  // DELETE /api/matches/:id - Supprimer un match
  fastify.delete('/:id', { schema: deleteMatchSchema }, deleteMatch);
}
