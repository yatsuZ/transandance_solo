import { FastifyInstance } from 'fastify';
import { createTournament, createTournamentSchema } from './handlers/create-tournament.js';
import { getAllTournaments, getAllTournamentsSchema } from './handlers/get-all-tournaments.js';
import { getTournamentById, getTournamentByIdSchema } from './handlers/get-tournament-by-id.js';
import { addParticipant, addParticipantSchema } from './handlers/add-participant.js';
import { getParticipants, getParticipantsSchema } from './handlers/get-participants.js';
import { endTournament, endTournamentSchema } from './handlers/end-tournament.js';
import { deleteTournament, deleteTournamentSchema } from './handlers/delete-tournament.js';
import { authMiddleware } from '../../core/auth/auth.middleware.js';

/**
 * Routes tournaments - fichier principal
 * Associe les routes HTTP aux handlers avec validation par schémas
 */
export default async function tournamentRoutes(fastify: FastifyInstance) {
  // POST /api/tournaments - Créer un nouveau tournoi
  fastify.post('/', { schema: createTournamentSchema }, createTournament);

  // GET /api/tournaments - Récupérer tous les tournois
  fastify.get('/', { schema: getAllTournamentsSchema }, getAllTournaments);

  // GET /api/tournaments/:id - Récupérer un tournoi par ID
  fastify.get('/:id', { schema: getTournamentByIdSchema }, getTournamentById);

  // POST /api/tournaments/:id/participants - Ajouter un participant
  fastify.post('/:id/participants', { schema: addParticipantSchema }, addParticipant);

  // GET /api/tournaments/:id/participants - Récupérer les participants
  fastify.get('/:id/participants', { schema: getParticipantsSchema }, getParticipants);

  // POST /api/tournaments/:id/end - Terminer un tournoi (protégé)
  fastify.post('/:id/end', { schema: endTournamentSchema, preHandler: [authMiddleware] }, endTournament as any);

  // DELETE /api/tournaments/:id - Supprimer un tournoi (protégé)
  fastify.delete('/:id', { schema: deleteTournamentSchema, preHandler: [authMiddleware] }, deleteTournament as any);
}
