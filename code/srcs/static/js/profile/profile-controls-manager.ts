import { DOMElements } from "../core/dom-elements.js";
import { uiPreferences, type PlayerControls } from "../core/ui-preferences.js";

export type { PlayerControls };

/**
 * ProfileControlsManager
 * Gère l'affichage et la modification des contrôles clavier
 */
export class ProfileControlsManager {
  private _DO: DOMElements;

  constructor(dO: DOMElements) {
    this._DO = dO;
  }

  /**
   * Affiche les contrôles clavier dans la page Profile
   */
  public displayControls(): void {
    const controls = uiPreferences.getControls();

    this._DO.profile.ControlLU.textContent = this.formatKeyDisplay(controls.leftUp);
    this._DO.profile.ControlLD.textContent = this.formatKeyDisplay(controls.leftDown);
    this._DO.profile.ControlLL.textContent = this.formatKeyDisplay(controls.leftLeft);
    this._DO.profile.ControlLR.textContent = this.formatKeyDisplay(controls.leftRight);
    this._DO.profile.ControlRU.textContent = this.formatKeyDisplay(controls.rightUp);
    this._DO.profile.ControlRD.textContent = this.formatKeyDisplay(controls.rightDown);
    this._DO.profile.ControlRL.textContent = this.formatKeyDisplay(controls.rightLeft);
    this._DO.profile.ControlRR.textContent = this.formatKeyDisplay(controls.rightRight);

    // Ajouter l'event pour modifier les contrôles
    this._DO.profile.btnEditControl.onclick = () => this.handleEditControls();
  }

  /**
   * Convertit les touches en symboles pour l'affichage
   */
  private formatKeyDisplay(key: string): string {
    const keyMap: Record<string, string> = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Space': 'ESPACE',
      'Enter': 'ENTREE',
      'Shift': 'MAJ',
      'Control': 'CTRL',
      'Alt': 'ALT'
    };

    return keyMap[key] || key.toUpperCase();
  }

  /**
   * Gère la modification des contrôles clavier
   */
  private handleEditControls(): void {
    const currentControls = uiPreferences.getControls();
    const modal = this._DO.controlsModal.modal;

    // Afficher les valeurs actuelles dans les inputs
    this._DO.controlsModal.inputLeftUp.value = this.formatKeyDisplay(currentControls.leftUp);
    this._DO.controlsModal.inputLeftDown.value = this.formatKeyDisplay(currentControls.leftDown);
    this._DO.controlsModal.inputLeftLeft.value = this.formatKeyDisplay(currentControls.leftLeft);
    this._DO.controlsModal.inputLeftRight.value = this.formatKeyDisplay(currentControls.leftRight);
    this._DO.controlsModal.inputRightUp.value = this.formatKeyDisplay(currentControls.rightUp);
    this._DO.controlsModal.inputRightDown.value = this.formatKeyDisplay(currentControls.rightDown);
    this._DO.controlsModal.inputRightLeft.value = this.formatKeyDisplay(currentControls.rightLeft);
    this._DO.controlsModal.inputRightRight.value = this.formatKeyDisplay(currentControls.rightRight);

    // Afficher la modal
    modal.classList.remove('hidden');

    // Variables pour stocker les nouvelles touches
    const newControls = { ...currentControls };
    const keyMapping: Record<string, { key: keyof typeof newControls; input: HTMLInputElement }> = {
      'key-left-up': { key: 'leftUp', input: this._DO.controlsModal.inputLeftUp },
      'key-left-down': { key: 'leftDown', input: this._DO.controlsModal.inputLeftDown },
      'key-left-left': { key: 'leftLeft', input: this._DO.controlsModal.inputLeftLeft },
      'key-left-right': { key: 'leftRight', input: this._DO.controlsModal.inputLeftRight },
      'key-right-up': { key: 'rightUp', input: this._DO.controlsModal.inputRightUp },
      'key-right-down': { key: 'rightDown', input: this._DO.controlsModal.inputRightDown },
      'key-right-left': { key: 'rightLeft', input: this._DO.controlsModal.inputRightLeft },
      'key-right-right': { key: 'rightRight', input: this._DO.controlsModal.inputRightRight }
    };

    // Gestion des inputs
    Object.values(keyMapping).forEach(({ key, input }) => {
      const clickHandler = () => {
        input.value = 'Appuyez sur une touche...';
        input.classList.add('active');
        input.classList.remove('success');

        const keyHandler = (e: KeyboardEvent) => {
          e.preventDefault();

          // Ignorer certaines touches système
          if (['Escape', 'F5', 'F11', 'F12'].includes(e.key)) {
            input.value = this.formatKeyDisplay(newControls[key]);
            input.classList.remove('active');
            window.removeEventListener('keydown', keyHandler);
            return;
          }

          newControls[key] = e.key;
          input.value = this.formatKeyDisplay(e.key);
          input.classList.remove('active');
          input.classList.add('success');
          window.removeEventListener('keydown', keyHandler);
        };

        window.addEventListener('keydown', keyHandler);
      };

      input.addEventListener('click', clickHandler);
    });

    // Bouton Sauvegarder
    const saveHandler = async () => {
      uiPreferences.setControls(newControls);
      this.displayControls();

      // Sauvegarder en BDD
      try {
        const response = await fetch('/api/auth/controls', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            controls: JSON.stringify(newControls)
          })
        });

        if (response.ok) {
        } else {
        }
      } catch (error) {
      }

      modal.classList.add('hidden');
      cleanup();
    };

    // Bouton Annuler
    const cancelHandler = () => {
      modal.classList.add('hidden');
      cleanup();
    };

    // Fermer avec Escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.classList.add('hidden');
        cleanup();
      }
    };

    // Cleanup listeners
    const cleanup = () => {
      this._DO.controlsModal.btnSave.removeEventListener('click', saveHandler);
      this._DO.controlsModal.btnCancel.removeEventListener('click', cancelHandler);
      window.removeEventListener('keydown', escapeHandler);
    };

    this._DO.controlsModal.btnSave.addEventListener('click', saveHandler);
    this._DO.controlsModal.btnCancel.addEventListener('click', cancelHandler);
    window.addEventListener('keydown', escapeHandler);
  }
}
