import { initMusicSystem, initVolumeControl } from './ui/music-manager.js';
import { update_description_de_page } from './ui/description-manager.js';
import { activeOrHiden } from './navigation/page-manager.js';
import { MatchController } from './game-management/match-controller.js';
import { TournamentController } from './game-management/tournament-controller.js';
import { NavigationEvents } from './navigation/navigation-events.js';
import { AuthEvents } from './auth/auth-events.js';
import { TwoFAManager } from './auth/twofa-manager.js';
import { DOMElements } from './core/dom-elements.js';

/**
 * Classe principale pour orchestrer l'application
 * Délègue les responsabilités aux controllers spécialisés
 */
export class SiteManagement {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Les Attributs
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Page active (statique pour accès global)
  private static currentActivePage: HTMLElement | null = null;

  // Éléments du DOM
  private _DO: DOMElements;

  // Controllers
  private matchController: MatchController | null = null;
  private tournamentController: TournamentController | null = null;
  private navigationEvents: NavigationEvents | null = null;
  private authEvents: AuthEvents | null = null;
  private twofaManager: TwoFAManager | null = null;
  private customizationManager: any = null;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Constructeur et Initialisation
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(all_DocumentObjet: DOMElements) {
    this._DO = all_DocumentObjet;
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  /**
   * Initialisation principale de l'application
   */
  private init() {
    SiteManagement.activePage = null;

    // Attendre que le CSS soit chargé avant d'initialiser la navigation
    this.waitForStyleThenInit();
  }

  /**
   * Attend que le CSS soit chargé avant d'initialiser
   */
  private waitForStyleThenInit() {
    const do_style = this._DO.style;
    if (!do_style) return console.error("Pas reussie a recupere style.css");

    if (do_style.sheet)
      this.initApp();
    else
      do_style.addEventListener("load", () => this.initApp());
  }

  /**
   * Initialise tous les systèmes de l'application
   */
  private async initApp() {
    // Initialiser les systèmes de base
    await initMusicSystem(this._DO);
    await initVolumeControl(this._DO);
    update_description_de_page(this._DO);
    this.initLogoutButton();

    // Initialiser les controllers
    this.matchController = new MatchController(this._DO, () => SiteManagement.currentActivePage);
    this.tournamentController = new TournamentController(this._DO, () => SiteManagement.currentActivePage);

    // Initialiser NavigationEvents (gère TOUTES les redirections + navigation)
    this.navigationEvents = new NavigationEvents(
      this._DO,
      this.matchController,
      this.tournamentController,
      () => SiteManagement.currentActivePage
    );

    // Initialiser AuthEvents (gère les événements des formulaires login/signup)
    this.authEvents = new AuthEvents(this._DO);

    // Initialiser TwoFAManager (gère le 2FA dans les paramètres)
    this.twofaManager = new TwoFAManager(this._DO);
    // Initialiser le statut 2FA quand la page paramètres est active
    this.init2FAOnParametresPage();

    // Initialiser CustomizationManager quand la page custom est active
    this.initCustomizationOnCustomPage();

    // APRÈS l'initialisation de la navigation, vérifier si on doit démarrer un match au chargement
    this.matchController.initMatchOnStartup(() => SiteManagement.currentActivePage);
  }

  /**
   * Initialise le 2FA quand la page paramètres devient active
   */
  private init2FAOnParametresPage() {
    let twofaInitialized = false;

    // Observer le changement de page
    const checkParametresPage = () => {
      if (SiteManagement.currentActivePage === this._DO.pages.parametre) {
        if (!twofaInitialized) {
          this.twofaManager?.init();
          twofaInitialized = true;
        }
      } else {
        // Reset quand on quitte la page paramètres
        twofaInitialized = false;
      }
    };

    // Vérifier toutes les 500ms si on est sur la page paramètres
    setInterval(checkParametresPage, 500);
  }

  /**
   * Initialise la customization quand la page custom devient active
   */
  private initCustomizationOnCustomPage() {
    let customInitialized = false;

    // Observer le changement de page
    const checkCustomPage = () => {
      if (SiteManagement.currentActivePage === this._DO.pages.custom) {
        if (!customInitialized) {
          import('./customization/customization-manager.js').then(({ CustomizationManager }) => {
            this.customizationManager = new CustomizationManager();
            customInitialized = true;
          });
        }
      }
      // NE PAS reset customInitialized pour éviter de créer plusieurs managers
      // et d'ajouter plusieurs event listeners popstate
    };

    // Vérifier toutes les 500ms si on est sur la page custom
    setInterval(checkCustomPage, 500);
  }

  /**
   * Initialise le bouton de déconnexion
   */
  private initLogoutButton() {
    this._DO.parametreElement.logoutBtn.addEventListener('click', async () => {
      const { AuthManager } = await import('./auth/auth-manager.js');
      const { activeAnotherPage } = await import('./navigation/page-manager.js');
      const { updateUrl } = await import('./utils/url-helpers.js');

      // Déconnecter l'utilisateur
      await AuthManager.logout();

      // Navigation SPA vers la page login
      const loginPage = this._DO.pages.login;
      activeAnotherPage(loginPage);
      updateUrl(loginPage, '/login');

      console.log('👋 Déconnexion réussie - Navigation SPA vers /login');
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Getter et Setter pour activePage (statique, utilisé partout)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static get activePage(): HTMLElement | null {
    return this.currentActivePage;
  }

  static set activePage(newPage: HTMLElement | null) {
    if (newPage === null) {
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "Off");

      const tmp = document.querySelector('.active') as HTMLElement | null;
      this.currentActivePage = tmp;
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "On");
    } else if (newPage === this.currentActivePage) {
      return;
    } else {
      if (this.currentActivePage)
        activeOrHiden(this.currentActivePage, "Off");
      this.currentActivePage = newPage;
      activeOrHiden(this.currentActivePage, "On");
    }
  }
}
