import { activeAnotherPage, activeOrHiden, findPage } from "../navigation/page-manager.js";
import { findPageFromUrl, redirectToError, resetErrorPage, updateUrl } from "../utils/url-helpers.js";
import { isRestrictedRoute } from "../navigation/route-config.js";
import { clear_Formulaire_Of_Tournament } from "../utils/validators.js";
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
   */
  private initSPA(): void {
    let activePage = this.getCurrentPage();
    const iconAccueil = this._DO.icons.accueil;
    const iconSettings = this._DO.icons.settings;

    if (!activePage) {
      console.error("Pas reussie a recupere .active");
      return;
    }

    // GÉRER LE RELOAD (F5) : Valider et restaurer la page depuis l'URL
    const currentPath = window.location.pathname;

    // Vérifier si la route actuelle est interdite
    if (isRestrictedRoute(currentPath)) {
      console.warn("🚫 Accès direct interdit à:", currentPath);

      // Rediriger vers la page d'erreur 403 (Accès interdit)
      activePage = redirectToError(403,this._DO);
      // Afficher les icônes sur la page d'erreur
      activeOrHiden(iconAccueil, "On");
      activeOrHiden(iconSettings, "On");
    } else if (currentPath !== '/' && currentPath !== '/accueil') {
      console.log("🔄 Reload détecté, restauration de la page depuis l'URL:", currentPath);
      const pageToRestore = findPageFromUrl(currentPath, this._DO.pages);

      if (pageToRestore) {
        activePage = pageToRestore;
      } else {
        console.warn("⚠️ Route invalide:", currentPath, "→ Redirection vers page d'erreur");

        // Rediriger vers la page d'erreur 404 (Page introuvable)
        activePage = redirectToError(404, this._DO, currentPath);
        // Afficher les icônes sur la page d'erreur
        activeOrHiden(iconAccueil, "On");
        activeOrHiden(iconSettings, "On");
      }
    }

    // Gérer l'affichage des icônes selon la page active
    if (activePage.id === "pagesLogin" || activePage.id === "pagesSignup")
    {
      activeOrHiden(iconSettings, "Off");
      activeOrHiden(iconAccueil, "Off");
      console.log("OUI");
    }
    else
    {
      console.log("NON");
      if (activePage.id !== "pagesAccueil")
        activeOrHiden(iconAccueil, "On");
      else
        activeOrHiden(iconAccueil, "Off"); 
      if (activePage.id === "pagesParametre")
        activeOrHiden(iconSettings, "Off");
      else
        activeOrHiden(iconSettings, "On");
    }

    // Activer la page initiale
    activeAnotherPage(activePage);

    // Mettre à jour l'URL seulement si on est sur la racine
    if (currentPath === '/' || currentPath === '/accueil')
      updateUrl(activePage);
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
    const targetPage = findPageFromUrl(path, this._DO.pages);

    if (!targetPage) {
      console.error("[popstate] Impossible de trouver la page pour:", path);
      // Rediriger vers page d'erreur 404
      activeAnotherPage(redirectToError(404, this._DO, path));
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
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
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
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
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
      return;
    }

    // BLOCAGE 1 : Interdire l'accès aux pages de tournoi si aucun tournoi actif
    if (!this.tournamentController.hasActiveTournament() && allowedTournamentPages.includes(targetPage.id)) {
      console.log("🚫 [TOURNOI] Accès interdit : Aucun tournoi actif → Redirection page d'erreur");
      activeAnotherPage(redirectToError(403, this._DO));
      activeOrHiden(this._DO.icons.accueil, "On");
      activeOrHiden(this._DO.icons.settings, "On");
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
