import { FIELD_RATIO, FIELD_BORDER_WIDTH, COLORS } from "../game-config.js";

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

    // On initialise et on met en place le resize
    const maxWidth = this.parent.clientWidth;
    const maxHeight = this.parent.clientHeight;

    let width = maxWidth;
    let height = width / this.RATIO;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.RATIO;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    this.width = width;
    this.height = height;
    window.addEventListener("resize", () => this.resize());
  }

  /**
   * Redimensionne le canvas en gardant le ratio 4/3,
   * et en s'adaptant à la taille de son conteneur parent.
   */
  resize() {
    const maxWidth = this.parent.clientWidth;
    const maxHeight = this.parent.clientHeight;

    let width = maxWidth;
    let height = width / this.RATIO;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.RATIO;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    this.width = width;
    this.height = height;
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
