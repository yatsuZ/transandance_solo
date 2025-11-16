import { DOMElements } from './dom_gestion.js';

/**
 * Configure les animations et changements de description au survol des boutons
 * @param dom - Éléments DOM de l'application (récupérés par init_All_Dom)
 */
export function update_description_de_page(dom: DOMElements): void {
  const subtitles = dom.subtitles;
  if (!subtitles.length) {
    console.warn('[update_description_de_page] Aucun sous-titre trouvé');
    return;
  }

  // Textes par défaut selon la page (id parent)
  const defaultTexts: Record<string, string> = {
    pagesAccueil: 'Que veux-tu faire ?',
    pagesMatch: 'Le premier à 3 points gagne la partie',
    pagesBegin_Tournament: 'Prépare ton tournoi et affronte les meilleurs !',
    pagesResult: 'Voici les résultats de ton dernier match !',
    pagesParametre: 'Parametre du site',
    pagesTree_Tournament: 'Voici le tournoi, préparez-vous et que le meilleur joueur gagne !'
  };

  // Textes selon les boutons
  const buttonTexts: Record<string, string> = {
    go_to_match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    go_to_Begin_Tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
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

    const buttons = dom.buttons.allButtons;

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