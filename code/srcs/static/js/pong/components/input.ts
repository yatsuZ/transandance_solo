import { uiPreferences } from "../../core/ui-preferences.js";

type ControlKeys = {
  up: string;
  down: string;
  dash: string;  // Touche dédiée pour le dash
};

type PlayerSide = "L" | "R" | "L2" | "R2";

// Configuration du Dash (exportées pour l'UI et l'IA)
export const DASH_DURATION = 200; // ms de durée du dash
export const DASH_SPEED_MULTIPLIER = 3; // Multiplicateur de vitesse pendant le dash
export const DASH_COOLDOWN = 1000; // ms avant de pouvoir re-dash

export class InputHandler {
  public upPressed = false;
  public downPressed = false;
  private keys: ControlKeys;

  // Dash state
  private isDashing = false;
  private dashCooldown = false;
  private dashDirection: 'up' | 'down' | null = null;
  private dashCooldownStartTime = 0;
  private dashKeyPressed = false;  // Pour éviter le maintien de la touche

  // Handlers stockés pour pouvoir les retirer
  private keyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
  private keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);

  // Powerups activé
  private powerupsEnabled = false;

  // Callback pour notifier l'UI du dash
  public onDashStart?: (direction: 'up' | 'down') => void;
  public onDashEnd?: () => void;
  public onCooldownEnd?: () => void;

  constructor(side: PlayerSide, powerupsEnabled: boolean = false) {
    this.keys = this.getCustomKeysOrDefault(side);
    this.powerupsEnabled = powerupsEnabled;

    console.log(`[INPUT] InputHandler créé pour ${side} - powerups: ${powerupsEnabled ? 'ACTIVÉS' : 'désactivés'}, touche dash: ${this.keys.dash}`);

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  /**
   * Récupère les touches personnalisées depuis uiPreferences ou les valeurs par défaut
   * Le dash utilise la touche vers l'extérieur du terrain :
   * - Joueur gauche (L) : touche gauche (leftLeft)
   * - Joueur droit (R) : touche droite (rightRight)
   */
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

  /**
   * Nettoie les event listeners clavier
   * IMPORTANT : Appeler cette méthode quand le joueur est détruit
   */
  public cleanup(): void {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    console.log("🧹 Input handlers nettoyés");
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === this.keys.up) {
      this.upPressed = true;
    }
    if (e.key === this.keys.down) {
      this.downPressed = true;
    }
    // Touche dash dédiée - déclenche le dash dans la direction actuelle
    if (e.key === this.keys.dash && this.powerupsEnabled && !this.dashKeyPressed) {
      this.dashKeyPressed = true;  // Évite le spam en maintenant la touche

      // Dash dans la direction où on se déplace (ou up par défaut)
      if (this.upPressed) {
        this.triggerDash('up');
      } else if (this.downPressed) {
        this.triggerDash('down');
      }
      // Si aucune direction, on ne dash pas (il faut se déplacer)
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === this.keys.up) this.upPressed = false;
    if (e.key === this.keys.down) this.downPressed = false;
    if (e.key === this.keys.dash) this.dashKeyPressed = false;  // Reset pour permettre un nouveau dash
  }

  /**
   * Déclenche un dash dans la direction spécifiée
   * Peut être appelé publiquement (pour l'IA)
   */
  public triggerDash(direction: 'up' | 'down'): void {
    if (this.isDashing || this.dashCooldown) return;

    console.log(`[DASH] Dash déclenché vers ${direction} ! (x${DASH_SPEED_MULTIPLIER} pendant ${DASH_DURATION}ms)`);

    this.isDashing = true;
    this.dashDirection = direction;
    this.dashCooldown = true;
    this.dashCooldownStartTime = Date.now();

    // Notifier l'UI
    this.onDashStart?.(direction);

    // Fin du dash après DASH_DURATION
    setTimeout(() => {
      this.isDashing = false;
      this.dashDirection = null;
      this.onDashEnd?.();
    }, DASH_DURATION);

    // Cooldown avant de pouvoir re-dash
    setTimeout(() => {
      this.dashCooldown = false;
      this.onCooldownEnd?.();
    }, DASH_COOLDOWN);
  }

  /**
   * Retourne le pourcentage de cooldown restant (0 = prêt, 1 = vient de dash)
   */
  public getCooldownProgress(): number {
    if (!this.dashCooldown) return 0;
    const elapsed = Date.now() - this.dashCooldownStartTime;
    return Math.max(0, 1 - elapsed / DASH_COOLDOWN);
  }

  /**
   * Retourne true si le dash est en cooldown
   */
  public isOnCooldown(): boolean {
    return this.dashCooldown;
  }

  /**
   * Retourne true si les powerups sont activés
   */
  public arePowerupsEnabled(): boolean {
    return this.powerupsEnabled;
  }

  /**
   * Retourne le multiplicateur de vitesse actuel (1 normal, plus élevé si dash)
   */
  public getSpeedMultiplier(): number {
    return this.isDashing ? DASH_SPEED_MULTIPLIER : 1;
  }

  /**
   * Retourne true si le joueur est en train de dash
   */
  public getIsDashing(): boolean {
    return this.isDashing;
  }

  /**
   * Active ou désactive les powerups
   */
  public setPowerupsEnabled(enabled: boolean): void {
    this.powerupsEnabled = enabled;
  }

  private getDefaultKeys(side: PlayerSide): ControlKeys {
    switch (side) {
      case "R":
        return { up: "ArrowUp", down: "ArrowDown", dash: "ArrowRight" };  // Flèche droite pour dash (vers l'extérieur)
      case "L":
        return { up: "w", down: "s", dash: "a" };  // 'a' (gauche) pour dash joueur gauche (vers l'extérieur)
      case "R2":
        return { up: "i", down: "k", dash: "l" };  // 'l' (droite) pour dash
      case "L2":
        return { up: "q", down: "a", dash: "z" };  // 'z' pour dash
      default:
        throw new Error(`Côté invalide : ${side}`);
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

  /**
   * Retourne la touche de dash pour l'affichage
   */
  public getDashKey(): string {
    const map: Record<string, string> = {
      " ": "Espace",
      "Shift": "Shift",
    };
    return map[this.keys.dash] || this.keys.dash;
  }
}
