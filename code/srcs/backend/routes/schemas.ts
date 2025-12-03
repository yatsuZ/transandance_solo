/**
 * Schémas JSON réutilisables pour la validation Fastify
 * Source de vérité unique basée sur les interfaces dans core/db/models/
 * Les propriétés sont réutilisées partout pour éviter la duplication
 */

// ==================== Schémas d'entités complètes (définis en premier pour réutilisation) ====================

/**
 * Schéma User complet basé sur l'interface User dans models/User.ts
 */
export const userSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer', description: 'ID unique de l\'utilisateur' },
    username: { type: 'string', minLength: 1, maxLength: 50, description: 'Nom d\'utilisateur unique' },
    email: { type: ['string', 'null'], format: 'email', description: 'Adresse email de l\'utilisateur' },
    avatar_url: { type: 'string', description: 'URL de l\'avatar de l\'utilisateur' },
    wins: { type: 'integer', description: 'Nombre de victoires' },
    losses: { type: 'integer', description: 'Nombre de défaites' },
    total_goals_scored: { type: 'integer', description: 'Total de buts marqués' },
    total_goals_conceded: { type: 'integer', description: 'Total de buts encaissés' },
    total_matches: { type: 'integer', description: 'Nombre total de matchs joués' },
    tournaments_played: { type: 'integer', description: 'Nombre de tournois joués' },
    tournaments_won: { type: 'integer', description: 'Nombre de tournois gagnés' },
    friend_count: { type: 'integer', description: 'Nombre d\'amis' },
    controls: { type: 'string', description: 'Contrôles clavier (JSON)' },
    created_at: { type: 'string', format: 'date-time', description: 'Date de création du compte' },
    updated_at: { type: 'string', format: 'date-time', description: 'Date de dernière modification' }
  }
} as const;

/**
 * Schéma Match complet basé sur l'interface Match dans models/Match.ts
 */
export const matchSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer', description: 'ID unique du match' },
    player_left_id: { type: ['integer', 'null'], description: 'ID du joueur gauche (null pour IA ou invité)' },
    player_left_name: { type: 'string', minLength: 1, maxLength: 50, description: 'Nom du joueur gauche' },
    is_bot_left: { type: 'integer', enum: [0, 1], description: '1 si bot, 0 sinon' },
    score_left: { type: 'integer', minimum: 0, description: 'Score du joueur gauche' },
    player_right_id: { type: ['integer', 'null'], description: 'ID du joueur droit (null pour IA ou invité)' },
    player_right_name: { type: 'string', minLength: 1, maxLength: 50, description: 'Nom du joueur droit' },
    is_bot_right: { type: 'integer', enum: [0, 1], description: '1 si bot, 0 sinon' },
    score_right: { type: 'integer', minimum: 0, description: 'Score du joueur droit' },
    winner_id: { type: ['integer', 'null'], description: 'ID du vainqueur (null si pas de vainqueur)' },
    winner_name: { type: ['string', 'null'], description: 'Nom du vainqueur (null si pas de vainqueur)' },
    status: { type: 'string', enum: ['in_progress', 'completed', 'leave'], description: 'Statut du match' },
    game_type: { type: 'string', enum: ['pong', 'tron'], description: 'Type de jeu' },
    start_at: { type: 'string', format: 'date-time', description: 'Date de début du match' },
    end_at: { type: ['string', 'null'], format: 'date-time', description: 'Date de fin du match (null si en cours)' }
  }
} as const;

// ==================== Schémas de paramètres communs (réutilisent les propriétés ci-dessus) ====================

export const idParamSchema = {
  type: 'object' as const,
  required: ['id'],
  properties: {
    id: { type: 'integer', minimum: 1, description: 'ID numérique' }
  }
};

export const usernameParamSchema = {
  type: 'object' as const,
  required: ['username'],
  properties: { username: userSchema.properties.username }
};

export const statusParamSchema = {
  type: 'object' as const,
  required: ['status'],
  properties: { status: matchSchema.properties.status }
};

export const limitQuerySchema = {
  type: 'object' as const,
  properties: {
    limit: { type: 'integer', minimum: 1, description: 'Nombre maximum d\'éléments à retourner (optionnel)' }
  }
};

// ==================== Schémas Tournament ====================

/**
 * Schéma Tournament complet
 */
export const tournamentSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer', description: 'ID unique du tournoi' },
    manager_id: { type: 'integer', description: 'ID du gestionnaire du tournoi' },
    winner_participant_id: { type: ['integer', 'null'], description: 'ID du participant vainqueur' },
    nbr_of_matches: { type: 'integer', minimum: 1, description: 'Nombre total de matches du tournoi' },
    matches_remaining: { type: 'integer', minimum: 0, description: 'Nombre de matches restants' },
    status: { type: 'string', enum: ['in_progress', 'completed', 'leave'], description: 'Statut du tournoi' },
    created_at: { type: 'string', format: 'date-time', description: 'Date de création' },
    end_at: { type: ['string', 'null'], format: 'date-time', description: 'Date de fin' }
  }
} as const;

/**
 * Schéma TournamentParticipant complet
 */
export const tournamentParticipantSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer', description: 'ID unique du participant' },
    tournament_id: { type: 'integer', description: 'ID du tournoi' },
    user_id: { type: ['integer', 'null'], description: 'ID de l\'utilisateur (null pour bot/guest)' },
    display_name: { type: 'string', minLength: 1, maxLength: 50, description: 'Nom affiché du participant' },
    placement: { type: ['integer', 'null'], description: 'Placement final dans le tournoi' },
    is_bot: { type: 'boolean', description: 'Si le participant est un bot' },
    is_eliminated: { type: 'boolean', description: 'Si le participant est éliminé' }
  }
} as const;

/**
 * Schéma TournamentMatch complet
 */
export const tournamentMatchSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer', description: 'ID unique' },
    tournament_id: { type: 'integer', description: 'ID du tournoi' },
    match_id: { type: 'integer', description: 'ID du match' },
    match_index: { type: 'integer', description: 'Index du match dans le tournoi' },
    round: { type: 'string', description: 'Round du match (ex: final, semi-final-1)' }
  }
} as const;
