/**
 * Configuration des raquettes (paddles)
 */

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
 * Vitesse de déplacement de la paddle (en fraction de la hauteur du terrain)
 * speed = fieldHeight / PADDLE_SPEED_RATIO
 * Valeur plus élevée = vitesse plus lente
 * Calibrée pour être légèrement plus lente que la balle (plus facile pour le joueur)
 */
export const PADDLE_SPEED_RATIO = 75;
