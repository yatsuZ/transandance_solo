/**
 * Configuration des couleurs pour le jeu Tron
 * Couleurs par défaut (peuvent être écrasées par la customization utilisateur)
 */

// Couleurs par défaut
const DEFAULT_COLORS = {
  VEHICLE_LEFT: '#00FFFF',
  VEHICLE_RIGHT: '#FF6600',
  TRAIL_LEFT: '#00FFFF',
  TRAIL_RIGHT: '#FF6600',
  HEAD_LEFT: '#FFFFFF',
  HEAD_RIGHT: '#FFFF00',
  FIELD: '#000',
  GRID: '#111',
  TEXT: '#FFFFFF',
  CARD_BORDER: 'white'
} as const;

// Couleurs actives (mutables - peuvent être changées par customization)
export const COLORS: {
  VEHICLE_LEFT: string;
  VEHICLE_RIGHT: string;
  TRAIL_LEFT: string;
  TRAIL_RIGHT: string;
  HEAD_LEFT: string;
  HEAD_RIGHT: string;
  FIELD: string;
  GRID: string;
  TEXT: string;
  CARD_BORDER: string;
} = {
  VEHICLE_LEFT: DEFAULT_COLORS.VEHICLE_LEFT,
  VEHICLE_RIGHT: DEFAULT_COLORS.VEHICLE_RIGHT,
  TRAIL_LEFT: DEFAULT_COLORS.TRAIL_LEFT,
  TRAIL_RIGHT: DEFAULT_COLORS.TRAIL_RIGHT,
  HEAD_LEFT: DEFAULT_COLORS.HEAD_LEFT,
  HEAD_RIGHT: DEFAULT_COLORS.HEAD_RIGHT,
  FIELD: DEFAULT_COLORS.FIELD,
  GRID: DEFAULT_COLORS.GRID,
  TEXT: DEFAULT_COLORS.TEXT,
  CARD_BORDER: DEFAULT_COLORS.CARD_BORDER
};

/**
 * Applique une customization (chargée depuis l'API)
 * @param custom - Customization à appliquer (null = valeurs par défaut)
 */
export function applyCustomization(custom: {
  vehicle_color_left?: string | null;
  vehicle_color_right?: string | null;
  trail_color_left?: string | null;
  trail_color_right?: string | null;
  field_color?: string | null;
  text_color?: string | null;
  border_color?: string | null;
  card_border_color?: string | null;
} | null) {
  if (!custom) {
    // Réinitialiser aux valeurs par défaut
    COLORS.VEHICLE_LEFT = DEFAULT_COLORS.VEHICLE_LEFT;
    COLORS.VEHICLE_RIGHT = DEFAULT_COLORS.VEHICLE_RIGHT;
    COLORS.TRAIL_LEFT = DEFAULT_COLORS.TRAIL_LEFT;
    COLORS.TRAIL_RIGHT = DEFAULT_COLORS.TRAIL_RIGHT;
    COLORS.HEAD_LEFT = DEFAULT_COLORS.HEAD_LEFT;
    COLORS.HEAD_RIGHT = DEFAULT_COLORS.HEAD_RIGHT;
    COLORS.FIELD = DEFAULT_COLORS.FIELD;
    COLORS.GRID = DEFAULT_COLORS.GRID;
    COLORS.TEXT = DEFAULT_COLORS.TEXT;
    COLORS.CARD_BORDER = DEFAULT_COLORS.CARD_BORDER;
    return;
  }

  // Appliquer les couleurs custom (ou garder les valeurs par défaut si null)
  COLORS.VEHICLE_LEFT = custom.vehicle_color_left || DEFAULT_COLORS.VEHICLE_LEFT;
  COLORS.VEHICLE_RIGHT = custom.vehicle_color_right || DEFAULT_COLORS.VEHICLE_RIGHT;
  COLORS.TRAIL_LEFT = custom.trail_color_left || DEFAULT_COLORS.TRAIL_LEFT;
  COLORS.TRAIL_RIGHT = custom.trail_color_right || DEFAULT_COLORS.TRAIL_RIGHT;
  COLORS.FIELD = custom.field_color || DEFAULT_COLORS.FIELD;
  COLORS.TEXT = custom.text_color || DEFAULT_COLORS.TEXT;
  COLORS.GRID = custom.border_color || DEFAULT_COLORS.GRID;
  COLORS.CARD_BORDER = custom.card_border_color || DEFAULT_COLORS.CARD_BORDER;

  // Les couleurs de tête utilisent les couleurs des véhicules pour plus de cohérence
  COLORS.HEAD_LEFT = custom.vehicle_color_left || DEFAULT_COLORS.HEAD_LEFT;
  COLORS.HEAD_RIGHT = custom.vehicle_color_right || DEFAULT_COLORS.HEAD_RIGHT;
}

// Exports pour compatibilité avec le code existant
export const PLAYER_LEFT_COLOR = COLORS.VEHICLE_LEFT;
export const PLAYER_RIGHT_COLOR = COLORS.VEHICLE_RIGHT;
export const PLAYER_LEFT_HEAD_COLOR = COLORS.HEAD_LEFT;
export const PLAYER_RIGHT_HEAD_COLOR = COLORS.HEAD_RIGHT;
export const BACKGROUND_COLOR = COLORS.FIELD;
export const GRID_COLOR = COLORS.GRID;
