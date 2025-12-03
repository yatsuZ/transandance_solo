import { activeAnotherPage } from "./page-manager.js";
import { findPageFromUrl, updateUrl } from "../utils/url-helpers.js";
import { clear_Formulaire_Of_Tournament } from "../utils/validators.js";
import { AuthManager } from "../auth/auth-manager.js";
import { DOMElements } from "../core/dom-elements.js";
import { ProfilePageManager } from "../profile/profile-page-manager.js";
import { LeaderboardManager } from "../leaderboard/leaderboard-manager.js";
import {
  NavigationHelpers,
  PAGE_IDS,
  isContextRestrictedRoute,
  isAuthProtectedRoute,
  isPublicRoute,
  findPage
} from "./helpers.js";

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
  private profilePageManager: ProfilePageManager;
  private leaderboardManager: LeaderboardManager;
  private navHelpers: NavigationHelpers;

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
    this.profilePageManager = new ProfilePageManager(dO);
    this.leaderboardManager = new LeaderboardManager(dO);
    this.navHelpers = new NavigationHelpers(dO);

    // Initialiser le SPA (gère reload F5)
    this.initSPA();

    // Attacher les event listeners
    this.attachEventListeners();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 1️⃣ INITIALISATION DU SPA (RELOAD F5)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Initialise le système SPA au démarrage (gère reload F5)
   * ORDRE DE VÉRIFICATION :
   * 1. Route racine (/) - Redirection par défaut
   * 2. Route invalide (404)
   * 3. Auth (JWT) - Vérification côté serveur
   * 4. Routes avec contexte requis (match/tournoi)
   */
  private async initSPA(): Promise<void> {
    const currentPath = window.location.pathname;

    // 1️⃣ GESTION ROUTE RACINE - Redirection par défaut
    if (currentPath === '/') {
      // Vérifier directement le cookie côté serveur (source de vérité unique)
      const isAuthenticated = await AuthManager.verifyAuth();

      const page = this.navHelpers.resolveRootPage(isAuthenticated);
      const pageId = this.navHelpers.navigateToPage(page, isAuthenticated, true);

      if (pageId === PAGE_IDS.PROFILE) {
        this.profilePageManager.loadProfile();
      } else if (pageId === PAGE_IDS.LEADERBOARD) {
        this.leaderboardManager.loadLeaderboard();
      }
      return;
    }

    // 2️⃣ VÉRIF AUTH - Vérifier le cookie (source de vérité unique)
    const isAuthenticated = await AuthManager.verifyAuth();

    // 3️⃣ VÉRIF ROUTES AVEC CONTEXTE (match/tournoi/profil ami - accès direct interdit)
    if (isContextRestrictedRoute(currentPath)) {
      console.warn("🚫 [403] Route nécessite un contexte actif (accès direct interdit):", currentPath);
      this.navHelpers.redirectToErrorWithIcons(403, isAuthenticated);
      return;
    }

    // 4️⃣ VÉRIF 404 : Route invalide
    const targetPage = this.navHelpers.resolveTargetPage(currentPath);
    if (!targetPage) {
      console.warn("⚠️ [404] Route invalide:", currentPath);
      this.navHelpers.redirectToErrorWithIcons(404, isAuthenticated, currentPath);
      return;
    }

    // Routes publiques (login/signup) : autoriser si déconnecté, bloquer si connecté
    if (isPublicRoute(currentPath)) {
      if (isAuthenticated) {
        console.log("🚫 [403] Déjà authentifié, pour re acceder a login etc deconnecter vous dans param");
        this.navHelpers.redirectToErrorWithIcons(403, true);
        return;
      }
      // Pas connecté : autoriser l'accès
      console.log("✅ Accès autorisé à la route publique:", currentPath);
      this.navHelpers.navigateToPage(targetPage, false, false);
      return;
    }

    // Routes protégées : vérifier authentification
    if (isAuthProtectedRoute(currentPath)) {
      if (!isAuthenticated) {
        console.warn("🔒 [401] Cookie JWT invalide ou expiré:", currentPath);
        this.navHelpers.redirectToErrorWithIcons(401, false);
        return;
      }
    }

    // 5️⃣ NAVIGATION NORMALE : Afficher la page demandée
    console.log("✅ Navigation vers:", targetPage.id);
    this.navHelpers.navigateToPage(targetPage, isAuthenticated, false);

    if (targetPage.id === PAGE_IDS.PROFILE) {
      this.profilePageManager.loadProfile();
    } else if (targetPage.id === PAGE_IDS.LEADERBOARD) {
      this.leaderboardManager.loadLeaderboard();
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 2️⃣ ATTACHER LES EVENT LISTENERS
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
  // 3️⃣ EVENT BOUTONS (data-link="go_to_XXX")
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

    const targetId = "pages" + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const targetPage = findPage(this._DO.pages, targetId);
    if (targetPage === null) return;

    // Réinitialiser la page error si on la quitte
    const currentPage = this.getCurrentPage();
    this.navHelpers.resetErrorPageIfNeeded(currentPage, targetPage);

    // Gérer l'affichage des icônes
    this.navHelpers.setIconsVisibility(targetPage.id, isLoggedIn);

    // Charger les données de la page Profile ou Leaderboard si nécessaire
    if (targetPage.id === PAGE_IDS.PROFILE) {
      this.profilePageManager.loadProfile();
    } else if (targetPage.id === PAGE_IDS.LEADERBOARD) {
      this.leaderboardManager.loadLeaderboard();
    }

    // Reset inputs
    clear_Formulaire_Of_Tournament(this._DO.tournamentElement.formPseudoTournament);
    activeAnotherPage(targetPage);
    updateUrl(targetPage);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 4️⃣ EVENT NAVIGATION BACK/FORWARD (POPSTATE)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Gère la navigation back/forward du navigateur (popstate)
   * BLOQUE l'accès aux pages interdites AVANT de les afficher
   * Appelle les méthodes stop appropriées selon la situation
   */
  private async handlePopStateNavigation(event: PopStateEvent): Promise<void> {
    console.log("🔙 Navigation back/forward détectée:", window.location.pathname);

    const path = window.location.pathname;

    // 🏠 ROUTE RACINE - Vérifier auth avant de rediriger
    if (path === '/') {
      // Vérifier directement le cookie côté serveur (source de vérité unique)
      const isAuthenticated = await AuthManager.verifyAuth();

      const specialPageId = this.navHelpers.handleSpecialRoutes(path, isAuthenticated);
      if (specialPageId) {
        if (specialPageId === PAGE_IDS.PROFILE) {
          this.profilePageManager.loadProfile();
        }
      }
      return;
    }

    // 👥 ROUTE PROFIL AMI - /profile/ami/:username
    const friendProfileMatch = path.match(/^\/profile\/ami\/([^\/]+)$/);
    if (friendProfileMatch) {
      const friendUsername = friendProfileMatch[1];
      const isAuthenticated = await AuthManager.verifyAuth();

      if (!isAuthenticated) {
        console.warn("🔒 [401] Cookie JWT invalide ou expiré:", path);
        this.navHelpers.redirectToErrorWithIcons(401, false);
        return;
      }

      // Afficher la page profile
      const profilePage = this._DO.pages.profile;
      this.navHelpers.setIconsVisibility(profilePage.id, true);
      activeAnotherPage(profilePage);

      // Charger le profil de l'ami
      this.profilePageManager.loadProfile(friendUsername);
      return;
    }

    // 🔒 VÉRIF AUTH - Vérifier le cookie (source de vérité unique)
    const isAuthenticated = await AuthManager.verifyAuth();

    // Routes publiques (login/signup) : autoriser si déconnecté, bloquer si connecté
    if (isPublicRoute(path)) {
      if (isAuthenticated) {
        console.log("🚫 [403] Déjà authentifié, redirection depuis route publique");
        this.navHelpers.redirectToErrorWithIcons(403, true);
        return;
      }
      // Pas connecté : autoriser l'accès
      console.log("✅ Accès autorisé à la route publique (popstate):", path);
      const targetPage = findPageFromUrl(path, this._DO.pages);
      if (targetPage) {
        this.navHelpers.setIconsVisibility(targetPage.id, false);
        activeAnotherPage(targetPage);
      }
      return;
    }

    // Routes protégées : vérifier authentification
    if (isAuthProtectedRoute(path) || isContextRestrictedRoute(path)) {
      if (!isAuthenticated) {
        console.warn("🔒 [401] Cookie JWT invalide ou expiré:", path);
        this.navHelpers.redirectToErrorWithIcons(401, false);
        return;
      }
    }

    // 🔀 Routes spéciales (/error)
    const specialPageId = this.navHelpers.handleSpecialRoutes(path, isAuthenticated);
    if (specialPageId) {
      // Charger Profile si c'est la page affichée
      if (specialPageId === PAGE_IDS.PROFILE) {
        this.profilePageManager.loadProfile();
      }
      return;
    }

    const targetPage = findPageFromUrl(path, this._DO.pages);

    // 404 - Page introuvable
    if (!targetPage) {
      console.error("[popstate] Impossible de trouver la page pour:", path);
      this.navHelpers.redirectToErrorWithIcons(404, isAuthenticated, path);
      return;
    }

    const currentPage = this.getCurrentPage();

    // Reset page error si on la quitte (sauf 404)
    this.navHelpers.resetErrorPageIfNeeded(currentPage, targetPage);

    // 🚫 Vérifier les restrictions de contexte (match/tournoi)
    if (this.navHelpers.checkContextRestrictions(
      path,
      targetPage,
      isAuthenticated,
      () => this.tournamentController.hasActiveTournament(),
      () => this.matchController.hasActiveMatch()
    )) {
      return;
    }

    // 🛑 Cleanup des contextes actifs
    if (this.navHelpers.handleContextCleanup(
      currentPage,
      targetPage,
      () => this.tournamentController.hasActiveTournament(),
      () => this.matchController.hasActiveMatch(),
      (reason) => this.tournamentController.stopTournament(reason),
      (reason) => this.matchController.stopMatch(reason)
    )) {
      return;
    }

    // ✅ Afficher la nouvelle page
    this.navHelpers.setIconsVisibility(targetPage.id, isAuthenticated);

    // Charger les données de la page Profile ou Leaderboard si nécessaire
    if (targetPage.id === PAGE_IDS.PROFILE) {
      this.profilePageManager.loadProfile();
    } else if (targetPage.id === PAGE_IDS.LEADERBOARD) {
      this.leaderboardManager.loadLeaderboard();
    }

    activeAnotherPage(targetPage);
    console.log("✅ Page affichée:", targetPage.id);
  }
}
