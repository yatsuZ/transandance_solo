/**
 * Gestion du formulaire de configuration de tournoi
 * - Checkbox "C'est moi" exclusive entre les 4 joueurs
 * - Le joueur peut quand même changer son pseudo (display_name)
 */

export class TournamentForm {
  private isMeCheckboxes: HTMLInputElement[];
  private humanCheckboxes: HTMLInputElement[];

  constructor() {
    this.isMeCheckboxes = [
      document.getElementById('isMe1') as HTMLInputElement,
      document.getElementById('isMe2') as HTMLInputElement,
      document.getElementById('isMe3') as HTMLInputElement,
      document.getElementById('isMe4') as HTMLInputElement,
    ];

    this.humanCheckboxes = [
      document.getElementById('human1') as HTMLInputElement,
      document.getElementById('human2') as HTMLInputElement,
      document.getElementById('human3') as HTMLInputElement,
      document.getElementById('human4') as HTMLInputElement,
    ];

    if (this.isMeCheckboxes.some(cb => !cb) || this.humanCheckboxes.some(cb => !cb)) {
      console.log('⚠️ Éléments du formulaire tournament introuvables');
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
}
