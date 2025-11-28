/**
 * Utility pour coloriser les caractères en fonction de leur casse (majuscule/minuscule)
 * Permet d'utiliser "Press Start 2P" tout en différenciant visuellement les majuscules/minuscules
 */

export class InputColorizer {
  /**
   * Applique la colorisation sur un input de type text/password/email
   * - Majuscules: couleur principale (vert/jaune selon focus)
   * - Minuscules: couleur secondaire (orange/cyan)
   */
  static applyToInput(input: HTMLInputElement): void {
    // Créer un div overlay pour afficher le texte coloré
    const overlay = document.createElement('div');
    overlay.className = 'input-colorizer-overlay';

    // Wrapper pour contenir l'input et l'overlay
    const wrapper = document.createElement('div');
    wrapper.className = 'input-colorizer-wrapper';

    // Insérer le wrapper avant l'input
    input.parentNode?.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(overlay);

    // Fonction pour mettre à jour l'overlay
    const updateOverlay = () => {
      const value = input.value;

      if (!value) {
        overlay.innerHTML = '';
        overlay.style.display = 'none';
        input.style.color = ''; // Réinitialiser la couleur de l'input
        return;
      }

      // Masquer le texte de l'input original (mais garder le curseur)
      input.style.color = 'transparent';
      overlay.style.display = 'block';

      // Construire le HTML avec des spans colorés
      let html = '';

      if (input.type === 'password') {
        // Pour les passwords, afficher des bullets colorés
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          const isUpper = char >= 'A' && char <= 'Z';
          const className = isUpper ? 'char-upper' : 'char-lower';
          html += `<span class="${className}">•</span>`;
        }
      } else {
        // Pour text/email, afficher les vrais caractères colorés
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          const isUpper = char >= 'A' && char <= 'Z';
          const className = isUpper ? 'char-upper' : 'char-lower';
          html += `<span class="${className}">${char}</span>`;
        }
      }

      overlay.innerHTML = html;
    };

    // Écouter les changements
    input.addEventListener('input', updateOverlay);
    input.addEventListener('focus', updateOverlay);
    input.addEventListener('blur', updateOverlay);

    // Initialiser
    updateOverlay();
  }

  /**
   * Applique la colorisation sur tous les inputs d'un formulaire
   */
  static applyToForm(form: HTMLFormElement): void {
    const inputs = form.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="password"], input[type="email"]');
    inputs.forEach(input => this.applyToInput(input));
  }
}
