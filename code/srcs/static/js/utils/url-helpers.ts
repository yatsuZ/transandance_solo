import { DOMElements } from "../core/dom-manager.js";
import { SiteManagement } from "../SiteManagement.js";

/**
 * Trouve la page correspondante à partir d'une URL
 * Gère les chemins imbriqués comme /tournament/match ou /tournament/result
 * @param url - URL à analyser
 * @param allPages - Toutes les pages disponibles
 * @returns La page correspondante ou null si non trouvée
 */
export function findPageFromUrl(url: string, allPages: DOMElements["pages"]): HTMLElement | null {
  // Nettoyer l'URL et séparer les segments
  const segments = url.split('/').filter(s => s.length > 0);

  // CAS SPÉCIAL : URL racine "/" ou "/accueil" -> toujours page d'accueil
  if (segments.length === 0 || segments[segments.length - 1] === 'accueil') {
    return allPages.accueil;
  }

  // Dernier segment = nom de la page
  const pageName = segments[segments.length - 1];

  // Convertir en ID de page (ex: "match" -> "pagesMatch", "begin_tournament" -> "pagesBegin_Tournament")
  // Mettre en majuscule le premier caractère + chaque caractère après un underscore
  const convertedName = pageName
    .split('_')
    .map((part, index) => {
      // Première lettre de chaque partie en majuscule
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('_');

  const targetId = "pages" + convertedName;

  // Chercher dans les pages disponibles
  const targetPage = Object.values(allPages).find(p => p?.id === targetId);

  if (!targetPage) {
    console.warn(`[findPageFromUrl] Page "${targetId}" introuvable pour l'URL "${url}"`);
    return null; // Retourner null pour gérer l'erreur 404
  }

  return targetPage;
}

/**
 * Met à jour l'URL dans le navigateur et définit la page active
 * @param page - Page à activer
 * @param prefix - Préfixe optionnel pour l'URL (ex: "tournament")
 */
export function updateUrl(page: HTMLElement, prefix: string = "") {
  SiteManagement.activePage = page;

  const pageName = page.id.slice("pages".length).toLowerCase();
  const url = prefix ? `${prefix}/${pageName}` : `/${pageName}`;
  window.history.pushState({ page: pageName, prefix }, "", url);
}

/**
 * Redirige vers la page d'erreur avec un message et code personnalisés
 * @param errorCode - Le code d'erreur (403 ou 404)
 * @param errorMessage - Le message d'erreur à afficher
 * @param dO - Les éléments DOM
 * @returns La page d'erreur configurée (pour l'assigner à activePage)
 */
export function redirectToError(errorCode: 403 | 404, errorMessage: string, dO: DOMElements): HTMLElement {
  const errorPage = dO.pages.error;
  const errorCodeEl = dO.errorElement.codeEl;
  const errorDescriptionEl = dO.errorElement.descriptionEl;
  const errorImageEl = dO.errorElement.imageEl;

  // Mettre à jour le code d'erreur
  errorCodeEl.textContent = `Erreur ${errorCode}`;

  // Mettre à jour le message d'erreur
  errorDescriptionEl.textContent = errorMessage;

  // Mettre à jour l'image selon le code d'erreur
  errorImageEl.src = `/static/util/img/error_${errorCode}.jpg`;
  errorImageEl.alt = `Erreur ${errorCode}`;

  // Mettre à jour l'URL
  window.history.replaceState({ page: 'error' }, "", "/error");

  // Retourner la page pour l'activer dans spa_redirection
  return errorPage;
}
