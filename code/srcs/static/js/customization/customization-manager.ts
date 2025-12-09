/**
 * CustomizationManager - Gestion de la page /custom
 */

import { CustomizationAPI, CustomizationConfig } from './customization-api.js';

export class CustomizationManager {
  private currentGame: 'pong' | 'tron' = 'pong';
  private pongConfig: CustomizationConfig | null = null;
  private tronConfig: CustomizationConfig | null = null;

  // Valeurs par défaut (synchronisées avec les vrais jeux) - HEXADÉCIMAL UNIQUEMENT
  private readonly DEFAULT_PONG: Partial<CustomizationConfig> = {
    paddle_color_left: '#0000FF',    // Bleu (joueur gauche - froid)
    paddle_color_right: '#FF0000',   // Rouge (joueur droit - chaud)
    ball_color: '#FFFFFF',           // Blanc
    field_color: '#000000',          // Noir
    text_color: '#00FF00',           // Vert néon
    border_color: '#FFFFFF',         // Blanc (bordure terrain)
    card_border_color: '#FFFFFF',    // Blanc (bordure cartes)
    winning_score: 11,
    powerups_enabled: false,
    countdown_delay: 3
  };

  private readonly DEFAULT_TRON: Partial<CustomizationConfig> = {
    vehicle_color_left: '#00FFFF',   // Cyan néon (joueur gauche - froid)
    vehicle_color_right: '#FF6600',  // Orange néon (joueur droit - chaud)
    trail_color_left: '#00FFFF',     // Cyan néon (traînée gauche)
    trail_color_right: '#FF6600',    // Orange néon (traînée droite)
    field_color: '#000000',          // Noir
    text_color: '#FFFFFF',           // Blanc
    border_color: '#111111',         // Gris très sombre (grille)
    card_border_color: '#FFFFFF',    // Blanc (bordure cartes)
    winning_score: 5,
    powerups_enabled: false,
    countdown_delay: 3
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Charger les configs des deux jeux
    await this.loadConfigs();

    // Attacher les event listeners
    this.attachEventListeners();

    // Déterminer quel onglet afficher selon l'URL
    const currentPath = window.location.pathname;

    if (currentPath === '/custom/tron') {
      this.switchTab('tron');
    } else {
      // /custom/pong (ou toute autre URL custom invalide) → afficher Pong
      this.switchTab('pong');
    }
  }

  private async loadConfigs() {
    try {
      this.pongConfig = await CustomizationAPI.getConfig('pong');
      this.tronConfig = await CustomizationAPI.getConfig('tron');
      // console.log('[CustomizationManager] Configs chargées');
    } catch (error) {
      console.error('❌ [Customization] Erreur lors du chargement des configs:', error);
      this.showMessage('Erreur de chargement', 'error');
    }
  }

