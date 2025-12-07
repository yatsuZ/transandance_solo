import { DOMElements } from '../core/dom-elements.js';
import { getMessageOfErrorCode } from '../utils/url-helpers.js';

/**
 * Met à jour immédiatement le texte de description de la page actuelle
 * Utilisé lors de la navigation pour rafraîchir le texte
 */
export function refreshPageDescription(): void {
  const subtitles = document.querySelectorAll('.arcade-subtitle');
  subtitles.forEach((subtitleEl) => {
    const parentPage = subtitleEl.closest('.page');
    if (!parentPage) return;

    const pageId = parentPage.id;

    // Même logique que getDefaultText() mais accessible publiquement
    let newText = '...';

    if (pageId === 'pagesProfile') {
      const currentPath = window.location.pathname;
      const friendProfileMatch = currentPath.match(/^\/profile\/ami\/([^\/]+)$/);

      if (friendProfileMatch) {
        const friendUsername = friendProfileMatch[1];
        newText = `Profil de votre ami : ${friendUsername}`;
      } else {
        const usernameEl = document.getElementById('profile-username');
        const username = usernameEl?.textContent || '';
        newText = username ? `Voici la page profile de : ${username}` : 'Voici la page profile';
      }
    }

    if (newText !== '...') {
      subtitleEl.textContent = newText;
    }
  });
}

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
    pagesLogin: `Aller connecte TOI!! ONE MORE GAME. ONE MORE GAME !!`,
    pagesSignup: 'Aller Inscrit toi sur YARE GATRA !!',
    pagesAccueil: 'Que veux-tu faire ?',
    pagesProfile: 'Voici la page profile DE :',
    pagesLeaderboard: 'Les meilleurs joueurs de la galaxie arcade',
    pagesGame_Config: 'Choisis ton jeu et prépare ton duel !',
    pagesMatch: 'Le premier à 3 points gagne la partie',
    pagesTron: 'Évite les murs et les traînées lumineuses - Premier à 3 rounds gagne!',
    pagesBegin_Tournament: 'Prépare ton tournoi et affronte les meilleurs !',
    pagesResult: 'Voici les résultats de ton dernier match !',
    pagesParametre: 'Parametre du site',
    pagesTree_Tournament: 'Voici le tournoi, préparez-vous et que le meilleur joueur gagne !'
  };

  // Textes selon les boutons et icônes
  const buttonTexts: Record<string, string> = {
    go_to_Game_Config: '🎮 Configure ton match et choisis tes adversaires !',
    go_to_match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    go_to_Begin_Tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
    go_to_accueil: `🏠 Retour à l'accueil`,
    interupteur_du_son: `Mettre le son ou l'arrêter.`,
    parametre: `Accéder aux paramètres.`,
    edit_profile: `✏️ Modifier ton profil (photo, pseudo, email, mot de passe).`
  };

  subtitles.forEach((subtitleEl) => {
    const parentPage = subtitleEl.closest('.page');
    if (!parentPage) return;

    const pageId = parentPage.id;
    let fadeTimeout: number | undefined;

    /**
     * Récupère le texte par défaut de la page
     * Pour la page erreur, on récupère le code depuis le titre et on calcule le message
     * Pour la page profile, on récupère le username dynamiquement
     */
    function getDefaultText(): string {
      // Pour la page erreur, récupérer le code depuis .error-code
      if (pageId === 'pagesError') {
        const errorCodeEl = dom.errorElement.codeEl;
        const errorDescriptionEl = dom.errorElement.descriptionEl;
        const errorCodeText = errorCodeEl.textContent || '';

        // Parser le code d'erreur
        let errorCode = 0;
        if (errorCodeText === "Pas d'Erreur") {
          errorCode = 0;
        } else {
          const match = errorCodeText.match(/Erreur (\d+)/);
          errorCode = match ? parseInt(match[1], 10) : 0;
        }

        // Pour les 404, récupérer l'URL sauvegardée
        let url: string | undefined;
        if (errorCode === 404) {
          url = errorDescriptionEl.getAttribute('data-404-url') || undefined;
        }

        // Retourner le message correspondant
        return getMessageOfErrorCode(errorCode, url);
      }

      // Pour la page profile, récupérer le username dynamiquement
      if (pageId === 'pagesProfile') {
        // Vérifier si on est sur le profil d'un ami via l'URL
        const currentPath = window.location.pathname;
        const friendProfileMatch = currentPath.match(/^\/profile\/ami\/([^\/]+)$/);

        if (friendProfileMatch) {
          // Mode ami : afficher le nom de l'ami depuis l'URL
          const friendUsername = friendProfileMatch[1];
          return `Profil de votre ami : ${friendUsername}`;
        } else {
          // Mode normal : afficher son propre username
          const usernameEl = dom.profile.username;
          const username = usernameEl.textContent || '';
          return username ? `Voici la page profile de : ${username}` : 'Voici la page profile';
        }
      }

      // Pour les autres pages, utiliser le texte statique
      return defaultTexts[pageId] ?? '...';
    }

    // Stocke le texte par défaut de la page
    let defaultText = getDefaultText();
    let currentText = defaultText;

    // Fonction d'animation fluide
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
        // Pour la page erreur et profile, recalculer le texte par défaut (dynamique)
        if (pageId === 'pagesError' || pageId === 'pagesProfile') {
          defaultText = getDefaultText();
        }
        changeSubtitle(defaultText);
      });
    });
  });
}