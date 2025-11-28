import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo } from '../../../core/db/models/Tournament.js';
import { idParamSchema } from '../../schemas.js';
import { successMessageSchema, errorResponseSchema, SuccessMessage, ErrorResponse } from '../../types.js';

interface DeleteTournamentParams {
  id: number;
}

type DeleteTournamentResponse = SuccessMessage | ErrorResponse;

export const deleteTournamentSchema = {
  description: 'Supprimer un tournoi',
  tags: ['tournaments'],
  params: idParamSchema,
  response: {
    200: successMessageSchema,
    404: errorResponseSchema
  }
};

export async function deleteTournament(
  request: FastifyRequest<{ Params: DeleteTournamentParams }>,
  reply: FastifyReply
): Promise<DeleteTournamentResponse> {
  const { id } = request.params;

  // Vérifier que le tournoi existe
  const tournament = tournamentRepo.getTournamentById(id);
  if (!tournament) {
    return reply.code(404).send({
      success: false,
      error: 'Tournament not found'
    });
  }

  tournamentRepo.deleteTournament(id);

  return reply.code(200).send({
    success: true,
    message: 'Tournament deleted successfully'
  });
}
