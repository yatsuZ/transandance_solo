/**
 * Configuration globale du jeu Pong
 * Centralise toutes les constantes et valeurs "magiques"
 */

// ========================================
// DIMENSIONS DU TERRAIN
// ========================================

/**
 * Ratio du canvas (largeur/hauteur)
 * 16/9 = format cinématique (moins carré)
 * 4/3 = format classique (plus carré)
 * 3/2 = format intermédiaire
 */
export const FIELD_RATIO = 4 / 3;

/**
 * Épaisseur des bordures du terrain
 */
export const FIELD_BORDER_WIDTH = 2;

// ========================================
// PADDLE (RAQUETTE)
// ========================================

/**
 * Largeur de la paddle en pixels
 */
export const PADDLE_WIDTH = 10;

/**
 * Hauteur de la paddle (en fraction de la hauteur du terrain)
 * height = fieldHeight / PADDLE_HEIGHT_RATIO
 */
export const PADDLE_HEIGHT_RATIO = 7.5;

/**
 * Distance de la paddle par rapport au bord du terrain
 */
export const PADDLE_OFFSET = 20;

/**
 * Pente du trapèze de la paddle (0 = rectangle, 1 = triangle)
 */
export const PADDLE_SLOPE = 0.2;

/**
 * Vitesse de déplacement de la paddle
 */
export const PADDLE_SPEED = 20;

// ========================================
// BALL (BALLE)
// ========================================

/**
 * Rayon de la balle (en fraction de la hauteur du terrain)
 * radius = fieldHeight / BALL_RADIUS_RATIO
 */
export const BALL_RADIUS_RATIO = 56.375;

/**
 * Vitesse horizontale de la balle (en fraction de la hauteur du terrain)
 * speedX = fieldHeight / BALL_SPEED_X_RATIO
 */
export const BALL_SPEED_X_RATIO = 112.75;

/**
 * Vitesse verticale de la balle (en fraction de la hauteur du terrain)
 * speedY = fieldHeight / BALL_SPEED_Y_RATIO
 */
export const BALL_SPEED_Y_RATIO = 150.333;

// ========================================
// IA (INTELLIGENCE ARTIFICIELLE)
// ========================================

/**
 * Marge d'erreur minimale de l'IA (en pixels)
 */
export const AI_ERROR_MARGIN_MIN = 20;

/**
 * Multiplicateur pour la marge d'erreur de l'IA
 */
export const AI_ERROR_MULTIPLIER = 3;

/**
 * Diviseur pour calculer la plage d'erreur de l'IA
 * errorRange = paddleHeight / AI_ERROR_RANGE_DIVISOR
 */
export const AI_ERROR_RANGE_DIVISOR = 3;

// ========================================
// GAMEPLAY
// ========================================

/**
 * Score nécessaire pour gagner une partie
 */
export const WINNING_SCORE = 3;

/**
 * Délai avant de reset la balle après un point (en ms)
 */
export const BALL_RESET_DELAY = 1000;

// ========================================
// COULEURS
// ========================================

export const COLORS = {
  FIELD_BACKGROUND: "black",
  FIELD_BORDER: "white",
  BALL: "white",
  PADDLE_LEFT: "blue",
  PADDLE_RIGHT: "red",
} as const;
