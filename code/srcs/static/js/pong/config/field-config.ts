/**
 * Configuration des dimensions du terrain
 */

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
