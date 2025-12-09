import { DOMElements } from '../core/dom-elements.js';
import { getMessageOfErrorCode } from '../utils/url-helpers.js';

// Cache pour les configurations de customization
let cachedPongWinningScore: number | null = null;
let cachedTronWinningScore: number | null = null;

/**
 * Récupère le winning_score depuis l'API de customization
 */
async function fetchWinningScore(gameType: 'pong' | 'tron'): Promise<number> {
  try {
    const response = await fetch(`/api/customization/${gameType}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data && data.data.winning_score) {
        return data.data.winning_score;
      }
    }
  } catch (error) {
    // En cas d'erreur, utiliser la valeur par défaut
  }

  // Valeurs par défaut
  return gameType === 'pong' ? 3 : 3;
}

/**
 * Charge et met en cache les scores de victoire
 */
export async function loadWinningScores(): Promise<void> {
  const [pongScore, tronScore] = await Promise.all([
    fetchWinningScore('pong'),
    fetchWinningScore('tron')
  ]);
  cachedPongWinningScore = pongScore;
  cachedTronWinningScore = tronScore;
}

/**
 * Récupère le winning_score pour Pong (depuis le cache ou par défaut)
 */
export function getPongWinningScore(): number {
  return cachedPongWinningScore ?? 3;
}

/**
 * Récupère le winning_score pour Tron (depuis le cache ou par défaut)
 */
export function getTronWinningScore(): number {
  return cachedTronWinningScore ?? 3;
}

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

    // Description dynamique pour la page match Pong
    if (pageId === 'pagesMatch') {
      const score = getPongWinningScore();
      newText = `Le premier à ${score} points gagne la partie`;
    }

    // Description dynamique pour la page match Tron
    if (pageId === 'pagesTron') {
      const score = getTronWinningScore();
      newText = `Évite les murs et les traînées lumineuses - Premier à ${score} rounds gagne!`;
    }

    // Description pour la page Custom
    if (pageId === 'pagesCustom') {
      newText = 'Personnalise les couleurs et les règles de tes jeux !';
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

  // Fonction pour obtenir les textes par défaut avec valeurs dynamiques
  const getDefaultTexts = (): Record<string, string> => ({
    pagesLogin: `Aller connecte TOI!! ONE MORE GAME. ONE MORE GAME !!`,
    pagesSignup: 'Aller Inscrit toi sur YARE GATRA !!',
    pagesAccueil: 'Que veux-tu faire ?',
    pagesProfile: 'Voici la page profile DE :',
    pagesLeaderboard: 'Les meilleurs joueurs de la galaxie arcade',
    pagesGame_Config: 'Choisis ton jeu et prépare ton duel !',
    pagesMatch: `Le premier à ${getPongWinningScore()} points gagne la partie`,
    pagesTron: `Évite les murs et les traînées lumineuses - Premier à ${getTronWinningScore()} rounds gagne!`,
    pagesBegin_Tournament: 'Prépare ton tournoi et affronte les meilleurs !',
    pagesResult: 'Voici les résultats de ton dernier match !',
    pagesParametre: 'Parametre du site',
    pagesTree_Tournament: 'Voici le tournoi, préparez-vous et que le meilleur joueur gagne !',
    pagesCustom: 'Personnalise les couleurs et les règles de tes jeux !'
  });

  // Fonction pour obtenir les textes des boutons avec valeurs dynamiques
  const getButtonTexts = (): Record<string, string> => ({
    go_to_Game_Config: '🎮 Configure ton match et choisis tes adversaires !',
    go_to_match: `🎮 Jouer à Pong — le premier à ${getPongWinningScore()} gagne !`,
    go_to_Begin_Tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
    go_to_accueil: `🏠 Retour à l'accueil`,
    interupteur_du_son: `Mettre le son ou l'arrêter.`,
    parametre: `Accéder aux paramètres.`,
    edit_profile: `✏️ Modifier ton profil (photo, pseudo, email, mot de passe).`,
    'icon-profile': `👤 Voir ton profil et tes statistiques.`
  });

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

      // Pour les autres pages, utiliser le texte dynamique
      const defaultTexts = getDefaultTexts();
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
        const buttonTexts = getButtonTexts();
        const newText = (link && buttonTexts[link]) ? buttonTexts[link] : defaultText;
        changeSubtitle(newText);
      });

      button.addEventListener('mouseleave', () => {
        // Pour la page erreur, profile, match et tron, recalculer le texte par défaut (dynamique)
        if (pageId === 'pagesError' || pageId === 'pagesProfile' || pageId === 'pagesMatch' || pageId === 'pagesTron') {
          defaultText = getDefaultText();
        }
        changeSubtitle(defaultText);
      });
    });
  });
}