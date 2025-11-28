import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { matchRepo, Match } from '../../../core/db/models/Match.js';
import { SuccessResponse, ErrorResponse, createSuccessResponseSchema } from '../../types.js';
import { matchSchema } from '../../schemas.js';

// Types pour ce handler
interface CreateMatchBody {
  player_left_id: number | null;
  player_left_name: string;
  player_right_id: number | null;
  player_right_name: string;
  game_type?: string;
}

type CreateMatchResponse =
  | SuccessResponse<Match>
  | ErrorResponse;

// Schéma de validation (réutilise les propriétés de matchSchema)
export const createMatchSchema = {
  description: 'Crée un nouveau match',
  tags: ['matches'],
  body: {
    type: 'object' as const,
    required: ['player_left_name', 'player_right_name'],
    properties: {
      player_left_id: matchSchema.properties.player_left_id,
      player_left_name: matchSchema.properties.player_left_name,
      player_right_id: matchSchema.properties.player_right_id,
      player_right_name: matchSchema.properties.player_right_name,
      game_type: matchSchema.properties.game_type
    }
  },
  response: {
    201: createSuccessResponseSchema(matchSchema, 'Match créé')
  }
} as const;

/**
 * Handler: POST /api/matches
 * Crée un nouveau match
 *
 * @param player_left_id - ID du joueur gauche (body, optionnel)
 * @param player_left_name - Nom du joueur gauche (body, requis)
 * @param player_right_id - ID du joueur droit (body, optionnel)
 * @param player_right_name - Nom du joueur droit (body, requis)
 * @param game_type - Type de jeu (body, optionnel, défaut: 'pong')
 * @returns 201 - Match créé
 */
export async function createMatch(request: FastifyRequest<{ Body: CreateMatchBody }>, reply: FastifyReply): Promise<CreateMatchResponse> {
  const { player_left_id, player_left_name, player_right_id, player_right_name, game_type } = request.body;

  const match = matchRepo.createMatch({
    player_left_id,
    player_left_name,
    player_right_id,
    player_right_name,
    game_type
  });

  return reply.code(StatusCodes.CREATED).send({
    success: true,
    data: match,
    message: 'Match created successfully'
  });
}
