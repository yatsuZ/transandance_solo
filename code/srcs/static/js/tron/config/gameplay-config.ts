/**
 * Configuration du gameplay Tron
 */

/**
 * Valeurs par défaut du gameplay
 */
const DEFAULT_GAMEPLAY = {
  WINNING_SCORE: 3,
  ROUND_DELAY: 2000
};

/**
 * Gameplay actif (mutable - peut être changé par customization)
 */
export const GAMEPLAY: {
  WINNING_SCORE: number;
  ROUND_DELAY: number;
} = {
  WINNING_SCORE: DEFAULT_GAMEPLAY.WINNING_SCORE,
  ROUND_DELAY: DEFAULT_GAMEPLAY.ROUND_DELAY
};

// Nombre de rounds pour gagner un match (alias pour compatibilité)
export const WINNING_SCORE = DEFAULT_GAMEPLAY.WINNING_SCORE;

// Vitesse du jeu (ms entre chaque frame)
export const GAME_SPEED = 30; // Plus rapide !

// Taille d'une cellule de la grille (en pixels)
export const GRID_SIZE = 5; // Carrés plus fins !

// Délai entre les rounds (ms)
export const ROUND_DELAY = DEFAULT_GAMEPLAY.ROUND_DELAY;

// Accélération progressive
export const SPEED_INCREASE_INTERVAL = 3000; // Tous les 5 secondes (plus rapide !)
export const SPEED_INCREASE_RATE = 0.80; // Réduire de 15% (accélération plus forte !)
export const MIN_GAME_SPEED = 30; // Vitesse minimale

/**
 * Applique une customization de gameplay
 * @param custom - Customization à appliquer (null = valeurs par défaut)
 */
export function applyGameplayCustomization(custom: {
  winning_score?: number | null;
  countdown_delay?: number | null;
} | null) {
  if (!custom) {
    GAMEPLAY.WINNING_SCORE = DEFAULT_GAMEPLAY.WINNING_SCORE;
    GAMEPLAY.ROUND_DELAY = DEFAULT_GAMEPLAY.ROUND_DELAY;
    return;
  }

  GAMEPLAY.WINNING_SCORE = custom.winning_score ?? DEFAULT_GAMEPLAY.WINNING_SCORE;
  // countdown_delay est en secondes, ROUND_DELAY en ms (0 = instantané)
  GAMEPLAY.ROUND_DELAY = (custom.countdown_delay ?? 2) * 1000;
}
