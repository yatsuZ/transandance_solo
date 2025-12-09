/**
 * Configuration du gameplay
 */

/**
 * Valeurs par défaut du gameplay
 */
const DEFAULT_GAMEPLAY = {
  WINNING_SCORE: 3,
  BALL_RESET_DELAY: 1000,
  INITIAL_SPEED: 100,  // Pourcentage: 50-150%
  MAX_SPEED: 500       // Pourcentage: 100-600%
};

/**
 * Gameplay actif (mutable - peut être changé par customization)
 */
export const GAMEPLAY: {
  WINNING_SCORE: number;
  BALL_RESET_DELAY: number;
  INITIAL_SPEED: number;
  MAX_SPEED: number;
} = {
  WINNING_SCORE: DEFAULT_GAMEPLAY.WINNING_SCORE,
  BALL_RESET_DELAY: DEFAULT_GAMEPLAY.BALL_RESET_DELAY,
  INITIAL_SPEED: DEFAULT_GAMEPLAY.INITIAL_SPEED,
  MAX_SPEED: DEFAULT_GAMEPLAY.MAX_SPEED  // 500% par défaut
};

/**
 * Score nécessaire pour gagner une partie (alias pour compatibilité)
 */
export const WINNING_SCORE = DEFAULT_GAMEPLAY.WINNING_SCORE;

/**
 * Délai avant de reset la balle après un point (en ms)
 */
export const BALL_RESET_DELAY = DEFAULT_GAMEPLAY.BALL_RESET_DELAY;

/**
 * Applique une customization de gameplay
 * @param custom - Customization à appliquer (null = valeurs par défaut)
 */
export function applyGameplayCustomization(custom: {
  winning_score?: number | null;
  countdown_delay?: number | null;
  initial_speed?: number | null;
  max_speed?: number | null;
} | null) {
  if (!custom) {
    GAMEPLAY.WINNING_SCORE = DEFAULT_GAMEPLAY.WINNING_SCORE;
    GAMEPLAY.BALL_RESET_DELAY = DEFAULT_GAMEPLAY.BALL_RESET_DELAY;
    GAMEPLAY.INITIAL_SPEED = DEFAULT_GAMEPLAY.INITIAL_SPEED;
    GAMEPLAY.MAX_SPEED = DEFAULT_GAMEPLAY.MAX_SPEED;
    return;
  }

  GAMEPLAY.WINNING_SCORE = custom.winning_score ?? DEFAULT_GAMEPLAY.WINNING_SCORE;
  // countdown_delay est en secondes, BALL_RESET_DELAY en ms (0 = instantané)
  GAMEPLAY.BALL_RESET_DELAY = (custom.countdown_delay ?? 1) * 1000;
  // Vitesse en pourcentage (50-150% pour initial, 100-250% pour max)
  GAMEPLAY.INITIAL_SPEED = custom.initial_speed ?? DEFAULT_GAMEPLAY.INITIAL_SPEED;
  GAMEPLAY.MAX_SPEED = custom.max_speed ?? DEFAULT_GAMEPLAY.MAX_SPEED;
}
