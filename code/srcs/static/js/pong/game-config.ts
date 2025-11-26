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
 * Largeur par défaut du terrain (en pixels)
 * Utilisé comme dimension de référence pour le canvas
 */
export const FIELD_DEFAULT_WIDTH = 1000;

/**
 * Hauteur par défaut du terrain (en pixels)
 * Calculé automatiquement selon FIELD_RATIO : 1000 / (4/3) = 750
 */
export const FIELD_DEFAULT_HEIGHT = FIELD_DEFAULT_WIDTH / FIELD_RATIO;

/**
 * Largeur minimale du terrain (en pixels)
 * En dessous de cette valeur, le jeu devient injouable
 */
export const FIELD_MIN_WIDTH = 400;

/**
 * Hauteur minimale du terrain (en pixels)
 * Calculé automatiquement selon FIELD_RATIO
 */
export const FIELD_MIN_HEIGHT = FIELD_MIN_WIDTH / FIELD_RATIO;

/**
 * Largeur maximale du terrain (en pixels)
 * Limite pour les très grands écrans
 */
export const FIELD_MAX_WIDTH = 1600;

/**
 * Hauteur maximale du terrain (en pixels)
 * Calculé automatiquement selon FIELD_RATIO
 */
export const FIELD_MAX_HEIGHT = FIELD_MAX_WIDTH / FIELD_RATIO;

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
 * Vitesse de déplacement de la paddle (en fraction de la hauteur du terrain)
 * speed = fieldHeight / PADDLE_SPEED_RATIO
 * Valeur plus élevée = vitesse plus lente
 * Calibrée pour être légèrement plus lente que la balle (plus facile pour le joueur)
 */
export const PADDLE_SPEED_RATIO = 75;

// ========================================
// BALL (BALLE)
// ========================================

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
 * 1.5 = maximum 150% de la vitesse de départ
 */
export const BALL_MAX_SPEED_MULTIPLIER = 1.5;

/**
 * Intensité de la variation d'angle selon l'impact sur la paddle
 * 0 = pas de variation, 1 = variation maximale
 */
export const BALL_ANGLE_VARIATION_INTENSITY = 0.7;

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
