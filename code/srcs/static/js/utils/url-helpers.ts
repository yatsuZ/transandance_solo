import { DOMElements } from "../core/dom-elements.js";
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

  // CAS SPÉCIAL : /match/pong → pagesMatch
  if (url.startsWith('/match/pong')) {
    return allPages.match;
  }

  // CAS SPÉCIAL : /match/tron → pagesTron
  if (url.startsWith('/match/tron')) {
    return allPages.tron;
  }

  // BLOCAGE : /match seul n'est plus accessible (seulement /match/pong ou /match/tron)
  if (url === '/match') {
    console.warn('[findPageFromUrl] Route /match bloquée - utilisez /match/pong ou /match/tron');
    return null;
  }

  // CAS SPÉCIAL : /custom/pong ou /custom/tron → pagesCustom
  if (url.startsWith('/custom/pong') || url.startsWith('/custom/tron')) {
    return allPages.custom;
  }

  // BLOCAGE : /custom seul n'est plus accessible (seulement /custom/pong ou /custom/tron)
  if (url === '/custom') {
    console.warn('[findPageFromUrl] Route /custom bloquée - utilisez /custom/pong ou /custom/tron');
    return null;
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
 * @param urlOrPrefix - URL complète (si commence par '/') ou préfixe optionnel (ex: "tournament")
 */
export function updateUrl(page: HTMLElement, urlOrPrefix: string = "") {
  SiteManagement.activePage = page;

  let url: string;

  // Si urlOrPrefix commence par '/', c'est une URL complète
  if (urlOrPrefix.startsWith('/')) {
    url = urlOrPrefix;
  } else {
    // Sinon c'est un préfixe
    const pageName = page.id.slice("pages".length).toLowerCase();
    url = urlOrPrefix ? `${urlOrPrefix}/${pageName}` : `/${pageName}`;
  }

  // CAS SPÉCIAL : Si c'est la page custom, TOUJOURS utiliser /custom/pong par défaut
  if (page.id === "pagesCustom" && url === "/custom") {
    url = "/custom/pong";
  }

  window.history.pushState({ page: page.id }, "", url);
}

/**
 * Trouve l'image d'erreur disponible (.jpg ou .png)
 * @param errorCode - Le code d'erreur
 * @returns L'URL de l'image à utiliser
 */
async function findErrorImage(errorCode: number): Promise<string> {
  // Si c'est une erreur non gérée, retourner l'image par défaut
  if (errorCode !== 0 && errorCode !== 401 && errorCode !== 403 && errorCode !== 404)
    return '/static/util/img/error_x.png';

  const basePath = `/static/util/img/error_${errorCode}`;
  const extensions = ['jpg', 'png'];

  // Tester les extensions dans l'ordre
  for (const ext of extensions) {
    const url = `${basePath}.${ext}`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok)
        return url;
    } catch (e) {
      // Continuer avec l'extension suivante
    }
  }

  // Fallback : image par défaut
  return '/static/util/img/error_x.png';
}

/**
 * Redirige vers la page d'erreur avec un message et code personnalisés
 * @param errorCode - Le code d'erreur
 * @param dO - Les éléments DOM
 * @param originalUrl - URL originale pour erreur 404 (optionnel)
 * @returns La page d'erreur configurée (pour l'assigner à activePage)
 */
export function redirectToError(errorCode: number, dO: DOMElements, originalUrl?: string): HTMLElement {
  const errorPage = dO.pages.error;
  const errorCodeEl = dO.errorElement.codeEl;
  const errorDescriptionEl = dO.errorElement.descriptionEl;
  const errorImageEl = dO.errorElement.imageEl;

  // Mettre à jour le code d'erreur
  errorCodeEl.textContent = errorCode === 0 ? "Pas d'Erreur" : `Erreur ${errorCode}`;

  // Pour l'erreur 404, sauvegarder l'URL originale
  if (errorCode === 404 && originalUrl) {
    errorDescriptionEl.setAttribute('data-404-url', originalUrl);
  } else if (errorCode !== 404) {
    errorDescriptionEl.removeAttribute('data-404-url');
  }

  // Mettre à jour le message d'erreur
  const description = getMessageOfErrorCode(errorCode, originalUrl)
  errorDescriptionEl.textContent = description;

  // Mettre à jour l'image selon le code d'erreur (async)
  findErrorImage(errorCode).then(imageUrl => {
    errorImageEl.src = imageUrl;
    errorImageEl.alt = `Erreur ${errorCode}`;
  });

  // Mettre à jour l'URL
  // Pour les 404, garder l'URL originale dans la barre d'adresse
  if (errorCode === 404 && originalUrl) {
    window.history.replaceState({ page: 'error', errorCode: 404, originalUrl }, "", originalUrl);
  } else {
    window.history.replaceState({ page: 'error' }, "", "/error");
  }

  // Retourner la page pour l'activer dans spa_redirection
  return errorPage;
}

/**
 * Réinitialise le contenu de la page d'erreur SANS modifier l'historique
 * @param errorCode - Le code d'erreur
 * @param dO - Les éléments DOM
 */
export function resetErrorPage(errorCode: number, dO: DOMElements): void {
  const errorCodeEl = dO.errorElement.codeEl;
  const errorDescriptionEl = dO.errorElement.descriptionEl;
  const errorImageEl = dO.errorElement.imageEl;

  // Mettre à jour le code d'erreur
  errorCodeEl.textContent = errorCode === 0 ? "Pas d'Erreur" : `Erreur ${errorCode}`;

  // Mettre à jour le message d'erreur
  const description = getMessageOfErrorCode(errorCode);
  errorDescriptionEl.textContent = description;

  // Mettre à jour l'image selon le code d'erreur (async)
  findErrorImage(errorCode).then(imageUrl => {
    errorImageEl.src = imageUrl;
    errorImageEl.alt = `Erreur ${errorCode}`;
  });
}

export function getMessageOfErrorCode(errorCode: number, url?: string) : string
{
  switch (errorCode) {
    case 0:
      return "Y a pas de probléme."
    case 401:
      return "Session expirée ou invalide.\nVeuillez vous reconnecter pour continuer."
    case 403:
      return "VOUS NE PASSEREZ PAS, Passez par un chemin conventionnel, s'il vous plaît."
    case 404:
      return url
        ? `La page "${url}" n'existe pas...\nSerieux tu t'es paumé ?`
        : "La page demandée n'existe pas...\nSerieux tu t'es paumé ?";
    default:
      return "Pas encore de message pour cette erreur.";
  }
}
