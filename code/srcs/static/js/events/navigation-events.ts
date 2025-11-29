import { activeAnotherPage, activeOrHiden, findPage } from "../navigation/page-manager.js";
import { findPageFromUrl, redirectToError, resetErrorPage, updateUrl } from "../utils/url-helpers.js";
import { isContextRestrictedRoute, isAuthProtectedRoute, isPublicRoute } from "../navigation/route-config.js";
import { clear_Formulaire_Of_Tournament } from "../utils/validators.js";
import { AuthManager } from "../auth/auth-manager.js";
import { DOMElements } from "../core/dom-elements.js";

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
      this.showErrorPage(404, isLoggedIn, currentPath);
      return;
    }

    // 3️⃣ VÉRIF AUTH (AVANT LE CONTEXTE)
    // Si route protégée mais pas de JWT → 403
    if ((isAuthProtectedRoute(currentPath) || isContextRestrictedRoute(currentPath)) && !isLoggedIn) {
      console.warn("🔒 [403] Accès interdit sans JWT:", currentPath);
      this.showErrorPage(403, isLoggedIn);
      return;
    }

    // Si déjà connecté et sur login/signup → Redirect accueil
    if (isLoggedIn && isPublicRoute(currentPath)) {
      console.log("🚫 [403] Déjà authentifié, pour re acceder a login etc deconecter vous dans param :", currentPath);
      this.showErrorPage(403, isLoggedIn);
      return;
    }

    // 4️⃣ VÉRIF ROUTES AVEC CONTEXTE (match/tournoi actif requis)
    if (isContextRestrictedRoute(currentPath)) {
      console.warn("🚫 [403] Route nécessite un contexte actif:", currentPath);
      this.showErrorPage(403, isLoggedIn);
      return;
    }

    // 5️⃣ NAVIGATION NORMALE : Afficher la page demandée
    console.log("✅ Navigation vers:", targetPage.id);
    this.navigateToPage(targetPage, isLoggedIn);
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
   * Affiche une page d'erreur (403 ou 404)
   */
  private showErrorPage(errorCode: number, isLoggedIn: boolean, originalUrl?: string): void {
    const errorPage = redirectToError(errorCode, this._DO, originalUrl);
    this.updateIconsForPage(errorPage, isLoggedIn);
    activeAnotherPage(errorPage);
  }

  /**
   * Navigue vers une page et gère l'affichage des icônes
   */
  private navigateToPage(page: HTMLElement, isLoggedIn: boolean, replaceHistory = false): void {
    // Gérer les icônes selon JWT et page
    this.updateIconsForPage(page, isLoggedIn);

    // Activer la page
    activeAnotherPage(page);

    // Mettre à jour l'URL
    if (replaceHistory) {
      const pageName = page.id.slice("pages".length).toLowerCase();
      window.history.replaceState({ page: pageName }, "", `/${pageName}`);
    }
  }

  /**
   * Gère l'affichage des icônes selon la page et l'auth
   * - Pas de JWT → Tout caché
   * - Avec JWT → Dépend de la page
   */
  private updateIconsForPage(page: HTMLElement, isLoggedIn: boolean): void {
    const iconAccueil = this._DO.icons.accueil;
    const iconSettings = this._DO.icons.settings;

    // Pas de JWT → Tout caché
    if (!isLoggedIn) {
      activeOrHiden(iconAccueil, "Off");
      activeOrHiden(iconSettings, "Off");
      return;
    }

    // Avec JWT → Dépend de la page
    if (page.id === "pagesAccueil") {
      activeOrHiden(iconAccueil, "Off");
      activeOrHiden(iconSettings, "On");
    } else if (page.id === "pagesParametre") {
      activeOrHiden(iconAccueil, "On");
      activeOrHiden(iconSettings, "Off");
    } else {
      activeOrHiden(iconAccueil, "On");
      activeOrHiden(iconSettings, "On");
    }
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
    if (!get_data_link || get_data_link.startsWith("go_to_") === false)
      return console.log("it s not a data-link for redirection:", get_data_link);

    const pageName = get_data_link.slice("go_to_".length);
    const isLoggedIn = AuthManager.isLoggedIn();

    // 🔒 BLOQUER navigation vers login/signup si déjà connecté
    if (isLoggedIn && (pageName === "Login" || pageName === "Signup")) {
      console.log('🔒 Déjà connecté, navigation vers login/signup bloquée');
      return;
    }

    // 🔒 BLOQUER navigation vers pages protégées si pas connecté → REDIRIGER VERS LOGIN
    const protectedPages = ["Accueil", "accueil", "Game_Config", "Begin_Tournament", "Parametre", "parametre"];
    if (!isLoggedIn && protectedPages.includes(pageName)) {
      console.log('🔒 Non authentifié, redirection vers login');
      const loginPage = redirectToError(403,this._DO);
      activeOrHiden(this._DO.icons.accueil, "Off");
      activeOrHiden(this._DO.icons.settings, "Off");
      activeAnotherPage(loginPage);
      updateUrl(loginPage);
      return;
    }

    const iconAccueil = this._DO.icons.accueil;
    const iconSettings = this._DO.icons.settings;

    // Gérer l'affichage des icônes selon la page active
    if (pageName === "Login" || pageName === "Signup")
    {
      activeOrHiden(iconSettings, "Off");
      activeOrHiden(iconAccueil, "Off");
    }
    else
    {
      activeOrHiden(iconAccueil, pageName === "accueil" ? "Off" : "On");
      activeOrHiden(iconSettings, pageName === "parametre" ? "Off" : "On");
    }

    const targetId = "pages" + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const targetPage = findPage(this._DO.pages, targetId);
    if (targetPage === null) return;

    // Réinitialiser la page error si on la quitte (sauf si c'est une 404)
    const currentPage = this.getCurrentPage();
    if (currentPage?.id === "pagesError") {
      const errorCodeEl = this._DO.errorElement.codeEl;
      const errorCodeText = errorCodeEl.textContent || '';
      const is404 = errorCodeText.includes("404");

      if (!is404) {
        console.log("🔄 Réinitialisation de la page error (code 0)");
        resetErrorPage(0, this._DO);
      } else {
        console.log("📌 Page error 404 conservée pour navigation back/forward");
      }
    }

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

    // 🔒 VÉRIF AUTH : Si pas connecté et pas sur login/signup → Redirect login
    if (!isLoggedIn && path !== '/login' && path !== '/signup') {
      console.log('🔒 [POPSTATE] Non authentifié, redirection vers login');
      activeAnotherPage(this._DO.pages.login);
      activeOrHiden(this._DO.icons.accueil, "Off");
      activeOrHiden(this._DO.icons.settings, "Off");
      updateUrl(this._DO.pages.login);
      return;
    }

    // ✅ VÉRIF AUTH : Si connecté et sur login/signup → Redirect accueil
    if (isLoggedIn && (path === '/login' || path === '/signup')) {
      console.log('✅ [POPSTATE] Déjà authentifié, redirection vers accueil');
      activeAnotherPage(this._DO.pages.accueil);
      activeOrHiden(this._DO.icons.accueil, "Off");
      activeOrHiden(this._DO.icons.settings, "On");
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return;
    }

    const targetPage = findPageFromUrl(path, this._DO.pages);

    if (!targetPage) {
      console.error("[popstate] Impossible de trouver la page pour:", path);
      // Rediriger vers page d'erreur 404
      activeAnotherPage(redirectToError(404, this._DO, path));
      if (isLoggedIn) {
        activeOrHiden(this._DO.icons.accueil, "On");
        activeOrHiden(this._DO.icons.settings, "On");
      } else {
        activeOrHiden(this._DO.icons.accueil, "Off");
        activeOrHiden(this._DO.icons.settings, "Off");
      }
      return;
    }

    const allowedTournamentPages = [
      this._DO.pages.match.id,
      this._DO.pages.result.id,
      this._DO.pages.treeTournament.id,
    ];

    const currentPage = this.getCurrentPage();

    // ===== RESET : Réinitialiser la page error si on la quitte (sauf 404) =====
    if (currentPage?.id === "pagesError" && targetPage.id !== "pagesError") {
      const errorCodeEl = this._DO.errorElement.codeEl;
      const errorCodeText = errorCodeEl.textContent || '';
      const is404 = errorCodeText.includes("404");

      if (!is404) {
        console.log("🔄 Réinitialisation de la page error (code 0)");
        resetErrorPage(0, this._DO);
      } else {
        console.log("📌 Page error 404 conservée pour navigation back/forward");
      }
    }

    // ===== BLOCAGES : Interdire l'accès AVANT d'afficher la page =====

    if (path === "/") {
      activeAnotherPage(this._DO.pages.accueil);
      activeOrHiden(this._DO.icons.accueil, "Off");
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return;
    }

    // Si on navigue vers /error via back/forward, afficher la page error avec code 0
    if (path === "/error") {
      console.log("🔄 Navigation vers /error → Affichage code 0");
      resetErrorPage(0, this._DO);
      activeAnotherPage(this._DO.pages.error);
      const isLoggedIn = AuthManager.isLoggedIn();
      if (isLoggedIn) {
        activeOrHiden(this._DO.icons.accueil, "On");
        activeOrHiden(this._DO.icons.settings, "On");
      } else {
        activeOrHiden(this._DO.icons.accueil, "Off");
        activeOrHiden(this._DO.icons.settings, "Off");
      }
      return;
    }

    // BLOCAGE 2 : Interdire l'accès à la page match si aucun match actif (hors tournoi)
    if (
      !this.tournamentController.hasActiveTournament() &&
      !this.matchController.hasActiveMatch() &&
      ((targetPage.id === "pagesMatch" && path === "/match") ||
        (targetPage.id === "pagesResult" && path === "/match/result"))
    ) {
      console.log("🚫 [MATCH SOLO] Accès interdit : Aucun match classique actif → Redirection page d'erreur");
      activeAnotherPage(redirectToError(403, this._DO));
      const isLoggedIn = AuthManager.isLoggedIn();
      if (isLoggedIn) {
        activeOrHiden(this._DO.icons.accueil, "On");
        activeOrHiden(this._DO.icons.settings, "On");
      } else {
        activeOrHiden(this._DO.icons.accueil, "Off");
        activeOrHiden(this._DO.icons.settings, "Off");
      }
      return;
    }

    // BLOCAGE 1 : Interdire l'accès aux pages de tournoi si aucun tournoi actif
    if (!this.tournamentController.hasActiveTournament() && allowedTournamentPages.includes(targetPage.id)) {
      console.log("🚫 [TOURNOI] Accès interdit : Aucun tournoi actif → Redirection page d'erreur");
      activeAnotherPage(redirectToError(403, this._DO));
      const isLoggedIn = AuthManager.isLoggedIn();
      if (isLoggedIn) {
        activeOrHiden(this._DO.icons.accueil, "On");
        activeOrHiden(this._DO.icons.settings, "On");
      } else {
        activeOrHiden(this._DO.icons.accueil, "Off");
        activeOrHiden(this._DO.icons.settings, "Off");
      }
      return;
    }

    // ===== CLEANUP : Arrêter match/tournoi si on quitte leurs pages =====

    // CAS SPÉCIAL 1 : Si on fait BACKWARD depuis une page de TOURNOI
    // → Arrêter le tournoi ET rediriger vers accueil directement
    if (this.tournamentController.hasActiveTournament() && allowedTournamentPages.includes(currentPage?.id ?? "")) {
      console.log("🛑 [TOURNOI] Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      this.tournamentController.stopTournament("Backward depuis tournoi → Arrêt du tournoi et redirection accueil");
      // Forcer la redirection vers accueil
      activeAnotherPage(this._DO.pages.accueil);
      activeOrHiden(this._DO.icons.accueil, "Off");
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return;
    }

    // Si on quitte la page match (et pas dans un tournoi), stopper le match solo
    if (
      !this.tournamentController.hasActiveTournament() &&
      this.matchController.hasActiveMatch() &&
      targetPage.id !== "pagesMatch"
    ) {
      console.log("🛑 [MATCH SOLO] Backward depuis match classique → Arrêt du match");
      this.matchController.stopMatch("Navigation back/forward du navigateur");
    }

    // ===== AFFICHAGE : Afficher la nouvelle page =====

    const pageName = targetPage.id.slice("pages".length).toLowerCase();

    // Mettre à jour les icônes
    activeOrHiden(this._DO.icons.accueil, pageName === "accueil" ? "Off" : "On");
    activeOrHiden(this._DO.icons.settings, pageName === "parametre" ? "Off" : "On");

    // Afficher la page
    activeAnotherPage(targetPage);
    console.log("✅ Page affichée:", targetPage.id);
  }
}
