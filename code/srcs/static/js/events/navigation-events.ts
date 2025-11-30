import { activeAnotherPage, activeOrHiden, findPage } from "../navigation/page-manager.js";
import { findPageFromUrl, redirectToError, resetErrorPage, updateUrl } from "../utils/url-helpers.js";
import { isContextRestrictedRoute, isAuthProtectedRoute, isPublicRoute } from "../navigation/route-config.js";
import { clear_Formulaire_Of_Tournament } from "../utils/validators.js";
import { AuthManager } from "../auth/auth-manager.js";
import { DOMElements } from "../core/dom-elements.js";

/**
 * Constantes pour les noms de pages
 */
const PAGE_IDS = {
  ACCUEIL: "pagesAccueil",
  LOGIN: "pagesLogin",
  SIGNUP: "pagesSignup",
  MATCH: "pagesMatch",
  RESULT: "pagesResult",
  ERROR: "pagesError",
  PARAMETRE: "pagesParametre",
  TREE_TOURNAMENT: "pagesTree_Tournament",
} as const;

const PROTECTED_PAGE_NAMES = ["Accueil", "Game_Config", "Begin_Tournament", "Parametre"];

/**
 * Classe pour gérer TOUTE la navigation de l'application
 * - Initialisation du SPA (reload F5)
 * - Navigation via boutons
 * - Navigation back/forward (popstate)
 */
export class NavigationEvents {
  private _DO: DOMElements;
  private matchController: { hasActiveMatch: () => boolean; stopMatch: (reason: string) => void };
  private tournamentController: { hasActiveTournament: () => boolean; stopTournament: (reason: string) => void };
  private getCurrentPage: () => HTMLElement | null;

