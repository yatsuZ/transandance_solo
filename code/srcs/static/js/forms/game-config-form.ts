/**
 * Gestion du formulaire de configuration de match
 * - Checkbox "C'est moi" exclusive entre les deux joueurs
 * - Auto-remplissage du pseudo avec le username du user quand "C'est moi" est coché
 */

import { AuthManager } from '../auth/auth-manager.js';

export class GameConfigForm {
  private playerLeftInput: HTMLInputElement;
  private playerRightInput: HTMLInputElement;
  private playerLeftIsMeCheckbox: HTMLInputElement;
  private playerRightIsMeCheckbox: HTMLInputElement;
  private playerLeftTypeHuman: HTMLInputElement;
  private playerLeftTypeIA: HTMLInputElement;
  private playerRightTypeHuman: HTMLInputElement;
  private playerRightTypeIA: HTMLInputElement;

  constructor() {
    this.playerLeftInput = document.getElementById('playerLeft') as HTMLInputElement;
    this.playerRightInput = document.getElementById('playerRight') as HTMLInputElement;
    this.playerLeftIsMeCheckbox = document.getElementById('playerLeftIsMe') as HTMLInputElement;
    this.playerRightIsMeCheckbox = document.getElementById('playerRightIsMe') as HTMLInputElement;

    // Récupérer les radios type
    this.playerLeftTypeHuman = document.querySelector('input[name="playerLeftType"][value="human"]') as HTMLInputElement;
    this.playerLeftTypeIA = document.querySelector('input[name="playerLeftType"][value="ia"]') as HTMLInputElement;
    this.playerRightTypeHuman = document.querySelector('input[name="playerRightType"][value="human"]') as HTMLInputElement;
    this.playerRightTypeIA = document.querySelector('input[name="playerRightType"][value="ia"]') as HTMLInputElement;

    if (!this.playerLeftInput || !this.playerRightInput || !this.playerLeftIsMeCheckbox || !this.playerRightIsMeCheckbox) {
      console.log('⚠️ Éléments du formulaire game-config introuvables');
      return;
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Quand on coche "C'est moi" pour le joueur gauche
    this.playerLeftIsMeCheckbox.addEventListener('change', () => {
      if (this.playerLeftIsMeCheckbox.checked) {
        // Décocher l'autre et le reset complètement
        this.playerRightIsMeCheckbox.checked = false;
        this.playerRightInput.readOnly = false;
        this.playerRightInput.value = ''; // Vider l'input de l'autre
        this.playerRightTypeIA.disabled = false;

        // Remplir le pseudo avec le username du user et bloquer l'input
        const userData = AuthManager.getUserData();
        if (userData) {
          this.playerLeftInput.value = userData.username;
          this.playerLeftInput.readOnly = true;
        }

        // Forcer "Humain" et désactiver le choix IA
        this.playerLeftTypeHuman.checked = true;
        this.playerLeftTypeIA.disabled = true;
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
        // Décocher l'autre et le reset complètement
        this.playerLeftIsMeCheckbox.checked = false;
        this.playerLeftInput.readOnly = false;
        this.playerLeftInput.value = ''; // Vider l'input de l'autre
        this.playerLeftTypeIA.disabled = false;

        // Remplir le pseudo avec le username du user et bloquer l'input
        const userData = AuthManager.getUserData();
        if (userData) {
          this.playerRightInput.value = userData.username;
          this.playerRightInput.readOnly = true;
        }

        // Forcer "Humain" et désactiver le choix IA
        this.playerRightTypeHuman.checked = true;
        this.playerRightTypeIA.disabled = true;
      } else {
        // Débloquer l'input, vider le champ, et réactiver le choix IA
        this.playerRightInput.readOnly = false;
        this.playerRightInput.value = '';
        this.playerRightTypeIA.disabled = false;
      }
    });
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
