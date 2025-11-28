import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo, TournamentParticipant } from '../../../core/db/models/Tournament.js';
import { tournamentParticipantSchema, idParamSchema } from '../../schemas.js';
import { createSuccessArrayResponseSchema, errorResponseSchema, SuccessResponse, ErrorResponse } from '../../types.js';

interface GetParticipantsParams {
  id: number;
}

type GetParticipantsResponse = SuccessResponse<TournamentParticipant[]> | ErrorResponse;

export const getParticipantsSchema = {
  description: 'Récupérer tous les participants d\'un tournoi',
  tags: ['tournaments'],
  params: idParamSchema,
  response: {
    200: createSuccessArrayResponseSchema(tournamentParticipantSchema, 'Liste des participants'),
    404: errorResponseSchema
  }
};

export async function getParticipants(
  request: FastifyRequest<{ Params: GetParticipantsParams }>,
  reply: FastifyReply
): Promise<GetParticipantsResponse> {
  const { id: tournament_id } = request.params;

  // Vérifier que le tournoi existe
  const tournament = tournamentRepo.getTournamentById(tournament_id);
  if (!tournament) {
    return reply.code(404).send({
      success: false,
      error: 'Tournament not found'
    });
  }

  const participants = tournamentRepo.getParticipants(tournament_id);

  return reply.code(200).send({
    success: true,
    data: participants,
    count: participants.length
  });
}
