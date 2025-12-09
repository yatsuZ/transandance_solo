/**
 * TwoFAManager - Gestion du 2FA dans les paramètres
 * Gère l'activation, désactivation et configuration du 2FA
 */

import { DOMElements } from '../core/dom-elements.js';

export class TwoFAManager {
  private _DO: DOMElements;
  private currentSecret: string | null = null;

  constructor(dO: DOMElements) {
    this._DO = dO;
  }

  /**
   * Initialise le statut 2FA et attache les événements
   */
  async init(): Promise<void> {
    try {
      const enabled = await this.checkStatus();
      this.updateUI(enabled);
      this.attachEvents();
    } catch (error) {
    }
  }

  /**
   * Vérifie si le 2FA est activé pour l'utilisateur
   */
  private async checkStatus(): Promise<boolean> {
    const response = await fetch('/api/auth/2fa/status', {
      credentials: 'include'
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.data.enabled;
  }

  /**
   * Génère le QR code pour configurer le 2FA
   */
  private async setupQRCode(): Promise<void> {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du QR code');
      }

      const result = await response.json();

      if (result.success && result.data) {
        this.currentSecret = result.data.secret;

        // Afficher le QR code
        this._DO.parametreElement.twofaQRCode.src = result.data.qrCode;

        // Afficher la section setup
        this.showSection('setup');
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      this.showError(this._DO.parametreElement.twofaSetupError, 'Erreur lors de la configuration');
    }
  }

  /**
   * Vérifie le code et active le 2FA
   */
  private async verifyAndActivate(code: string): Promise<void> {
    if (!code || code.length !== 6) {
      this.showError(this._DO.parametreElement.twofaSetupError, 'Le code doit contenir 6 chiffres');
      return;
    }

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: code })
      });

      const result = await response.json();

      if (result.success) {
        this._DO.parametreElement.twofaVerifyCode.value = '';
        this.showSection('enabled');
      } else {
        this.showError(this._DO.parametreElement.twofaSetupError, result.error || 'Code invalide');
      }
    } catch (error) {
      this.showError(this._DO.parametreElement.twofaSetupError, 'Erreur lors de la vérification');
    }
  }

  /**
   * Désactive le 2FA
   */
  private async disable(code: string): Promise<void> {
    if (!code || code.length !== 6) {
      this.showError(this._DO.parametreElement.twofaDisableError, 'Le code doit contenir 6 chiffres');
      return;
    }

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: code })
      });

      const result = await response.json();

      if (result.success) {
        this._DO.parametreElement.twofaDisableCode.value = '';
        this._DO.parametreElement.twofaDisableModal.style.display = 'none';
        this.showSection('disabled');
      } else {
        this.showError(this._DO.parametreElement.twofaDisableError, result.error || 'Code invalide');
      }
    } catch (error) {
      this.showError(this._DO.parametreElement.twofaDisableError, 'Erreur lors de la désactivation');
    }
  }

  /**
   * Met à jour l'UI selon le statut 2FA
   */
  private updateUI(enabled: boolean): void {
    this.showSection(enabled ? 'enabled' : 'disabled');
  }

  /**
   * Affiche une section spécifique
   */
  private showSection(section: 'disabled' | 'setup' | 'enabled'): void {
    // Cacher toutes les sections
    this._DO.parametreElement.twofaDisabled.style.display = 'none';
    this._DO.parametreElement.twofaSetup.style.display = 'none';
    this._DO.parametreElement.twofaEnabled.style.display = 'none';
    this._DO.parametreElement.twofaDisableModal.style.display = 'none';

    // Afficher la section demandée
    switch (section) {
      case 'disabled':
        this._DO.parametreElement.twofaDisabled.style.display = 'block';
        break;
      case 'setup':
        this._DO.parametreElement.twofaSetup.style.display = 'block';
        break;
      case 'enabled':
        this._DO.parametreElement.twofaEnabled.style.display = 'block';
        break;
    }
  }

  /**
   * Affiche un message d'erreur
   */
  private showError(element: HTMLElement, message: string): void {
    element.textContent = message;
    element.style.display = 'block';

    // Cacher après 5 secondes
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }

  /**
   * Attache tous les événements
   */
  private attachEvents(): void {
    // Bouton: Configurer le 2FA
    this._DO.parametreElement.btnSetup2FA.addEventListener('click', () => {
      this.setupQRCode();
    });

    // Bouton: Activer le 2FA
    this._DO.parametreElement.btnActivate2FA.addEventListener('click', () => {
      const code = this._DO.parametreElement.twofaVerifyCode.value.trim();
      this.verifyAndActivate(code);
    });

    // Bouton: Annuler setup
    this._DO.parametreElement.btnCancelSetup.addEventListener('click', () => {
      this._DO.parametreElement.twofaVerifyCode.value = '';
      this.showSection('disabled');
    });

    // Bouton: Désactiver le 2FA
    this._DO.parametreElement.btnDisable2FA.addEventListener('click', () => {
      this._DO.parametreElement.twofaDisableModal.style.display = 'block';
    });

    // Bouton: Confirmer désactivation
    this._DO.parametreElement.btnConfirmDisable.addEventListener('click', () => {
      const code = this._DO.parametreElement.twofaDisableCode.value.trim();
      this.disable(code);
    });

    // Bouton: Annuler désactivation
    this._DO.parametreElement.btnCancelDisable.addEventListener('click', () => {
      this._DO.parametreElement.twofaDisableCode.value = '';
      this._DO.parametreElement.twofaDisableModal.style.display = 'none';
    });

    // Enter key sur les inputs
    this._DO.parametreElement.twofaVerifyCode.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const code = this._DO.parametreElement.twofaVerifyCode.value.trim();
        this.verifyAndActivate(code);
      }
    });

    this._DO.parametreElement.twofaDisableCode.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const code = this._DO.parametreElement.twofaDisableCode.value.trim();
        this.disable(code);
      }
    });
  }
}
