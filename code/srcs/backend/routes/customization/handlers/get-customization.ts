import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { gameCustomizationRepo } from '../../../core/db/models/GameCustomization.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface GetCustomizationParams {
  game_type: 'pong' | 'tron';
}

type GetCustomizationResponse =
  | SuccessResponse<any>
  | ErrorResponse;

export const getCustomizationSchema = {
  description: 'Récupère la configuration de personnalisation d\'un jeu pour l\'utilisateur connecté',
  tags: ['customization'],
  params: {
    type: 'object' as const,
    required: ['game_type'],
    properties: {
      game_type: { type: 'string', enum: ['pong', 'tron'] }
    }
  },
  response: {
    200: {
      description: 'Configuration récupérée (ou valeurs par défaut si pas de config)',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            paddle_color_left: { type: ['string', 'null'] },
            paddle_color_right: { type: ['string', 'null'] },
            ball_color: { type: ['string', 'null'] },
            vehicle_color_left: { type: ['string', 'null'] },
            vehicle_color_right: { type: ['string', 'null'] },
            trail_color_left: { type: ['string', 'null'] },
            trail_color_right: { type: ['string', 'null'] },
            field_color: { type: ['string', 'null'] },
            text_color: { type: ['string', 'null'] },
            border_color: { type: ['string', 'null'] },
            card_border_color: { type: ['string', 'null'] },
            winning_score: { type: ['integer', 'null'] },
            powerups_enabled: { type: 'boolean' },
            countdown_delay: { type: 'integer' }
          }
        }
      }
    },
    401: { description: 'Non authentifié', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: GET /api/customization/:game_type
 * Récupère la config de personnalisation pour un jeu
 * Si aucune config n'existe, retourne des valeurs par défaut (NULL pour toutes les couleurs)
 *
 * @param game_type - Type de jeu ('pong' ou 'tron')
 * @returns 200 - Config ou valeurs par défaut
 * @returns 401 - Non authentifié
 */
export async function getCustomization(
  request: FastifyRequest<{ Params: GetCustomizationParams }>,
  reply: FastifyReply
): Promise<GetCustomizationResponse> {
  const { game_type } = request.params;
  const userId = request.user?.userId;

  if (!userId) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Non authentifié'
    });
  }

  // Récupérer la config existante
  const customization = gameCustomizationRepo.getCustomization(userId, game_type);

  if (customization) {
    // Config existante - retourner les données
    return reply.code(StatusCodes.OK).send({
      success: true,
      data: {
        paddle_color_left: customization.paddle_color_left,
        paddle_color_right: customization.paddle_color_right,
        ball_color: customization.ball_color,
        vehicle_color_left: customization.vehicle_color_left,
        vehicle_color_right: customization.vehicle_color_right,
        trail_color_left: customization.trail_color_left,
        trail_color_right: customization.trail_color_right,
        field_color: customization.field_color,
        text_color: customization.text_color,
        border_color: customization.border_color,
        card_border_color: customization.card_border_color,
        winning_score: customization.winning_score,
        powerups_enabled: customization.powerups_enabled === 1,
        countdown_delay: customization.countdown_delay
      }
    });
  } else {
    // Pas de config - retourner valeurs par défaut (NULL = utiliser les valeurs du jeu)
    return reply.code(StatusCodes.OK).send({
      success: true,
      data: {
        paddle_color_left: null,
        paddle_color_right: null,
        ball_color: null,
        vehicle_color_left: null,
        vehicle_color_right: null,
        trail_color_left: null,
        trail_color_right: null,
        field_color: null,
        text_color: null,
        border_color: null,
        card_border_color: null,
        winning_score: null,
        powerups_enabled: false,
        countdown_delay: 3
      }
    });
  }
}
