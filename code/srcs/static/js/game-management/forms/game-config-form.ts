/**
 * Gestion du formulaire de configuration de match
 * - Checkbox "C'est moi" exclusive entre les deux joueurs
 * - Auto-remplissage du pseudo avec le username du user quand "C'est moi" est coché
 */

import { AuthManager } from '../../auth/auth-manager.js';
import { DOMElements } from '../../core/dom-elements.js';

// Mapping des noms de bots par difficulté (doit correspondre à game-config.ts)
const BOT_NAMES = {
  EASY: 'Rookie',
  MEDIUM: 'Challenger',
  HARD: 'Champion',
  EXPERT: 'Legend'
} as const;

export class GameConfigForm {
  private playerLeftInput: HTMLInputElement;
  private playerRightInput: HTMLInputElement;
  private playerLeftIsMeCheckbox: HTMLInputElement;
  private playerRightIsMeCheckbox: HTMLInputElement;
  private playerLeftTypeHuman: HTMLInputElement;
  private playerLeftTypeIA: HTMLInputElement;
  private playerRightTypeHuman: HTMLInputElement;
  private playerRightTypeIA: HTMLInputElement;

  // Nouveaux éléments pour la difficulté IA
  private playerLeftAIDifficultyBlock: HTMLElement | null;
  private playerRightAIDifficultyBlock: HTMLElement | null;
  private playerLeftDifficultySelect: HTMLSelectElement | null;
  private playerRightDifficultySelect: HTMLSelectElement | null;

