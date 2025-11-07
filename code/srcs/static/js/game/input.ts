type ControlKeys = {
  up: string;
  down: string;
};

type PlayerSide = "L" | "R" | "L2" | "R2";

export class InputHandler {
  public upPressed = false;
  public downPressed = false;
  private keys: ControlKeys;

  constructor(side: PlayerSide) {
    this.keys = this.getDefaultKeys(side);

    window.addEventListener("keydown", (e) => this.handleKey(e, true));
    window.addEventListener("keyup", (e) => this.handleKey(e, false));
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
