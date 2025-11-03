export function update_description_de_page(): void {
  const subtitles = document.querySelectorAll<HTMLElement>('.arcade-subtitle');
  if (!subtitles.length) {
    console.warn('update_description_de_page: aucun .arcade-subtitle trouvé');
    return;
  }

  // Textes par défaut selon la page (id parent)
  const defaultTexts: Record<string, string> = {
    pagesAccueil: 'Que veux-tu faire ?',
    pagesMatch: 'Le premier à 3 points gagne la partie',
    pagesTournament: 'Prépare ton tournoi et affronte les meilleurs !',
    pagesResult: 'Voici les résultats de ton dernier match !',
    pagesParametre: 'Parametre du site'
  };

  // Textes selon les boutons
  const buttonTexts: Record<string, string> = {
    go_to_match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    go_to_tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
    go_to_accueil: '🏠 Retour à l’accueil',
    interupteur_du_son: 'Mettre le son ou l’arrêter.',
    parametre: 'Accéder aux paramètres.'
  };

  subtitles.forEach((subtitleEl) => {
    const parentPage = subtitleEl.closest('.page');
    if (!parentPage) return;

    const pageId = parentPage.id;
    const defaultText = defaultTexts[pageId] ?? '...';
    let currentText = defaultText;
    let fadeTimeout: number | undefined;

    // Fonction d’animation fluide
    function changeSubtitle(newText: string): void {
      if (newText === currentText) return;
      currentText = newText;
      if (fadeTimeout) window.clearTimeout(fadeTimeout);

      subtitleEl.style.opacity = '0';
      fadeTimeout = window.setTimeout(() => {
        subtitleEl.textContent = newText;
        subtitleEl.style.opacity = '1';
        fadeTimeout = undefined;
      }, 150);
    }

    // Trouver uniquement les boutons à l’intérieur de cette page
    const buttons = document.querySelectorAll<HTMLButtonElement>('button');

    buttons.forEach((button) => {
      button.addEventListener('mouseenter', () => {
        const link = button.dataset.link;
        const newText = (link && buttonTexts[link]) ? buttonTexts[link] : defaultText;
        changeSubtitle(newText);
      });

      button.addEventListener('mouseleave', () => {
        changeSubtitle(defaultText);
      });
    });
  });
}