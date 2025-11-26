import {
  FIELD_RATIO,
  FIELD_BORDER_WIDTH,
  FIELD_MIN_WIDTH,
  FIELD_MIN_HEIGHT,
  FIELD_MAX_WIDTH,
  FIELD_MAX_HEIGHT,
  COLORS
} from "../game-config.js";

export class Field {
  public width: number;
  public height: number;
  private canvas: HTMLCanvasElement;
  private parent: HTMLElement;
  private readonly RATIO = FIELD_RATIO;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.parent = canvas.parentElement as HTMLElement;

    if (!this.parent) throw new Error("Canvas parent element not found");

    // Calcul des dimensions initiales avec contraintes min/max
    const dimensions = this.calculateDimensions();

    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    this.width = dimensions.width;
    this.height = dimensions.height;

    window.addEventListener("resize", () => this.resize());
  }

  /**
   * Calcule les dimensions optimales du canvas en respectant :
   * - Le ratio FIELD_RATIO (4/3)
   * - Les dimensions du conteneur parent
   * - Les limites min/max définies dans game-config.ts
   */
  private calculateDimensions(): { width: number; height: number } {
    const parentWidth = this.parent.clientWidth;
    const parentHeight = this.parent.clientHeight;

    let width = parentWidth;
    let height = width / this.RATIO;

    // Si la hauteur calculée dépasse le parent, on recalcule depuis la hauteur
    if (height > parentHeight) {
      height = parentHeight;
      width = height * this.RATIO;
    }

    // Application des contraintes min/max
    width = Math.max(FIELD_MIN_WIDTH, Math.min(width, FIELD_MAX_WIDTH));
    height = Math.max(FIELD_MIN_HEIGHT, Math.min(height, FIELD_MAX_HEIGHT));

    // Réajustement pour garantir le ratio exact après application des contraintes
    height = width / this.RATIO;

    return { width, height };
  }

  /**
   * Redimensionne le canvas en gardant le ratio 4/3,
   * et en s'adaptant à la taille de son conteneur parent.
   * Utilise les contraintes min/max définies dans game-config.ts
   */
  resize() {
    const dimensions = this.calculateDimensions();

    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  getDimensions() {
    return { width: this.width, height: this.height };
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 🎨 Fond noir
    ctx.fillStyle = COLORS.FIELD_BACKGROUND;
    ctx.fillRect(0, 0, this.width, this.height);

    // ⚪ Lignes blanches
    ctx.strokeStyle = COLORS.FIELD_BORDER;
    ctx.lineWidth = FIELD_BORDER_WIDTH;

    // Ligne centrale
    // ctx.beginPath();
    // ctx.moveTo(this.width / 2, 0);
    // ctx.lineTo(this.width / 2, this.height);
    // ctx.stroke();

    // Bordures
    ctx.strokeRect(0, 0, this.width, this.height);
  }
}
