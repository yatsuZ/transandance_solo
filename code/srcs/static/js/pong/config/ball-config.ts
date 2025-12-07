/**
 * Configuration de la balle
 */

/**
 * Rayon de la balle (en fraction de la hauteur du terrain)
 * radius = fieldHeight / BALL_RADIUS_RATIO
 * Valeur plus élevée = balle plus petite
 */
export const BALL_RADIUS_RATIO = 80;

/**
 * Vitesse horizontale de la balle (en fraction de la hauteur du terrain)
 * speedX = fieldHeight / BALL_SPEED_X_RATIO
 * Valeur plus élevée = vitesse plus lente
 */
export const BALL_SPEED_X_RATIO = 150;

/**
 * Vitesse verticale de la balle (en fraction de la hauteur du terrain)
 * speedY = fieldHeight / BALL_SPEED_Y_RATIO
 * Valeur plus élevée = vitesse plus lente
 */
export const BALL_SPEED_Y_RATIO = 100;

/**
 * Facteur d'accélération de la balle à chaque rebond
 * 1.10 = +10% de vitesse à chaque rebond (progression plus rapide)
 */
export const BALL_ACCELERATION_FACTOR = 1.10;

/**
 * Vitesse maximale de la balle (en multiple de la vitesse initiale)
 * 5.0 = 500% de la vitesse initiale (limite pour éviter les problèmes de gameplay et mémoire)
 * Note: La balle accélère de 10% à chaque rebond (BALL_ACCELERATION_FACTOR)
 * Avec 10% d'accélération par rebond, il faut ~17 rebonds pour atteindre 500%
 */
export const BALL_MAX_SPEED_MULTIPLIER = 5.0;

/**
 * Intensité de la variation d'angle selon l'impact sur la paddle
 * 0 = pas de variation, 1 = variation maximale
 */
export const BALL_ANGLE_VARIATION_INTENSITY = 0.7;
