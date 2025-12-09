import { uiPreferences } from "../../core/ui-preferences.js";

type ControlKeys = {
  up: string;
  down: string;
  dash: string;
};

type PlayerSide = "L" | "R" | "L2" | "R2";

export const DASH_DURATION = 200;
export const DASH_SPEED_MULTIPLIER = 3;
export const DASH_COOLDOWN = 1000;

export class InputHandler {
  public upPressed = false;
  public downPressed = false;
  private keys: ControlKeys;

  private isDashing = false;
  private dashCooldown = false;
  private dashDirection: 'up' | 'down' | null = null;
  private dashCooldownStartTime = 0;
  private dashKeyPressed = false;

  private keyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
  private keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);

  private powerupsEnabled = false;

  public onDashStart?: (direction: 'up' | 'down') => void;
  public onDashEnd?: () => void;
  public onCooldownEnd?: () => void;

  constructor(side: PlayerSide, powerupsEnabled: boolean = false) {
    this.keys = this.getCustomKeysOrDefault(side);
    this.powerupsEnabled = powerupsEnabled;

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  private getCustomKeysOrDefault(side: PlayerSide): ControlKeys {
    const controls = uiPreferences.getControls();
    const defaults = this.getDefaultKeys(side);

    switch (side) {
      case "L":
        return { up: controls.leftUp, down: controls.leftDown, dash: controls.leftLeft };
      case "R":
        return { up: controls.rightUp, down: controls.rightDown, dash: controls.rightRight };
      case "L2":
        return defaults;
      case "R2":
        return defaults;
    }
  }

  public cleanup(): void {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === this.keys.up) {
      this.upPressed = true;
    }
    if (e.key === this.keys.down) {
      this.downPressed = true;
    }
    if (e.key === this.keys.dash && this.powerupsEnabled && !this.dashKeyPressed) {
      this.dashKeyPressed = true;

      if (this.upPressed) {
        this.triggerDash('up');
      } else if (this.downPressed) {
        this.triggerDash('down');
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === this.keys.up) this.upPressed = false;
    if (e.key === this.keys.down) this.downPressed = false;
    if (e.key === this.keys.dash) this.dashKeyPressed = false;
  }

  public triggerDash(direction: 'up' | 'down'): void {
    if (this.isDashing || this.dashCooldown) return;

    this.isDashing = true;
    this.dashDirection = direction;
    this.dashCooldown = true;
    this.dashCooldownStartTime = Date.now();

    this.onDashStart?.(direction);

    setTimeout(() => {
      this.isDashing = false;
      this.dashDirection = null;
      this.onDashEnd?.();
    }, DASH_DURATION);

    setTimeout(() => {
      this.dashCooldown = false;
      this.onCooldownEnd?.();
    }, DASH_COOLDOWN);
  }

  public getCooldownProgress(): number {
    if (!this.dashCooldown) return 0;
    const elapsed = Date.now() - this.dashCooldownStartTime;
    return Math.max(0, 1 - elapsed / DASH_COOLDOWN);
  }

  public isOnCooldown(): boolean {
    return this.dashCooldown;
  }

  public arePowerupsEnabled(): boolean {
    return this.powerupsEnabled;
  }

  public getSpeedMultiplier(): number {
    return this.isDashing ? DASH_SPEED_MULTIPLIER : 1;
  }

  public getIsDashing(): boolean {
    return this.isDashing;
  }

  public setPowerupsEnabled(enabled: boolean): void {
    this.powerupsEnabled = enabled;
  }

  private getDefaultKeys(side: PlayerSide): ControlKeys {
    switch (side) {
      case "R":
        return { up: "ArrowUp", down: "ArrowDown", dash: "ArrowRight" };
      case "L":
        return { up: "w", down: "s", dash: "a" };
      case "R2":
        return { up: "i", down: "k", dash: "l" };
      case "L2":
        return { up: "q", down: "a", dash: "z" };
      default:
        throw new Error(`Cote invalide : ${side}`);
    }
  }

  public setKeys(upKey: string, downKey: string, dashKey?: string) {
    this.keys = { up: upKey, down: downKey, dash: dashKey || this.keys.dash };
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
      " ": "Espace",
      "Shift": "Shift",
    };

    return {
      up: map[this.keys.up] || this.keys.up,
      down: map[this.keys.down] || this.keys.down,
      dash: map[this.keys.dash] || this.keys.dash,
    };
  }

  public getDashKey(): string {
    const map: Record<string, string> = {
      " ": "Espace",
      "Shift": "Shift",
    };
    return map[this.keys.dash] || this.keys.dash;
  }
}