  constructor(
    dO: DOMElements,
    matchController: { hasActiveMatch: () => boolean; stopMatch: (reason: string) => void },
    tournamentController: { hasActiveTournament: () => boolean; stopTournament: (reason: string) => void },
    getCurrentPage: () => HTMLElement | null
  ) {
    this._DO = dO;
    this.matchController = matchController;
    this.tournamentController = tournamentController;
    this.getCurrentPage = getCurrentPage;

    // Initialiser le SPA (gère reload F5)
    this.initSPA();

    // Attacher les event listeners
    this.attachEventListeners();
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Chargement de la page de base
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Initialise le système SPA au démarrage (gère reload F5)
   * ORDRE DE VÉRIFICATION :
   * 1. Route racine (/) - Redirection par défaut
   * 2. Route invalide (404)
   * 3. Auth (JWT)
   * 4. Routes avec contexte requis (match/tournoi)
   */
  private initSPA(): void {
    const currentPath = window.location.pathname;
    const isLoggedIn = AuthManager.isLoggedIn();

    // 1️⃣ GESTION ROUTE RACINE - Redirection par défaut
    if (currentPath === '/') {
      this.handleRootPath(isLoggedIn);
      return;
    }

    // 2️⃣ VÉRIF 404 : Route invalide
    const targetPage = this.resolveTargetPage(currentPath);
    if (!targetPage) {
      console.warn("⚠️ [404] Route invalide:", currentPath);
      this.redirectToErrorWithIcons(404, isLoggedIn, currentPath);
      return;
    }

    // 3️⃣ VÉRIF AUTH (AVANT LE CONTEXTE)
    // Si route protégée mais pas de JWT → 403
    if (!isLoggedIn && (isAuthProtectedRoute(currentPath) || isContextRestrictedRoute(currentPath))) {
      console.warn("🔒 [403] Accès interdit sans JWT:", currentPath);
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return;
    }

    // Si déjà connecté et sur login/signup → Redirect accueil
    if (isLoggedIn && isPublicRoute(currentPath)) {
      console.log("🚫 [403] Déjà authentifié, pour re acceder a login etc deconecter vous dans param :", currentPath);
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return;
    }

    // 4️⃣ VÉRIF ROUTES AVEC CONTEXTE (match/tournoi actif requis)
    if (isContextRestrictedRoute(currentPath)) {
      console.warn("🚫 [403] Route nécessite un contexte actif:", currentPath);
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return;
    }

    // 5️⃣ NAVIGATION NORMALE : Afficher la page demandée
    console.log("✅ Navigation vers:", targetPage.id);
    this.navigateToPage(targetPage, isLoggedIn);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // On attache les events
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Attache tous les event listeners (boutons + popstate)
   */
  private attachEventListeners(): void {
    // Event listeners pour les boutons de navigation
    const linkButtons = this._DO.buttons.linkButtons;
    linkButtons.forEach(btn => {
      btn.addEventListener("click", (e) => this.handleButtonClick(e));
    });

    // Event listener pour back/forward du navigateur
    window.addEventListener("popstate", (event) => this.handlePopStateNavigation(event));
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Les différent events
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Gère les clics sur les boutons de navigation
   */
  private handleButtonClick(e: PointerEvent): void {
    e.preventDefault();
    const target = (e.target as Element | null);
    const link = target?.closest("button[data-link]");
    if (!link) return console.error("Bouton avec data-link introuvable");

    const get_data_link = link.getAttribute("data-link");
    if (!get_data_link || !get_data_link.startsWith("go_to_"))
      return console.log("it s not a data-link for redirection:", get_data_link);

    const pageName = get_data_link.slice("go_to_".length);
    const isLoggedIn = AuthManager.isLoggedIn();

// cette partie la peut etre considerer comme obsolete 

///// d'ici a 

    // BLOQUER navigation vers login/signup si déjà connecté
    if (isLoggedIn && (pageName === "Login" || pageName === "Signup")) {
      console.log('🔒 Déjà connecté, navigation vers login/signup bloquée');
      return;
    }

    // BLOQUER navigation vers pages protégées si pas connecté → REDIRIGER VERS LOGIN
    if (!isLoggedIn && PROTECTED_PAGE_NAMES.includes(pageName)) {
      console.log('🔒 Non authentifié, redirection vers login');
      this.redirectToErrorWithIcons(403, false);
      updateUrl(this._DO.pages.error);
      return;
    }

////// LA

    const targetId = "pages" + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const targetPage = findPage(this._DO.pages, targetId);
    if (targetPage === null) return;

    // Réinitialiser la page error si on la quitte
    const currentPage = this.getCurrentPage();
    this.resetErrorPageIfNeeded(currentPage, targetPage);

    // Gérer l'affichage des icônes
    this.setIconsVisibility(targetPage.id, isLoggedIn);

    // Reset inputs
    clear_Formulaire_Of_Tournament(this._DO.tournamentElement.formPseudoTournament);
    activeAnotherPage(targetPage);
    updateUrl(targetPage);
  }

  /**
   * Gère la navigation back/forward du navigateur (popstate)
   * BLOQUE l'accès aux pages interdites AVANT de les afficher
   * Appelle les méthodes stop appropriées selon la situation
   */
  private handlePopStateNavigation(event: PopStateEvent): void {
    console.log("🔙 Navigation back/forward détectée:", window.location.pathname);

    const path = window.location.pathname;
    const isLoggedIn = AuthManager.isLoggedIn();

    // 🔒 Vérifications d'authentification
    if (this.handlePopstateAuthChecks(path, isLoggedIn))
      return;

    // 🔀 Routes spéciales (/, /error)
    if (this.handleSpecialRoutes(path, isLoggedIn)) {
      return;
    }

    const targetPage = findPageFromUrl(path, this._DO.pages);

    // 404 - Page introuvable
    if (!targetPage) {
      console.error("[popstate] Impossible de trouver la page pour:", path);
      this.redirectToErrorWithIcons(404, isLoggedIn, path);
      return;
    }

    const currentPage = this.getCurrentPage();

    // Reset page error si on la quitte (sauf 404)
    this.resetErrorPageIfNeeded(currentPage, targetPage);

    // 🚫 Vérifier les restrictions de contexte (match/tournoi)
    if (this.checkContextRestrictions(path, targetPage, isLoggedIn)) {
      return;
    }

    // 🛑 Cleanup des contextes actifs
    if (this.handleContextCleanup(currentPage, targetPage)) {
      return;
    }

    // ✅ Afficher la nouvelle page
    this.setIconsVisibility(targetPage.id, isLoggedIn);
    activeAnotherPage(targetPage);
    console.log("✅ Page affichée:", targetPage.id);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Méthodes utilitaires pour réduire la duplication
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Gère l'affichage des icônes selon la page et l'état d'authentification
   * Centralise toute la logique des icônes pour éviter la duplication
   */
  private setIconsVisibility(pageId: string, isLoggedIn: boolean): void {
    const iconAccueil = this._DO.icons.accueil;
    const iconSettings = this._DO.icons.settings;

    if (!isLoggedIn) {
      activeOrHiden(iconAccueil, "Off");
      activeOrHiden(iconSettings, "Off");
      return;
    }

    const showAccueil = pageId !== PAGE_IDS.ACCUEIL;
    const showSettings = pageId !== PAGE_IDS.PARAMETRE;

    activeOrHiden(iconAccueil, showAccueil ? "On" : "Off");
    activeOrHiden(iconSettings, showSettings ? "On" : "Off");
  }

  /**
   * Redirige vers une page d'erreur et gère les icônes
   */
  private redirectToErrorWithIcons(errorCode: number, isLoggedIn: boolean, originalUrl?: string): void {
    const errorPage = redirectToError(errorCode, this._DO, originalUrl);
    this.setIconsVisibility(errorPage.id, isLoggedIn);
    activeAnotherPage(errorPage);
  }

  /**
   * Redirige vers la page de login et cache toutes les icônes
   */
  private redirectToLoginPage(): void {
    const loginPage = this._DO.pages.login;
    this.setIconsVisibility(loginPage.id, false);
    activeAnotherPage(loginPage);
    updateUrl(loginPage);
  }

  /**
   * Réinitialise la page d'erreur si nécessaire (hors 404)
   */
  private resetErrorPageIfNeeded(currentPage: HTMLElement | null, targetPage: HTMLElement): void {
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

//////////////////////////// UTILS

  /**
   * Résout la page cible depuis l'URL
   * @returns La page ou null si invalide (404)
   */
  private resolveTargetPage(path: string): HTMLElement | null {
    if (path === '/') return null; // Géré séparément
    return findPageFromUrl(path, this._DO.pages);
  }

  /**
   * Gère la navigation vers la route racine "/"
   */
  private handleRootPath(isLoggedIn: boolean): void {
    if (isLoggedIn) {
      console.log("🏠 Route racine → Accueil (connecté)");
      this.navigateToPage(this._DO.pages.accueil, isLoggedIn, true);
    } else {
      console.log("🔒 Route racine → Login (non connecté)");
      this.navigateToPage(this._DO.pages.login, isLoggedIn, true);
    }
  }

  /**
   * Navigue vers une page et gère l'affichage des icônes
   */
  private navigateToPage(page: HTMLElement, isLoggedIn: boolean, replaceHistory = false): void {
    // Gérer les icônes selon JWT et page
    this.setIconsVisibility(page.id, isLoggedIn);

    // Activer la page
    activeAnotherPage(page);

    // Mettre à jour l'URL
    if (replaceHistory) {
      const pageName = page.id.slice("pages".length).toLowerCase();
      window.history.replaceState({ page: pageName }, "", `/${pageName}`);
    }
  }

  /**
   * Gère les cas spéciaux de routes (/, /error)
   * @returns true si une route spéciale a été traitée
   */
  private handleSpecialRoutes(path: string, isLoggedIn: boolean): boolean {
    // Route racine
    if (path === "/") {
      this.handleRootPath(isLoggedIn);
      return true;
    }

    // Route error
    if (path === "/error") {
      console.log("🔄 Navigation vers /error → Affichage code 0");
      resetErrorPage(0, this._DO);
      activeAnotherPage(this._DO.pages.error);
      this.setIconsVisibility(PAGE_IDS.ERROR, isLoggedIn);
      return true;
    }

    return false;
  }

  /**
   * Vérifie les blocages de contexte (match/tournoi)
   * @returns true si l'accès est bloqué
   */
  private checkContextRestrictions(path: string, targetPage: HTMLElement, isLoggedIn: boolean): boolean {
    const allowedTournamentPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    // BLOCAGE 1 : Match solo sans contexte
    if (
      !this.tournamentController.hasActiveTournament() &&
      !this.matchController.hasActiveMatch() &&
      ((targetPage.id === PAGE_IDS.MATCH && path === "/match") ||
        (targetPage.id === PAGE_IDS.RESULT && path === "/match/result"))
    ) {
      console.log("🚫 [MATCH SOLO] Accès interdit : Aucun match classique actif");
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return true;
    }

    // BLOCAGE 2 : Tournoi sans contexte
    if (!this.tournamentController.hasActiveTournament() && allowedTournamentPages.includes(targetPage.id)) {
      console.log("🚫 [TOURNOI] Accès interdit : Aucun tournoi actif");
      this.redirectToErrorWithIcons(403, isLoggedIn);
      return true;
    }

    return false;
  }

  /**
   * Gère le cleanup des contextes actifs lors de la navigation
   */
  private handleContextCleanup(currentPage: HTMLElement | null, targetPage: HTMLElement): boolean {
    const allowedTournamentPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    // Backward depuis tournoi → Arrêt et redirection accueil
    if (this.tournamentController.hasActiveTournament() && allowedTournamentPages.includes(currentPage?.id ?? "")) {
      console.log("🛑 [TOURNOI] Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      this.tournamentController.stopTournament("Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      activeAnotherPage(this._DO.pages.accueil);
      this.setIconsVisibility(PAGE_IDS.ACCUEIL, true);
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return true;
    }

    // Backward depuis match solo
    if (
      !this.tournamentController.hasActiveTournament() &&
      this.matchController.hasActiveMatch() &&
      targetPage.id !== PAGE_IDS.MATCH
    ) {
      console.log("🛑 [MATCH SOLO] Backward depuis match classique → Arrêt du match");
      this.matchController.stopMatch("Navigation back/forward du navigateur");
    }

    return false;
  }


  /**
   * Vérifie l'auth lors du popstate et redirige si nécessaire
   * @returns true si une redirection a été effectuée
   */
  private handlePopstateAuthChecks(path: string, isLoggedIn: boolean): boolean {
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
