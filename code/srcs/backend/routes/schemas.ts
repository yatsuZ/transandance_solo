/**
 * Schémas Fastify réutilisables
 * Utilise la syntaxe JSON Schema standard
 */

// ==================== Schémas de paramètres communs ====================

export const idParamSchema = {
  type: 'object' as const,
  required: ['id'],
  properties: {
    id: {
      type: 'integer',
      minimum: 1,
      description: 'ID numérique'
    }
  }
};

export const limitQuerySchema = {
  type: 'object' as const,
  properties: {
    limit: {
      type: 'integer',
      minimum: 1,
      description: 'Nombre maximum d\'élé ments à retourner (optionnel, si absent = tout)'
    }
  }
};

// ==================== Schémas de données métier ====================

export const userSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    email: { type: 'string' },
    avatar_url: { type: ['string', 'null'] },
    wins: { type: 'integer' },
    losses: { type: 'integer' },
    draws: { type: 'integer' },
    total_score: { type: 'integer' },
    win_rate: { type: 'number' },
    created_at: { type: 'string' }
  }
};

export const matchSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' },
    player_left_id: { type: ['integer', 'null'] },
    player_left_name: { type: 'string' },
    player_right_id: { type: ['integer', 'null'] },
    player_right_name: { type: 'string' },
    score_left: { type: 'integer' },
    score_right: { type: 'integer' },
    winner_id: { type: ['integer', 'null'] },
    winner_name: { type: ['string', 'null'] },
    status: {
      type: 'string',
      enum: ['in_progress', 'completed', 'leave']
    },
    game_type: { type: 'string' },
    started_at: { type: 'string' },
    ended_at: { type: ['string', 'null'] }
  }
};
