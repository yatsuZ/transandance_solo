/**
 * AuthGuard - Protection des routes frontend
 * Vérifie l'authentification et redirige si nécessaire
 */

import { AuthManager } from './auth-manager.js';
import { activeAnotherPage, activeOrHiden } from '../navigation/page-manager.js';
import { updateUrl } from '../utils/url-helpers.js';
import { DOMElements } from '../core/dom-elements.js';

export class AuthGuard {
  /**
   * Vérifie si l'utilisateur peut accéder à la page actuelle
   * Redirige vers login si non auth, vers accueil si déjà auth sur login/signup
   */
  static checkAuthAndRedirect(dO: DOMElements, currentPath: string): HTMLElement | null {
    const isLoggedIn = AuthManager.isLoggedIn();

    // Pages publiques (accessibles sans auth)
    const publicPages = ['/login', '/signup'];
    const isPublicPage = publicPages.includes(currentPath);

    // 🔒 Si pas connecté et pas sur une page publique → Redirect login
    if (!isLoggedIn && !isPublicPage) {
      console.log('🔒 Non authentifié, redirection vers login');
      activeOrHiden(dO.icons.accueil, "Off");
      activeOrHiden(dO.icons.settings, "Off");
      activeAnotherPage(dO.pages.login);
      updateUrl(dO.pages.login);
      return dO.pages.login;
    }

    // ✅ Si connecté et sur login/signup → Redirect accueil
    if (isLoggedIn && (currentPath === '/login' || currentPath === '/signup' || currentPath === '/')) {
      console.log('✅ Déjà authentifié, redirection vers accueil');
      activeOrHiden(dO.icons.accueil, "Off");
      activeOrHiden(dO.icons.settings, "On");
      activeAnotherPage(dO.pages.accueil);
      window.history.replaceState({ page: 'accueil' }, "", "/accueil");
      return dO.pages.accueil;
    }

    // Aucune redirection nécessaire
    return null;
  }

  /**
   * Vérifie si une navigation doit être bloquée
   */
  static shouldBlockNavigation(targetPageId: string): boolean {
    const isLoggedIn = AuthManager.isLoggedIn();

    // Bloquer accès aux pages protégées si pas connecté
    const protectedPages = ['pagesAccueil', 'pagesGame_Config', 'pagesBegin_Tournament', 'pagesParametre'];

    if (!isLoggedIn && protectedPages.includes(targetPageId)) {
      console.log('🔒 Navigation bloquée vers', targetPageId, '- Non authentifié');
      return true;
    }

    return false;
  }
}
