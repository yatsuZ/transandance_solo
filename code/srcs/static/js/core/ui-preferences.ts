/**
 * UIPreferences - Gestion des préférences UI en mémoire (singleton)
 *
 * Stocke les préférences utilisateur (musique, contrôles) en RAM au lieu de localStorage
 *
 * ✅ Avantages :
 * - Pas de manipulation possible via console
 * - Nettoyé automatiquement à la fermeture du navigateur
 * - Données UI non sensibles, pas besoin de persistance longue durée
 */

export interface PlayerControls {
  leftUp: string;
  leftDown: string;
  leftLeft: string;
  leftRight: string;
  rightUp: string;
  rightDown: string;
  rightLeft: string;
  rightRight: string;
}

class UIPreferences {
  private static instance: UIPreferences;

  // Préférences musique
  private isPlaying: boolean = false;
  private musicVolume: number = 50; // 0-100

  // Préférences contrôles clavier
  private controls: PlayerControls = {
    leftUp: 'w',
    leftDown: 's',
    leftLeft: 'a',
    leftRight: 'd',
    rightUp: 'ArrowUp',
    rightDown: 'ArrowDown',
    rightLeft: 'ArrowLeft',
    rightRight: 'ArrowRight'
  };

  private constructor() {
    // Privé pour forcer l'utilisation du singleton
  }

  /**
   * Récupère l'instance unique
   */
  static getInstance(): UIPreferences {
    if (!UIPreferences.instance) {
      UIPreferences.instance = new UIPreferences();
    }
    return UIPreferences.instance;
  }

  //////////////////////////////////////////////////////////////////
  // MUSIQUE
  //////////////////////////////////////////////////////////////////

  /**
   * Définit l'état de lecture de la musique
   */
  setMusicPlaying(playing: boolean): void {
    this.isPlaying = playing;
    console.log(`🎵 [UIPreferences] Musique: ${playing ? 'EN MARCHE' : 'ARRÊTÉE'}`);
  }

  /**
   * Récupère l'état de lecture de la musique
   */
  isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Définit le volume de la musique (0-100)
   */
  setMusicVolume(volume: number): void {
    if (volume < 0 || volume > 100) {
      console.warn(`⚠️ [UIPreferences] Volume invalide: ${volume}, utilisation de 50`);
      this.musicVolume = 50;
      return;
    }
    this.musicVolume = volume;
    console.log(`🔊 [UIPreferences] Volume: ${volume}%`);
  }

  /**
   * Récupère le volume de la musique
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  //////////////////////////////////////////////////////////////////
  // CONTRÔLES CLAVIER
  //////////////////////////////////////////////////////////////////

  /**
   * Définit les contrôles clavier
   */
  setControls(controls: PlayerControls): void {
    this.controls = { ...controls };
    // console.log(`🎮 [UIPreferences] Contrôles mis à jour:`, this.controls);
  }

  /**
   * Récupère les contrôles clavier
   */
  getControls(): PlayerControls {
    return { ...this.controls };
  }

  //////////////////////////////////////////////////////////////////
  // RESET
  //////////////////////////////////////////////////////////////////

  /**
   * Réinitialise toutes les préférences aux valeurs par défaut
   */
  reset(): void {
    this.isPlaying = false;
    this.musicVolume = 50;
    this.controls = {
      leftUp: 'w',
      leftDown: 's',
      leftLeft: 'a',
      leftRight: 'd',
      rightUp: 'ArrowUp',
      rightDown: 'ArrowDown',
      rightLeft: 'ArrowLeft',
      rightRight: 'ArrowRight'
    };
    console.log('🔄 [UIPreferences] Préférences réinitialisées');
  }
}

// Export singleton
export const uiPreferences = UIPreferences.getInstance();
