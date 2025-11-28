import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo, Tournament } from '../../../core/db/models/Tournament.js';
import { tournamentSchema, limitQuerySchema } from '../../schemas.js';
import { createSuccessArrayResponseSchema, SuccessResponse } from '../../types.js';

interface GetAllTournamentsQuery {
  limit?: number;
}

type GetAllTournamentsResponse = SuccessResponse<Tournament[]>;

export const getAllTournamentsSchema = {
  description: 'Récupérer tous les tournois',
  tags: ['tournaments'],
  querystring: limitQuerySchema,
  response: {
    200: createSuccessArrayResponseSchema(tournamentSchema, 'Liste des tournois')
  }
};

export async function getAllTournaments(
  request: FastifyRequest<{ Querystring: GetAllTournamentsQuery }>,
  reply: FastifyReply
): Promise<GetAllTournamentsResponse> {
  const { limit } = request.query;

  const tournaments = tournamentRepo.getAllTournaments(limit);

  return reply.code(200).send({
    success: true,
    data: tournaments,
    count: tournaments.length
  });
}