  private attachEventListeners() {
    // Onglets
    document.getElementById('tab-pong')?.addEventListener('click', () => this.switchTab('pong'));
    document.getElementById('tab-tron')?.addEventListener('click', () => this.switchTab('tron'));

    // Écouter les changements d'URL (back/forward)
    window.addEventListener('popstate', () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/custom/tron') {
        this.switchTabWithoutPushState('tron');
      } else if (currentPath === '/custom/pong') {
        this.switchTabWithoutPushState('pong');
      }
      // /custom seul → géré par le système de navigation (404)
    });

    // Color Palettes - Délégation d'événements sur toutes les palettes
    document.querySelectorAll('.color-palette').forEach(palette => {
      palette.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('color-btn')) {
          this.handleColorSelection(target);
        }
      });
    });

    // Sliders Pong
    this.attachSliderListener('pong-winning-score', 'pong-score-value');
    this.attachSliderListener('pong-countdown-delay', 'pong-countdown-value');

    // Sliders Tron
    this.attachSliderListener('tron-winning-score', 'tron-score-value');
    this.attachSliderListener('tron-countdown-delay', 'tron-countdown-value');

    // Boutons Pong
    document.getElementById('pong-btn-default')?.addEventListener('click', () => this.resetToDefault('pong'));
    document.getElementById('pong-btn-save')?.addEventListener('click', () => this.saveConfig('pong'));
    document.getElementById('pong-btn-preview')?.addEventListener('click', () => this.goToPreview('pong'));

    // Boutons Tron
    document.getElementById('tron-btn-default')?.addEventListener('click', () => this.resetToDefault('tron'));
    document.getElementById('tron-btn-save')?.addEventListener('click', () => this.saveConfig('tron'));
    document.getElementById('tron-btn-preview')?.addEventListener('click', () => this.goToPreview('tron'));
  }

  private attachSliderListener(sliderId: string, valueId: string) {
    const slider = document.getElementById(sliderId) as HTMLInputElement;
    const valueDisplay = document.getElementById(valueId);

    if (slider && valueDisplay) {
      slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;
      });
    }
  }

  /**
   * Gère la sélection d'une couleur dans une palette
   */
  private handleColorSelection(button: HTMLElement) {
    const color = button.getAttribute('data-color');
    if (!color) return;

    // Trouver la palette parente
    const palette = button.closest('.color-palette');
    if (!palette) return;

    // Enlever "selected" de tous les boutons de cette palette
    palette.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Ajouter "selected" au bouton cliqué
    button.classList.add('selected');

    // Trouver l'input hidden associé (juste avant la palette)
    const hiddenInput = palette.previousElementSibling as HTMLInputElement;
    if (hiddenInput && hiddenInput.tagName === 'INPUT' && hiddenInput.type === 'hidden') {
      hiddenInput.value = color;
      console.log(`🎨 [Customization] ${hiddenInput.id} = ${color}`);
    }
  }

  private switchTab(game: 'pong' | 'tron') {
    this.currentGame = game;

    console.log(`🎮 [Customization] Switch vers ${game.toUpperCase()}`);

    // Changer la classe active des onglets (boutons) - SANS JAMAIS TOUCHER À 'hidden'
    const tabPong = document.getElementById('tab-pong');
    const tabTron = document.getElementById('tab-tron');

    if (tabPong && tabTron) {
      // Enlever active des deux
      tabPong.classList.remove('active');
      tabTron.classList.remove('active');

      // S'assurer qu'il n'y a PAS de classe hidden (ne devrait jamais y être)
      tabPong.classList.remove('hidden');
      tabTron.classList.remove('hidden');

      // Ajouter active au bon onglet
      if (game === 'pong') {
        tabPong.classList.add('active');
      } else {
        tabTron.classList.add('active');
      }

      console.log(`[Customization] Classes PONG:`, tabPong.className);
      console.log(`[Customization] Classes TRON:`, tabTron.className);
    }

    // Cacher tous les contenus, puis afficher uniquement celui sélectionné
    document.querySelectorAll('.custom-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`custom-${game}`)?.classList.add('active');

    // Mettre à jour l'URL (sans recharger la page)
    const newUrl = `/custom/${game}`;
    if (window.location.pathname !== newUrl) {
      window.history.pushState({ page: `custom-${game}` }, '', newUrl);
    }

    // Appliquer la config au bon formulaire
    this.applyConfigToUI(game);
  }

  /**
   * Switch vers un onglet sans modifier l'historique (pour popstate)
   */
  private switchTabWithoutPushState(game: 'pong' | 'tron') {
    this.currentGame = game;

    console.log(`🎮 [Customization] Switch vers ${game.toUpperCase()} (popstate)`);

    // Changer la classe active des onglets (boutons) - SANS JAMAIS TOUCHER À 'hidden'
    const tabPong = document.getElementById('tab-pong');
    const tabTron = document.getElementById('tab-tron');

    if (tabPong && tabTron) {
      // Enlever active des deux
      tabPong.classList.remove('active');
      tabTron.classList.remove('active');

      // S'assurer qu'il n'y a PAS de classe hidden
      tabPong.classList.remove('hidden');
      tabTron.classList.remove('hidden');

      // Ajouter active au bon onglet
      if (game === 'pong') {
        tabPong.classList.add('active');
      } else {
        tabTron.classList.add('active');
      }
    }

    // Cacher tous les contenus, puis afficher uniquement celui sélectionné
    document.querySelectorAll('.custom-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`custom-${game}`)?.classList.add('active');

    // Appliquer la config au bon formulaire
    this.applyConfigToUI(game);
  }

  private applyConfigToUI(game: 'pong' | 'tron') {
    const config = game === 'pong' ? this.pongConfig : this.tronConfig;
    if (!config) return;

    if (game === 'pong') {
      // Appliquer les couleurs (hidden inputs + sélection visuelle)
      this.selectColorInPalette('pong-paddle-left-color', config.paddle_color_left || '#0000FF');
      this.selectColorInPalette('pong-paddle-right-color', config.paddle_color_right || '#FF0000');
      this.selectColorInPalette('pong-ball-color', config.ball_color || '#FFFFFF');
      this.selectColorInPalette('pong-field-color', config.field_color || '#000000');
      this.selectColorInPalette('pong-text-color', config.text_color || '#00FF00');
      this.selectColorInPalette('pong-border-color', config.border_color || '#FFFFFF');
      this.selectColorInPalette('pong-card-border-color', config.card_border_color || '#FFFFFF');

      // Sliders et valeurs
      this.setInputValue('pong-winning-score', (config.winning_score || 11).toString());
      this.setInputValue('pong-countdown-delay', config.countdown_delay.toString());
      (document.getElementById('pong-powerups') as HTMLInputElement).checked = config.powerups_enabled;

      // Mettre à jour les affichages de valeurs
      document.getElementById('pong-score-value')!.textContent = (config.winning_score || 11).toString();
      document.getElementById('pong-countdown-value')!.textContent = config.countdown_delay.toString();
    } else {
      // Appliquer les couleurs (hidden inputs + sélection visuelle)
      this.selectColorInPalette('tron-vehicle-left-color', config.vehicle_color_left || '#00FFFF');
      this.selectColorInPalette('tron-vehicle-right-color', config.vehicle_color_right || '#FF6600');
      this.selectColorInPalette('tron-trail-left-color', config.trail_color_left || '#00FFFF');
      this.selectColorInPalette('tron-trail-right-color', config.trail_color_right || '#FF6600');
      this.selectColorInPalette('tron-field-color', config.field_color || '#000000');
      this.selectColorInPalette('tron-text-color', config.text_color || '#FFFFFF');
      this.selectColorInPalette('tron-border-color', config.border_color || '#111111');
      this.selectColorInPalette('tron-card-border-color', config.card_border_color || '#FFFFFF');

      // Sliders et valeurs
      this.setInputValue('tron-winning-score', (config.winning_score || 5).toString());
      this.setInputValue('tron-countdown-delay', config.countdown_delay.toString());
      (document.getElementById('tron-powerups') as HTMLInputElement).checked = config.powerups_enabled;

      // Mettre à jour les affichages de valeurs
      document.getElementById('tron-score-value')!.textContent = (config.winning_score || 5).toString();
      document.getElementById('tron-countdown-value')!.textContent = config.countdown_delay.toString();
    }
  }

  /**
   * Sélectionne visuellement un bouton de couleur dans sa palette
   */
  private selectColorInPalette(inputId: string, color: string) {
    const hiddenInput = document.getElementById(inputId) as HTMLInputElement;
    if (!hiddenInput) return;

    // Mettre à jour la valeur du hidden input
    hiddenInput.value = color;

    // Trouver la palette associée (juste après le hidden input)
    const palette = hiddenInput.nextElementSibling;
    if (!palette || !palette.classList.contains('color-palette')) return;

    // Enlever "selected" de tous les boutons
    palette.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Trouver et sélectionner le bouton avec la bonne couleur
    const targetButton = palette.querySelector(`.color-btn[data-color="${color}"]`);
    if (targetButton) {
      targetButton.classList.add('selected');
    }
  }

  private setInputValue(id: string, value: string) {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) input.value = value;
  }

  private getInputValue(id: string): string {
    const input = document.getElementById(id) as HTMLInputElement;
    return input ? input.value : '';
  }

  private async resetToDefault(game: 'pong' | 'tron') {
    try {
      // Supprimer la config (retour aux valeurs par défaut)
      await CustomizationAPI.deleteConfig(game);

      // Recharger la config
      if (game === 'pong') {
        this.pongConfig = await CustomizationAPI.getConfig('pong');
      } else {
        this.tronConfig = await CustomizationAPI.getConfig('tron');
      }

      // Appliquer à l'UI
      this.applyConfigToUI(game);

      this.showMessage('✅ Configuration réinitialisée', 'success');
    } catch (error) {
      console.error('❌ [Customization] Erreur lors de la réinitialisation:', error);
      this.showMessage('❌ Erreur lors de la réinitialisation', 'error');
    }
  }

  private async saveConfig(game: 'pong' | 'tron') {
    try {
      let config: Partial<CustomizationConfig>;

      if (game === 'pong') {
        config = {
          paddle_color_left: this.getInputValue('pong-paddle-left-color'),
          paddle_color_right: this.getInputValue('pong-paddle-right-color'),
          ball_color: this.getInputValue('pong-ball-color'),
          field_color: this.getInputValue('pong-field-color'),
          text_color: this.getInputValue('pong-text-color'),
          border_color: this.getInputValue('pong-border-color'),
          card_border_color: this.getInputValue('pong-card-border-color'),
          winning_score: parseInt(this.getInputValue('pong-winning-score')),
          countdown_delay: parseInt(this.getInputValue('pong-countdown-delay')),
          powerups_enabled: (document.getElementById('pong-powerups') as HTMLInputElement).checked
        };
      } else {
        config = {
          vehicle_color_left: this.getInputValue('tron-vehicle-left-color'),
          vehicle_color_right: this.getInputValue('tron-vehicle-right-color'),
          trail_color_left: this.getInputValue('tron-trail-left-color'),
          trail_color_right: this.getInputValue('tron-trail-right-color'),
          field_color: this.getInputValue('tron-field-color'),
          text_color: this.getInputValue('tron-text-color'),
          border_color: this.getInputValue('tron-border-color'),
          card_border_color: this.getInputValue('tron-card-border-color'),
          winning_score: parseInt(this.getInputValue('tron-winning-score')),
          countdown_delay: parseInt(this.getInputValue('tron-countdown-delay')),
          powerups_enabled: (document.getElementById('tron-powerups') as HTMLInputElement).checked
        };
      }

      console.log(`📤 [Customization] Envoi PUT /api/customization/${game}:`, config);

      // Sauvegarder
      const savedConfig = await CustomizationAPI.saveConfig(game, config);

      console.log(`📥 [Customization] Réponse du serveur:`, savedConfig);

      // Mettre à jour la config locale
      if (game === 'pong') {
        this.pongConfig = savedConfig;
      } else {
        this.tronConfig = savedConfig;
      }

      this.showMessage('✅ Configuration sauvegardée', 'success');
    } catch (error) {
      console.error('❌ [Customization] Erreur lors de la sauvegarde:', error);
      this.showMessage('❌ Erreur lors de la sauvegarde', 'error');
    }
  }

  private goToPreview(game: 'pong' | 'tron') {
    // TODO: Implémenter la navigation vers /custom/exemple/pong ou /custom/exemple/tron
    console.log(`🎮 [Customization] Preview ${game} - À implémenter`);
    this.showMessage(`Preview ${game} - À implémenter`, 'success');
  }

  private showMessage(text: string, type: 'success' | 'error') {
    const messageEl = document.getElementById('custom-message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `custom-message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 2000);
  }
}
