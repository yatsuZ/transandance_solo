export function update_description_de_page(): void {
  const subtitleEl = document.querySelector('.arcade-subtitle') as HTMLElement | null;
  if (!subtitleEl) {
    console.warn('update_description_de_page: .arcade-subtitle element not found');
    return;
  }

  const buttons = document.querySelectorAll<HTMLButtonElement>('button');

  const texts: Record<string, string> = {
    default: 'Que veux-tu faire ?',
    go_to_match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    go_to_tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
    go_to_accueil: '🏠 Retour à l’accueil',
    interupteur_du_son: 'Mettre le son ou l’arrêter.',
    parametre: 'Accéder aux paramètres.'
  };

  let currentText: string = texts.default;
  let fadeTimeout: number | undefined;

  function changeSubtitle(newText: string): void {
    if (!subtitleEl) {
      console.warn('update_description_de_page: .arcade-subtitle element not found');
      return;
    }

    if (newText === currentText) return;
    currentText = newText;

    // Si une animation est en cours, on la stoppe
    if (fadeTimeout) window.clearTimeout(fadeTimeout);

    // Fade out
    subtitleEl.style.opacity = '0';

    // Quand il a fini de disparaître, on change le texte et on fait un fade in
    fadeTimeout = window.setTimeout(() => {
      subtitleEl.textContent = newText;
      subtitleEl.style.opacity = '1';
      fadeTimeout = undefined;
    }, 150); // Durée du fade out
  }

  // Gestion du hover sur les boutons
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      const link = button.dataset.link;
      const newText = link && texts[link] ? texts[link] : texts.default;
      changeSubtitle(newText);
    });

    button.addEventListener('mouseleave', () => {
      changeSubtitle(texts.default);
    });
  });
}
