/**
 * Gestion du formulaire de configuration de tournoi
 * - Checkbox "C'est moi" exclusive entre les 4 joueurs
 * - Le joueur peut quand même changer son pseudo (display_name)
 * - Gestion des sélecteurs de difficulté IA
 */

import { DOMElements } from '../../core/dom-elements.js';

export class TournamentForm {
  private isMeCheckboxes: HTMLInputElement[];
  private humanCheckboxes: HTMLInputElement[];
  private difficultyBlocks: HTMLElement[];
  private difficultySelects: HTMLSelectElement[];

  constructor(dO: DOMElements) {
    // ✅ TOUT depuis DOMElements maintenant !
    this.humanCheckboxes = Array.from(dO.tournamentElement.formIsHumanCheckbox);
    this.isMeCheckboxes = Array.from(dO.tournamentElement.formIsMeCheckbox);

    // Récupération des sélecteurs de difficulté IA depuis DOMElements
    this.difficultyBlocks = Array.from(dO.tournamentElement.playerDifficultyBlocks);
    this.difficultySelects = Array.from(dO.tournamentElement.playerDifficultySelects);

    if (this.isMeCheckboxes.some(cb => !cb) || this.humanCheckboxes.some(cb => !cb)) {
      console.error('⚠️ Éléments du formulaire tournament introuvables');
      return;
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Pour chaque checkbox "C'est moi"
    this.isMeCheckboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          // Décocher tous les autres "C'est moi"
          this.isMeCheckboxes.forEach((otherCheckbox, otherIndex) => {
            if (otherIndex !== index) {
              otherCheckbox.checked = false;
            }
          });

          // Forcer "Humain" pour ce joueur
          this.humanCheckboxes[index].checked = true;

          // Masquer le sélecteur de difficulté IA
          if (this.difficultyBlocks[index]) {
            this.difficultyBlocks[index].style.display = 'none';
          }
        }
      });
    });

    // Pour chaque checkbox "Humain"
    this.humanCheckboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', () => {
        // Si on décoche "Humain" alors que "C'est moi" est coché, décocher "C'est moi"
        if (!checkbox.checked && this.isMeCheckboxes[index].checked) {
          this.isMeCheckboxes[index].checked = false;
        }

        // Afficher/masquer le sélecteur de difficulté IA
        if (this.difficultyBlocks[index]) {
          this.difficultyBlocks[index].style.display = checkbox.checked ? 'none' : 'block';
        }
      });
    });
  }

  /**
   * Retourne l'index du joueur qui est le user connecté (0-3, ou -1 si aucun)
   */
  public getAuthenticatedPlayerIndex(): number {
    for (let i = 0; i < this.isMeCheckboxes.length; i++) {
      if (this.isMeCheckboxes[i].checked) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Récupère la difficulté de l'IA pour un joueur donné (0-3)
   */
  public getAIDifficulty(playerIndex: number): string {
    if (playerIndex >= 0 && playerIndex < this.difficultySelects.length) {
      return this.difficultySelects[playerIndex]?.value || 'MEDIUM';
    }
    return 'MEDIUM';
  }
}
