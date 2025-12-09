/**
 * Configuration des couleurs du jeu
 * Couleurs par défaut (peuvent être écrasées par la customization utilisateur)
 */

// Couleurs par défaut
const DEFAULT_COLORS = {
  FIELD_BACKGROUND: "#000000",
  FIELD_BORDER: "white",
  BALL: "#FFFFFF",
  PADDLE_LEFT: "#0000FF",
  PADDLE_RIGHT: "#FF0000",
  TEXT: "#00FF00",
  CARD_BORDER: "white"
} as const;

// Couleurs actives (mutables - peuvent être changées par customization)
export const COLORS: {
  FIELD_BACKGROUND: string;
  FIELD_BORDER: string;
  BALL: string;
  PADDLE_LEFT: string;
  PADDLE_RIGHT: string;
  TEXT: string;
  CARD_BORDER: string;
} = {
  FIELD_BACKGROUND: DEFAULT_COLORS.FIELD_BACKGROUND,
  FIELD_BORDER: DEFAULT_COLORS.FIELD_BORDER,
  BALL: DEFAULT_COLORS.BALL,
  PADDLE_LEFT: DEFAULT_COLORS.PADDLE_LEFT,
  PADDLE_RIGHT: DEFAULT_COLORS.PADDLE_RIGHT,
  TEXT: DEFAULT_COLORS.TEXT,
  CARD_BORDER: DEFAULT_COLORS.CARD_BORDER
};

/**
 * Applique une customization (chargeé depuis l'API)
 * @param custom - Customization à appliquer (null = valeurs par défaut)
 */
export function applyCustomization(custom: {
  paddle_color_left?: string | null;
  paddle_color_right?: string | null;
  ball_color?: string | null;
  field_color?: string | null;
  text_color?: string | null;
  border_color?: string | null;
  card_border_color?: string | null;
} | null) {
  if (!custom) {
    // Réinitialiser aux valeurs par défaut
    COLORS.FIELD_BACKGROUND = DEFAULT_COLORS.FIELD_BACKGROUND;
    COLORS.FIELD_BORDER = DEFAULT_COLORS.FIELD_BORDER;
    COLORS.BALL = DEFAULT_COLORS.BALL;
    COLORS.PADDLE_LEFT = DEFAULT_COLORS.PADDLE_LEFT;
    COLORS.PADDLE_RIGHT = DEFAULT_COLORS.PADDLE_RIGHT;
    COLORS.TEXT = DEFAULT_COLORS.TEXT;
    COLORS.CARD_BORDER = DEFAULT_COLORS.CARD_BORDER;
    return;
  }

  // Appliquer les couleurs custom (ou garder les valeurs par défaut si null)
  COLORS.PADDLE_LEFT = custom.paddle_color_left || DEFAULT_COLORS.PADDLE_LEFT;
  COLORS.PADDLE_RIGHT = custom.paddle_color_right || DEFAULT_COLORS.PADDLE_RIGHT;
  COLORS.BALL = custom.ball_color || DEFAULT_COLORS.BALL;
  COLORS.FIELD_BACKGROUND = custom.field_color || DEFAULT_COLORS.FIELD_BACKGROUND;
  COLORS.TEXT = custom.text_color || DEFAULT_COLORS.TEXT;
  COLORS.FIELD_BORDER = custom.border_color || DEFAULT_COLORS.FIELD_BORDER;
  COLORS.CARD_BORDER = custom.card_border_color || DEFAULT_COLORS.CARD_BORDER;
}
