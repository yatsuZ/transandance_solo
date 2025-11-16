type ControlKeys = {
  up: string;
  down: string;
};

type PlayerSide = "L" | "R" | "L2" | "R2";

export class InputHandler {
  public upPressed = false;
  public downPressed = false;
  private keys: ControlKeys;

  // Handlers stockés pour pouvoir les retirer
  private keyDownHandler = (e: KeyboardEvent) => this.handleKey(e, true);
  private keyUpHandler = (e: KeyboardEvent) => this.handleKey(e, false);

  constructor(side: PlayerSide) {
    this.keys = this.getDefaultKeys(side);

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  /**
   * Nettoie les event listeners clavier
   * IMPORTANT : Appeler cette méthode quand le joueur est détruit
   */
  public cleanup(): void {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    console.log("🧹 Input handlers nettoyés");
  }

  private handleKey(e: KeyboardEvent, isPressed: boolean) {
    if (e.key === this.keys.up) this.upPressed = isPressed;
    if (e.key === this.keys.down) this.downPressed = isPressed;
  }

  private getDefaultKeys(side: PlayerSide): ControlKeys {
    switch (side) {
      case "R":
        return { up: "ArrowUp", down: "ArrowDown" };
      case "L":
        return { up: "w", down: "s" };
      case "R2":
        return { up: "i", down: "k" };
      case "L2":
        return { up: "q", down: "a" };
      default:
        throw new Error(`Côté invalide : ${side}`);
    }
  }

  public setKeys(upKey: string, downKey: string) {
    this.keys = { up: upKey, down: downKey };
  }

  public getKeys(): ControlKeys {
    return this.keys;
  }

  public getDisplayKeys(): ControlKeys {
    const map: Record<string, string> = {
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
    };

    return {
      up: map[this.keys.up] || this.keys.up,
      down: map[this.keys.down] || this.keys.down,
    };
  }
}
