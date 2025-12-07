/**
 * Configuration de l'intelligence artificielle
 */

/**
 * Configuration des niveaux de difficulté de l'IA
 * Tous les bots ont la MÊME VITESSE DE PADDLE (conforme au sujet)
 * La difficulté varie selon :
 * - Fréquence de vision (aiUpdateInterval)
 * - Précision de la prédiction (errorMargin)
 * - Temps de réaction (reactionDelay)
 */
export const AI_DIFFICULTY = {
  EASY: {
    label: 'Facile',
    botName: 'Rookie',           // Pseudo par défaut du bot
    description: 'Parfait pour débuter',
    aiUpdateInterval: 1500,      // Vision toutes les 1.5 secondes (lent)
    errorMargin: 60,             // Grande marge d'erreur (très imprécis)
    reactionDelay: 250,          // Délai de réaction: 250ms (lent à réagir)
  },
  MEDIUM: {
    label: 'Normal',
    botName: 'Challenger',
    description: 'Équilibré et fair-play',
    aiUpdateInterval: 1000,      // Vision toutes les 1 seconde (normal - conforme au sujet)
    errorMargin: 30,             // Marge d'erreur moyenne
    reactionDelay: 100,          // Délai de réaction: 100ms (normal)
  },
  HARD: {
    label: 'Difficile',
    botName: 'Champion',
    description: 'Un vrai challenge',
    aiUpdateInterval: 900,       // Vision toutes les 0.9 secondes (rapide)
    errorMargin: 15,             // Petite marge d'erreur (précis)
    reactionDelay: 50,           // Délai de réaction: 50ms (rapide)
  },
  EXPERT: {
    label: 'Expert',
    botName: 'Legend',
    description: 'Imbattable (presque)',
    aiUpdateInterval: 200,       // Vision toutes les 0.2 secondes (ultra rapide)
    errorMargin: 1,              // Marge d'erreur quasi-nulle (ultra précis)
    reactionDelay: 0,            // Pas de délai de réaction (instantané)
  }
} as const;

/**
 * Type pour les niveaux de difficulté disponibles
 */
export type AIDifficultyLevel = keyof typeof AI_DIFFICULTY;

/**
 * Cooldown entre chaque mise à jour de vision de l'IA (en millisecondes)
 * L'IA ne peut "voir" la position de la balle qu'une fois par seconde
 * ⚠️ DEPRECATED: Utiliser AI_DIFFICULTY[level].aiUpdateInterval à la place
 */
export const AI_UPDATE_COOLDOWN = 1000;

/**
 * Marge d'erreur minimale de l'IA (en pixels)
 * ⚠️ DEPRECATED: Utiliser AI_DIFFICULTY[level].errorMargin à la place
 */
export const AI_ERROR_MARGIN_MIN = 20;

/**
 * Multiplicateur pour la marge d'erreur de l'IA
 * ⚠️ DEPRECATED: Utiliser AI_DIFFICULTY[level].errorMargin à la place
 */
export const AI_ERROR_MULTIPLIER = 3;

/**
 * Diviseur pour calculer la plage d'erreur de l'IA
 * errorRange = paddleHeight / AI_ERROR_RANGE_DIVISOR
 * ⚠️ DEPRECATED: Utiliser AI_DIFFICULTY[level].errorMargin à la place
 */
export const AI_ERROR_RANGE_DIVISOR = 3;
