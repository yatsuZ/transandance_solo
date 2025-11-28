import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo, Tournament } from '../../../core/db/models/Tournament.js';
import { userRepo } from '../../../core/db/models/User.js';
import { tournamentSchema } from '../../schemas.js';
import { createSuccessResponseSchema, errorResponseSchema, SuccessResponse, ErrorResponse } from '../../types.js';

interface CreateTournamentBody {
  manager_id: number;
  nbr_of_matches?: number;
}

type CreateTournamentResponse = SuccessResponse<Tournament> | ErrorResponse;

export const createTournamentSchema = {
  description: 'Créer un nouveau tournoi',
  tags: ['tournaments'],
  body: {
    type: 'object',
    required: ['manager_id'],
    properties: {
      manager_id: { type: 'integer', description: 'ID du gestionnaire du tournoi' },
      nbr_of_matches: { type: 'integer', minimum: 1, description: 'Nombre de matches (optionnel, défaut: 3)' }
    }
  },
  response: {
    201: createSuccessResponseSchema(tournamentSchema, 'Tournament créé avec succès'),
    404: errorResponseSchema
  }
};

export async function createTournament(
  request: FastifyRequest<{ Body: CreateTournamentBody }>,
  reply: FastifyReply
): Promise<CreateTournamentResponse> {
  const { manager_id, nbr_of_matches } = request.body;

  // Vérifier que le manager existe
  const manager = userRepo.getUserById(manager_id);
  if (!manager) {
    return reply.code(404).send({
      success: false,
      error: 'Manager not found'
    });
  }

  const tournament = tournamentRepo.createTournament({
    manager_id,
    nbr_of_matches
  });

  return reply.code(201).send({
    success: true,
    data: tournament
  });
}
