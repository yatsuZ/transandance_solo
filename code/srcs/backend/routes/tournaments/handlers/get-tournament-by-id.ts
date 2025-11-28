import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo, Tournament } from '../../../core/db/models/Tournament.js';
import { tournamentSchema, idParamSchema } from '../../schemas.js';
import { createSuccessResponseSchema, errorResponseSchema, SuccessResponse, ErrorResponse } from '../../types.js';

interface GetTournamentParams {
  id: number;
}

type GetTournamentResponse = SuccessResponse<Tournament> | ErrorResponse;

export const getTournamentByIdSchema = {
  description: 'Récupérer un tournoi par son ID',
  tags: ['tournaments'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(tournamentSchema, 'Tournament récupéré avec succès'),
    404: errorResponseSchema
  }
};

export async function getTournamentById(
  request: FastifyRequest<{ Params: GetTournamentParams }>,
  reply: FastifyReply
): Promise<GetTournamentResponse> {
  const { id } = request.params;

  const tournament = tournamentRepo.getTournamentById(id);

  if (!tournament) {
    return reply.code(404).send({
      success: false,
      error: 'Tournament not found'
    });
  }

  return reply.code(200).send({
    success: true,
    data: tournament
  });
}
