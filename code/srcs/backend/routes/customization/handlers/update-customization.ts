import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { gameCustomizationRepo, GameSpecificCustomization } from '../../../core/db/models/GameCustomization.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface UpdateCustomizationParams {
  game_type: 'pong' | 'tron';
}

interface UpdateCustomizationBody {
  paddle_color_left?: string;
  paddle_color_right?: string;
  ball_color?: string;
  vehicle_color_left?: string;
  vehicle_color_right?: string;
  trail_color_left?: string;
  trail_color_right?: string;
  field_color?: string;
  text_color?: string;
  border_color?: string;
  card_border_color?: string;
  winning_score?: number;
  powerups_enabled?: boolean;
  countdown_delay?: number;
}

type UpdateCustomizationResponse =
  | SuccessResponse<any>
  | ErrorResponse;

export const updateCustomizationSchema = {
  description: 'Crée ou met à jour la configuration de personnalisation d\'un jeu',
  tags: ['customization'],
  params: {
    type: 'object' as const,
    required: ['game_type'],
    properties: {
      game_type: { type: 'string', enum: ['pong', 'tron'] }
    }
  },
  body: {
    type: 'object' as const,
    properties: {
      paddle_color_left: { type: 'string' },
      paddle_color_right: { type: 'string' },
      ball_color: { type: 'string' },
      vehicle_color_left: { type: 'string' },
      vehicle_color_right: { type: 'string' },
      trail_color_left: { type: 'string' },
      trail_color_right: { type: 'string' },
      field_color: { type: 'string' },
      text_color: { type: 'string' },
      border_color: { type: 'string' },
      card_border_color: { type: 'string' },
      winning_score: { type: 'integer', minimum: 3, maximum: 21 },
      powerups_enabled: { type: 'boolean' },
      countdown_delay: { type: 'integer', minimum: 1, maximum: 5 }
    }
  },
  response: {
    200: {
      description: 'Configuration sauvegardée',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
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
    400: { description: 'Données invalides', ...errorResponseSchema },
    401: { description: 'Non authentifié', ...errorResponseSchema }
  }
} as const;

/**
 * Validation des couleurs hex
 */
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Handler: PUT /api/customization/:game_type
 * Crée ou met à jour la config de personnalisation
 *
 * @param game_type - Type de jeu ('pong' ou 'tron')
 * @param body - Données de personnalisation (partiel accepté)
 * @returns 200 - Configuration sauvegardée
 * @returns 400 - Données invalides
 * @returns 401 - Non authentifié
 */
export async function updateCustomization(
  request: FastifyRequest<{ Params: UpdateCustomizationParams; Body: UpdateCustomizationBody }>,
  reply: FastifyReply
): Promise<UpdateCustomizationResponse> {
  const { game_type } = request.params;
  const userId = request.user?.userId;

  if (!userId) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Non authentifié'
    });
  }

  const data = request.body;

  // Validation supplémentaire des couleurs (au cas où le schema Fastify ne suffit pas)
  const colorFields = [
    'paddle_color_left', 'paddle_color_right', 'ball_color',
    'vehicle_color_left', 'vehicle_color_right',
    'trail_color_left', 'trail_color_right',
    'field_color', 'text_color', 'border_color', 'card_border_color'
  ] as const;

  for (const field of colorFields) {
    if (data[field] && !isValidHex(data[field]!)) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: `Couleur invalide pour ${field} (format attendu: #RRGGBB)`
      });
    }
  }

  // Convertir powerups_enabled de boolean à 0/1 pour la BDD
  const dbData: GameSpecificCustomization = {
    ...data,
    powerups_enabled: data.powerups_enabled !== undefined ? (data.powerups_enabled ? 1 : 0) : undefined
  };

  // Upsert (create or update)
  const customization = gameCustomizationRepo.upsertCustomization(userId, game_type, dbData);

  return reply.code(StatusCodes.OK).send({
    success: true,
    message: 'Configuration sauvegardée avec succès',
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
}
