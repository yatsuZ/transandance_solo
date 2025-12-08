import { activeAnotherPage, activeOrHiden } from "./page-manager.js";
import { findPageFromUrl, redirectToError, resetErrorPage, updateUrl } from "../utils/url-helpers.js";
import { DOMElements } from "../core/dom-elements.js";
import { SiteManagement } from "../SiteManagement.js";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTES - IDs DE PAGES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const PAGE_IDS = {
  ACCUEIL: "pagesAccueil",
  PROFILE: "pagesProfile",
  LEADERBOARD: "pagesLeaderboard",
  LOGIN: "pagesLogin",
  SIGNUP: "pagesSignup",
  MATCH: "pagesMatch",
  TRON: "pagesTron",
  RESULT: "pagesResult",
  ERROR: "pagesError",
  PARAMETRE: "pagesParametre",
  TREE_TOURNAMENT: "pagesTree_Tournament",
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION DES ROUTES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Routes interdites en accès direct (nécessitent un contexte actif : match/tournoi/profil ami)
 */
export const CONTEXT_RESTRICTED_ROUTES = [
  '/match/pong',
  '/match/tron',
  '/match/result',
  '/tournament/match',
  '/tournament/result',
  '/tournament/tree_tournament',
  '/profile/ami'
] as const;

/**
 * Routes protégées (nécessitent une authentification JWT)
 */
export const AUTH_PROTECTED_ROUTES = [
  '/accueil',
  '/profile',
  '/leaderboard',
  '/game_config',
  '/begin_tournament',
  '/parametre'
] as const;

/**
 * Routes publiques (accessibles sans auth)
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/signup'
] as const;

/**
 * Vérifie si une route nécessite un contexte actif (match/tournoi)
 */
export function isContextRestrictedRoute(path: string): boolean {
  return CONTEXT_RESTRICTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Vérifie si une route nécessite une authentification
 */
export function isAuthProtectedRoute(path: string): boolean {
  return AUTH_PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Vérifie si une route est publique
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UTILITAIRES DE MANIPULATION DOM
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Trouve une page dans la liste des pages par son ID
 */
export function findPage(allPages: DOMElements["pages"], targetId: string): HTMLElement | null {
  let targetPage = Object.values(allPages).find(p => p?.id === targetId);

  if (!targetPage) {
    console.warn(`[SPA] Page "${targetId}" introuvable dans DOMElements, tentative de récupération via document.getElementById...`);
    const tmpTargetPage = document.getElementById(targetId) as HTMLElement | null;
    if (tmpTargetPage) console.log(`[SPA] Page "${tmpTargetPage}" récupérée avec succès via document.getElementById.`);
    else console.error(`[SPA] Impossible de récupérer la page "${tmpTargetPage}" depuis le DOM.`);
    return tmpTargetPage;
  }
  return targetPage;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS DE NAVIGATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class NavigationHelpers {
  private _DO: DOMElements;

  constructor(dO: DOMElements) {
    this._DO = dO;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GESTION DES ICÔNES
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Gère l'affichage des icônes selon la page et l'état d'authentification
   */
  setIconsVisibility(pageId: string, isLoggedIn: boolean): void {
    const iconEdit = this._DO.icons.edit;
    const iconAccueil = this._DO.icons.accueil;
    const iconSettings = this._DO.icons.settings;
    const iconProfile = this._DO.icons.profile;

    // Pages publiques (login/signup) : toujours cacher les icônes
    if (pageId === PAGE_IDS.LOGIN || pageId === PAGE_IDS.SIGNUP) {
      activeOrHiden(iconEdit, "Off");
      activeOrHiden(iconProfile, "Off");
      activeOrHiden(iconAccueil, "Off");
      activeOrHiden(iconSettings, "Off");
      return;
    }

    // Pas connecté : cacher toutes les icônes
    if (!isLoggedIn) {
      activeOrHiden(iconEdit, "Off");
      activeOrHiden(iconProfile, "Off");
      activeOrHiden(iconAccueil, "Off");
      activeOrHiden(iconSettings, "Off");
      return;
    }

    // Connecté : afficher les icônes selon la page
    const showAccueil = pageId !== PAGE_IDS.ACCUEIL;
    const showSettings = pageId !== PAGE_IDS.PARAMETRE;
    const showProfile = pageId !== PAGE_IDS.PROFILE;
    const showEdit = pageId === PAGE_IDS.PROFILE; // Visible UNIQUEMENT sur la page profile

    activeOrHiden(iconEdit, showEdit ? "On" : "Off");
    activeOrHiden(iconProfile, showProfile ? "On" : "Off");
    activeOrHiden(iconAccueil, showAccueil ? "On" : "Off");
    activeOrHiden(iconSettings, showSettings ? "On" : "Off");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // REDIRECTIONS
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Redirige vers une page d'erreur et gère les icônes
   */
  redirectToErrorWithIcons(errorCode: number, isLoggedIn: boolean, originalUrl?: string): void {
    const errorPage = redirectToError(errorCode, this._DO, originalUrl);
    this.setIconsVisibility(errorPage.id, isLoggedIn);
    activeAnotherPage(errorPage);
  }

  /**
   * Redirige vers la page de login et cache toutes les icônes
   */
  redirectToLoginPage(): void {
    const loginPage = this._DO.pages.login;
    this.setIconsVisibility(loginPage.id, false);
    activeAnotherPage(loginPage);
    updateUrl(loginPage);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GESTION PAGE ERROR
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Réinitialise la page d'erreur si nécessaire (hors 404)
   */
  resetErrorPageIfNeeded(currentPage: HTMLElement | null, targetPage: HTMLElement): void {
    if (currentPage?.id !== PAGE_IDS.ERROR || targetPage.id === PAGE_IDS.ERROR)
      return;

    const errorCodeEl = this._DO.errorElement.codeEl;
    const errorCodeText = errorCodeEl.textContent || '';
    const is404 = errorCodeText.includes("404");

    if (!is404) {
      console.log("🔄 Réinitialisation de la page error (code 0)");
      resetErrorPage(0, this._DO);
    } else
      console.log("📌 Page error 404 conservée pour navigation back/forward");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // RÉSOLUTION DE PAGES
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Résout la page cible depuis l'URL
   */
  resolveTargetPage(path: string): HTMLElement | null {
    if (path === '/') return null; // Géré séparément
    return findPageFromUrl(path, this._DO.pages);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // NAVIGATION
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Résout quelle page afficher pour la route racine "/"
   */
  resolveRootPage(isLoggedIn: boolean): HTMLElement {
    if (isLoggedIn) {
      console.log("🏠 Route racine → Accueil (connecté)");
      return this._DO.pages.accueil;
    } else {
      console.log("🔒 Route racine → Login (non connecté)");
      return this._DO.pages.login;
    }
  }

  /**
   * Navigue vers une page et gère l'affichage des icônes
   * @returns Le pageId pour que l'appelant puisse vérifier si c'est Profile
   */
  navigateToPage(page: HTMLElement, isLoggedIn: boolean, replaceHistory: boolean): string {
    // Gérer les icônes selon JWT et page
    this.setIconsVisibility(page.id, isLoggedIn);

    // Activer la page
    activeAnotherPage(page);

    // Mettre à jour l'URL
    if (replaceHistory) {
      const pageName = page.id.slice("pages".length).toLowerCase();
      window.history.replaceState({ page: pageName }, "", `/${pageName}`);
    }

    // Retourner le pageId pour que l'appelant puisse faire des actions après
    return page.id;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ROUTES SPÉCIALES
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Gère les cas spéciaux de routes (/, /error)
   * @returns Le pageId de la page affichée, ou null si pas de route spéciale
   */
  handleSpecialRoutes(path: string, isLoggedIn: boolean): string | null {
    // Route racine
    if (path === "/") {
      const page = this.resolveRootPage(isLoggedIn);
      return this.navigateToPage(page, isLoggedIn, true);
    }

    // Route error
    if (path === "/error") {
      console.log("🔄 Navigation vers /error → Affichage code 0");
      resetErrorPage(0, this._DO);
      activeAnotherPage(this._DO.pages.error);
      this.setIconsVisibility(PAGE_IDS.ERROR, isLoggedIn);
      return PAGE_IDS.ERROR;
    }

    return null;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // RESTRICTIONS DE CONTEXTE
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Vérifie les blocages de contexte (match/tournoi)
   * @returns true si l'accès est bloqué
   */
  checkContextRestrictions(
    path: string,
    targetPage: HTMLElement,
    isLoggedIn: boolean,
    hasActiveTournament: () => boolean,
    hasActiveMatch: () => boolean,
    hasActiveTronMatch: () => boolean
  ): boolean {
    const allowedTournamentPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    // BLOCAGE 1 : Match Pong sans contexte
    if (
      !hasActiveTournament() &&
      !hasActiveMatch() &&
      targetPage.id === PAGE_IDS.MATCH &&
      path === "/match/pong"
    ) {
      console.log("🚫 [MATCH PONG] Accès interdit : Aucun match Pong actif");
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return true;
    }

    // BLOCAGE 1b : Match Tron sans contexte
    if (
      !hasActiveTournament() &&
      !hasActiveTronMatch() &&
      targetPage.id === PAGE_IDS.TRON &&
      path === "/match/tron"
    ) {
      console.log("🚫 [MATCH TRON] Accès interdit : Aucun match Tron actif");
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return true;
    }

    // BLOCAGE 1c : Result page sans contexte
    if (
      !hasActiveTournament() &&
      !hasActiveMatch() &&
      !hasActiveTronMatch() &&
      targetPage.id === PAGE_IDS.RESULT &&
      path === "/match/result"
    ) {
      console.log("🚫 [MATCH RESULT] Accès interdit : Aucun match actif");
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return true;
    }

    // BLOCAGE 2 : Tournoi sans contexte
    if (!hasActiveTournament() && allowedTournamentPages.includes(targetPage.id)) {
      console.log("🚫 [TOURNOI] Accès interdit : Aucun tournoi actif");
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return true;
    }

    return false;
  }

  /**
   * Gère le cleanup des contextes actifs lors de la navigation
   * @returns true si une redirection a été effectuée
   */
  handleContextCleanup(
    currentPage: HTMLElement | null,
    targetPage: HTMLElement,
    hasActiveTournament: () => boolean,
    hasActiveMatch: () => boolean,
    hasActiveTronMatch: () => boolean,
    stopTournament: (reason: string) => void,
    stopMatch: (reason: string) => void,
    stopTronMatch: (reason: string) => void
  ): boolean {
    const allowedTournamentPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    // BLOCAGE STRICT : Empêcher TOUT accès à match/pong via back/forward (même depuis un match actif)
    if (currentPage?.id === PAGE_IDS.MATCH && targetPage.id !== PAGE_IDS.MATCH) {
      console.log("🚫 [SÉCURITÉ] Backward depuis /match/pong → Arrêt et redirection immédiate vers accueil");
      if (hasActiveMatch()) {
        stopMatch("Navigation back/forward bloquée depuis match Pong");
      }
      if (hasActiveTournament()) {
        stopTournament("Navigation back/forward bloquée depuis match Pong en tournoi");
      }
      activeAnotherPage(this._DO.pages.accueil);
      this.setIconsVisibility(PAGE_IDS.ACCUEIL, true);
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return true;
    }

    // BLOCAGE STRICT : Empêcher TOUT accès à match/tron via back/forward (même depuis un match actif)
    if (currentPage?.id === PAGE_IDS.TRON && targetPage.id !== PAGE_IDS.TRON) {
      console.log("🚫 [SÉCURITÉ] Backward depuis /match/tron → Arrêt et redirection immédiate vers accueil");
      if (hasActiveTronMatch()) {
        stopTronMatch("Navigation back/forward bloquée depuis match Tron");
      }
      if (hasActiveTournament()) {
        stopTournament("Navigation back/forward bloquée depuis match Tron en tournoi");
      }
      activeAnotherPage(this._DO.pages.accueil);
      this.setIconsVisibility(PAGE_IDS.ACCUEIL, true);
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return true;
    }

    // Backward depuis tournoi → Arrêt et redirection accueil
    if (hasActiveTournament() && allowedTournamentPages.includes(currentPage?.id ?? "")) {
      console.log("🛑 [TOURNOI] Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      stopTournament("Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      activeAnotherPage(this._DO.pages.accueil);
      this.setIconsVisibility(PAGE_IDS.ACCUEIL, true);
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return true;
    }

    // Backward depuis match solo (Pong) - Cas restant
    if (
      !hasActiveTournament() &&
      hasActiveMatch() &&
      targetPage.id !== PAGE_IDS.MATCH
    ) {
      console.log("🛑 [MATCH SOLO] Backward depuis match Pong → Arrêt du match");
      stopMatch("Navigation back/forward du navigateur");
    }

    // Backward depuis match Tron - Cas restant
    if (
      !hasActiveTournament() &&
      hasActiveTronMatch() &&
      targetPage.id !== PAGE_IDS.TRON
    ) {
      console.log("🛑 [TRON SOLO] Backward depuis match Tron → Arrêt du match");
      stopTronMatch("Navigation back/forward du navigateur");
    }

    return false;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // VÉRIFICATIONS AUTH (POPSTATE)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Vérifie l'auth lors du popstate et redirige si nécessaire
   * @returns true si une redirection a été effectuée
   */
  handlePopstateAuthChecks(path: string, isLoggedIn: boolean): boolean {
    // 🔒 Non connecté et pas sur login/signup → Redirect login
    if (!isLoggedIn && path !== '/login' && path !== '/signup') {
      console.log('🔒 [POPSTATE] Non authentifié, redirection vers login');
      this.redirectToLoginPage();
      return true;
    }

    // ✅ Connecté et sur login/signup → Redirect accueil
    if (isLoggedIn && (path === '/login' || path === '/signup')) {
      console.log('✅ [POPSTATE] Déjà authentifié, redirection vers accueil');
      activeAnotherPage(this._DO.pages.accueil);
      this.setIconsVisibility(PAGE_IDS.ACCUEIL, true);
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return true;
    }

    return false;
  }
}
