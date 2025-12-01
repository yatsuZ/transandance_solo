import { FastifyRequest, FastifyReply } from 'fastify';
import { tournamentRepo, Tournament } from '../../../core/db/models/Tournament.js';
import { userRepo } from '../../../core/db/models/User.js';
import { tournamentSchema, idParamSchema } from '../../schemas.js';
import { createSuccessResponseSchema, errorResponseSchema, SuccessResponse, ErrorResponse } from '../../types.js';

interface EndTournamentParams {
  id: number;
}

interface EndTournamentBody {
  winner_participant_id?: number;
  status?: 'completed' | 'leave';
}

type EndTournamentResponse = SuccessResponse<Tournament> | ErrorResponse;

export const endTournamentSchema = {
  description: 'Terminer un tournoi',
  tags: ['tournaments'],
  params: idParamSchema,
  body: {
    type: 'object',
    properties: {
      winner_participant_id: { type: 'integer', description: 'ID du participant vainqueur (optionnel si leave)' },
      status: { type: 'string', enum: ['completed', 'leave'], description: 'Statut final (défaut: completed)' }
    }
  },
  response: {
    200: createSuccessResponseSchema(tournamentSchema, 'Tournament terminé avec succès'),
    404: errorResponseSchema
  }
};

export async function endTournament(
  request: FastifyRequest<{ Params: EndTournamentParams; Body: EndTournamentBody }>,
  reply: FastifyReply
): Promise<EndTournamentResponse> {
  const { id } = request.params;
  const { winner_participant_id, status } = request.body;

  // Vérifier que le tournoi existe
  const tournament = tournamentRepo.getTournamentById(id);
  if (!tournament) {
    return reply.code(404).send({
      success: false,
      error: 'Tournament not found'
    });
  }

  const finalStatus = status || 'completed';
  const winnerId = winner_participant_id || null;

  const updatedTournament = tournamentRepo.endTournament(id, winnerId, finalStatus);

  // ✅ Mettre à jour les statistiques des participants (uniquement pour les humains)
  if (finalStatus === 'completed') {
    const participants = tournamentRepo.getParticipants(id);

    participants.forEach(participant => {
      // Ignorer les bots (is_bot = true)
      if (participant.is_bot || participant.user_id === null) return;

      // Si c'est le gagnant : incrémenter tournaments_won ET tournaments_played
      if (participant.id === winnerId) {
        userRepo.incrementTournamentsWon(participant.user_id);
        console.log(`✅ User ${participant.user_id} (${participant.display_name}) a gagné le tournoi ${id}`);
      } else {
        // Sinon : incrémenter seulement tournaments_played
        userRepo.incrementTournamentsPlayed(participant.user_id);
        console.log(`📊 User ${participant.user_id} (${participant.display_name}) a participé au tournoi ${id}`);
      }
    });
  }

  return reply.code(200).send({
    success: true,
    data: updatedTournament!
  });
}