  constructor(dO: DOMElements) {
    // ✅ TOUT depuis DOMElements maintenant !
    this.playerLeftInput = dO.gameConfigElement.inputFormulaireGameConfig_PlayerLeft;
    this.playerRightInput = dO.gameConfigElement.inputFormulaireGameConfig_PlayerRight;
    this.playerLeftIsMeCheckbox = dO.gameConfigElement.checkboxGameConfig_PlayerLeftIsMe;
    this.playerRightIsMeCheckbox = dO.gameConfigElement.checkboxGameConfig_PlayerRightIsMe;
    this.playerLeftTypeHuman = dO.gameConfigElement.radioGameConfig_PlayerLeftTypeHuman;
    this.playerLeftTypeIA = dO.gameConfigElement.radioGameConfig_PlayerLeftTypeIA;
    this.playerRightTypeHuman = dO.gameConfigElement.radioGameConfig_PlayerRightTypeHuman;
    this.playerRightTypeIA = dO.gameConfigElement.radioGameConfig_PlayerRightTypeIA;

    // Sélecteurs de difficulté IA depuis DOMElements
    this.playerLeftAIDifficultyBlock = dO.gameConfigElement.playerLeftAIDifficultyBlock;
    this.playerRightAIDifficultyBlock = dO.gameConfigElement.playerRightAIDifficultyBlock;
    this.playerLeftDifficultySelect = dO.gameConfigElement.playerLeftDifficultySelect;
    this.playerRightDifficultySelect = dO.gameConfigElement.playerRightDifficultySelect;

    if (!this.playerLeftInput || !this.playerRightInput || !this.playerLeftIsMeCheckbox || !this.playerRightIsMeCheckbox) {
      console.error('⚠️ Éléments du formulaire game-config introuvables');
      return;
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // ========================================
    // JOUEUR GAUCHE - Gestion Type (Humain/IA)
    // ========================================
    this.playerLeftTypeHuman.addEventListener('change', () => {
      if (this.playerLeftTypeHuman.checked) {
        // Masquer le sélecteur de difficulté
        if (this.playerLeftAIDifficultyBlock) {
          this.playerLeftAIDifficultyBlock.style.display = 'none';
        }
        // Vider le pseudo UNIQUEMENT si c'était un nom de bot
        const currentValue = this.playerLeftInput.value.trim();
        const isBotName = Object.values(BOT_NAMES).some(name =>
          currentValue === name || currentValue.startsWith(name + ' #')
        );
        if (isBotName) {
          this.playerLeftInput.value = '';
        }
      }
    });

    this.playerLeftTypeIA.addEventListener('change', () => {
      if (this.playerLeftTypeIA.checked) {
        // Afficher le sélecteur de difficulté
        if (this.playerLeftAIDifficultyBlock) {
          this.playerLeftAIDifficultyBlock.style.display = 'block';
        }
        // Pré-remplir avec le nom du bot selon la difficulté
        this.updateBotName('left');
      }
    });

    // Quand on change la difficulté, mettre à jour le nom du bot
    if (this.playerLeftDifficultySelect) {
      this.playerLeftDifficultySelect.addEventListener('change', () => {
        this.updateBotName('left');
      });
    }

    // ========================================
    // JOUEUR DROIT - Gestion Type (Humain/IA)
    // ========================================
    this.playerRightTypeHuman.addEventListener('change', () => {
      if (this.playerRightTypeHuman.checked) {
        // Masquer le sélecteur de difficulté
        if (this.playerRightAIDifficultyBlock) {
          this.playerRightAIDifficultyBlock.style.display = 'none';
        }
        // Vider le pseudo UNIQUEMENT si c'était un nom de bot
        const currentValue = this.playerRightInput.value.trim();
        const isBotName = Object.values(BOT_NAMES).some(name =>
          currentValue === name || currentValue.startsWith(name + ' #')
        );
        if (isBotName) {
          this.playerRightInput.value = '';
        }
      }
    });

    this.playerRightTypeIA.addEventListener('change', () => {
      if (this.playerRightTypeIA.checked) {
        // Afficher le sélecteur de difficulté
        if (this.playerRightAIDifficultyBlock) {
          this.playerRightAIDifficultyBlock.style.display = 'block';
        }
        // Pré-remplir avec le nom du bot selon la difficulté
        this.updateBotName('right');
      }
    });

    // Quand on change la difficulté, mettre à jour le nom du bot
    if (this.playerRightDifficultySelect) {
      this.playerRightDifficultySelect.addEventListener('change', () => {
        this.updateBotName('right');
      });
    }

    // ========================================
    // CHECKBOX "C'est moi"
    // ========================================
    // Quand on coche "C'est moi" pour le joueur gauche
    this.playerLeftIsMeCheckbox.addEventListener('change', () => {
      if (this.playerLeftIsMeCheckbox.checked) {
        // Décocher l'autre
        this.playerRightIsMeCheckbox.checked = false;
        this.playerRightInput.readOnly = false;
        this.playerRightTypeIA.disabled = false;

        // NE PAS vider l'input de l'autre joueur (conserver le nom du bot si présent)

        // Remplir le pseudo avec le username du user et bloquer l'input
        const userData = AuthManager.getUserData();
        if (userData) {
          this.playerLeftInput.value = userData.username;
          this.playerLeftInput.readOnly = true;
        }

        // Forcer "Humain" et désactiver le choix IA
        this.playerLeftTypeHuman.checked = true;
        this.playerLeftTypeIA.disabled = true;

        // Masquer le sélecteur de difficulté IA
        if (this.playerLeftAIDifficultyBlock) {
          this.playerLeftAIDifficultyBlock.style.display = 'none';
        }
      } else {
        // Débloquer l'input, vider le champ, et réactiver le choix IA
        this.playerLeftInput.readOnly = false;
        this.playerLeftInput.value = '';
        this.playerLeftTypeIA.disabled = false;
      }
    });

    // Quand on coche "C'est moi" pour le joueur droit
    this.playerRightIsMeCheckbox.addEventListener('change', () => {
      if (this.playerRightIsMeCheckbox.checked) {
        // Décocher l'autre
        this.playerLeftIsMeCheckbox.checked = false;
        this.playerLeftInput.readOnly = false;
        this.playerLeftTypeIA.disabled = false;

        // NE PAS vider l'input de l'autre joueur (conserver le nom du bot si présent)

        // Remplir le pseudo avec le username du user et bloquer l'input
        const userData = AuthManager.getUserData();
        if (userData) {
          this.playerRightInput.value = userData.username;
          this.playerRightInput.readOnly = true;
        }

        // Forcer "Humain" et désactiver le choix IA
        this.playerRightTypeHuman.checked = true;
        this.playerRightTypeIA.disabled = true;

        // Masquer le sélecteur de difficulté IA
        if (this.playerRightAIDifficultyBlock) {
          this.playerRightAIDifficultyBlock.style.display = 'none';
        }
      } else {
        // Débloquer l'input, vider le champ, et réactiver le choix IA
        this.playerRightInput.readOnly = false;
        this.playerRightInput.value = '';
        this.playerRightTypeIA.disabled = false;
      }
    });
  }

  /**
   * Met à jour le nom du bot dans l'input selon la difficulté choisie
   */
  private updateBotName(side: 'left' | 'right'): void {
    const input = side === 'left' ? this.playerLeftInput : this.playerRightInput;
    const select = side === 'left' ? this.playerLeftDifficultySelect : this.playerRightDifficultySelect;

    if (!select) return;

    const difficulty = select.value as keyof typeof BOT_NAMES;
    const botName = BOT_NAMES[difficulty] || 'Bot';

    // Pré-remplir le nom du bot (l'utilisateur peut le modifier s'il veut)
    input.value = botName;
  }

  /**
   * Récupère la difficulté de l'IA pour un joueur donné
   */
  public getAIDifficulty(side: 'left' | 'right'): string {
    const select = side === 'left' ? this.playerLeftDifficultySelect : this.playerRightDifficultySelect;
    return select?.value || 'MEDIUM';
  }

  /**
   * Retourne quel joueur est le user connecté (ou null)
   */
  public getAuthenticatedPlayerSide(): 'left' | 'right' | null {
    if (this.playerLeftIsMeCheckbox.checked) return 'left';
    if (this.playerRightIsMeCheckbox.checked) return 'right';
    return null;
  }
}
