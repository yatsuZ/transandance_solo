import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo, TournamentParticipant } from '../../../core/db/models/Tournament.js';
import { tournamentParticipantSchema, idParamSchema } from '../../schemas.js';
import { createSuccessResponseSchema, errorResponseSchema, SuccessResponse, ErrorResponse } from '../../types.js';

interface AddParticipantParams {
  id: number;
}

interface AddParticipantBody {
  user_id: number | null;
  display_name: string;
  is_bot?: boolean;
}

type AddParticipantResponse = SuccessResponse<TournamentParticipant> | ErrorResponse;

export const addParticipantSchema = {
  description: 'Ajouter un participant à un tournoi',
  tags: ['tournaments'],
  params: idParamSchema,
  body: {
    type: 'object',
    required: ['display_name'],
    properties: {
      user_id: { type: ['integer', 'null'], description: 'ID utilisateur (null pour bot/guest)' },
      display_name: { type: 'string', minLength: 1, maxLength: 50, description: 'Nom affiché' },
      is_bot: { type: 'boolean', description: 'Si le participant est un bot (défaut: false)' }
    }
  },
  response: {
    201: createSuccessResponseSchema(tournamentParticipantSchema, 'Participant ajouté avec succès'),
    404: errorResponseSchema
  }
};

export async function addParticipant(
  request: FastifyRequest<{ Params: AddParticipantParams; Body: AddParticipantBody }>,
  reply: FastifyReply
): Promise<AddParticipantResponse> {
  const { id: tournament_id } = request.params;
  const { user_id, display_name, is_bot } = request.body;

  // Vérifier que le tournoi existe
  const tournament = tournamentRepo.getTournamentById(tournament_id);
  if (!tournament) {
    return reply.code(404).send({
      success: false,
      error: 'Tournament not found'
    });
  }

  const participant = tournamentRepo.addParticipant({
    tournament_id,
    user_id,
    display_name,
    is_bot
  });

  return reply.code(201).send({
    success: true,
    data: participant
  });
}
