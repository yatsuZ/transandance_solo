/**
 * AuthEvents - Gestion des événements des formulaires login/signup
 */

import { AuthManager } from './auth-manager.js';
import { activeAnotherPage, activeOrHiden } from '../navigation/page-manager.js';
import { updateUrl } from '../utils/url-helpers.js';
import { DOMElements } from '../core/dom-elements.js';

export class AuthEvents {
  private _DO: DOMElements;

  constructor(dO: DOMElements) {
    this._DO = dO;
    this.attachEventListeners();
  }

  /**
   * Attache les event listeners sur les formulaires
   */
  private attachEventListeners(): void {
    // Formulaire login
    const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Formulaire signup
    const signupForm = document.getElementById('signup-form') as HTMLFormElement | null;
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }
  }

  /**
   * Gère la soumission du formulaire login
   */
  private async handleLogin(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const usernameInput = form.querySelector('#login-username') as HTMLInputElement;
    const passwordInput = form.querySelector('#login-password') as HTMLInputElement;
    const errorDiv = document.getElementById('login-error') as HTMLElement;
    const submitBtn = document.getElementById('login-btn') as HTMLButtonElement;

    // Récupérer les valeurs AVANT de reset
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Nettoyer le formulaire immédiatement après submit
    form.reset();

    // Validation basique
    if (!username || !password) {
      this.showError(errorDiv, 'Tous les champs sont requis');
      return;
    }

    // Désactiver le bouton pendant la requête
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion...';

    try {
      // Appel API
      const result = await AuthManager.login(username, password);

      if (result.success && result.data) {
        console.log('✅ Connexion réussie:', result.data.user.username);

        // Masquer l'erreur
        this.hideError(errorDiv);

        // Rediriger vers la page d'accueil
        this.redirectToHome();
      } else {
        // Afficher l'erreur
        this.showError(errorDiv, result.error || 'Identifiants incorrects');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Se connecter';
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la connexion');
      this.showError(errorDiv, 'Erreur de connexion');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  }

  /**
   * Gère la soumission du formulaire signup
   */
  private async handleSignup(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const usernameInput = form.querySelector('#signup-username') as HTMLInputElement;
    const emailInput = form.querySelector('#signup-email') as HTMLInputElement;
    const passwordInput = form.querySelector('#signup-password') as HTMLInputElement;
    const confirmInput = form.querySelector('#signup-password-confirm') as HTMLInputElement;
    const errorDiv = document.getElementById('signup-error') as HTMLElement;
    const submitBtn = document.getElementById('signup-btn') as HTMLButtonElement;

    // Récupérer les valeurs AVANT de reset
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim() || undefined;
    const password = passwordInput.value;
    const passwordConfirm = confirmInput.value;

    // Nettoyer le formulaire immédiatement après submit
    form.reset();

    // Validation
    if (!username || !password || !passwordConfirm) {
      this.showError(errorDiv, 'Tous les champs sont requis');
      return;
    }

    if (password !== passwordConfirm) {
      this.showError(errorDiv, 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      this.showError(errorDiv, 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    // Désactiver le bouton pendant la requête
    submitBtn.disabled = true;
    submitBtn.textContent = 'Création...';

    try {
      // Appel API
      const result = await AuthManager.signup(username, password, email);

      if (result.success && result.data) {
        console.log('✅ Inscription réussie:', result.data.user.username);

        // Masquer l'erreur
        this.hideError(errorDiv);

        // Rediriger vers la page d'accueil
        this.redirectToHome();
      } else {
        // Afficher l'erreur
        this.showError(errorDiv, result.error || 'Erreur lors de l\'inscription');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Créer mon compte';
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de l\'inscription');
      this.showError(errorDiv, 'Erreur d\'inscription');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Créer mon compte';
    }
  }

  /**
   * Affiche un message d'erreur
   */
  private showError(errorDiv: HTMLElement, message: string): void {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  /**
   * Masque le message d'erreur
   */
  private hideError(errorDiv: HTMLElement): void {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }

  /**
   * Redirige vers la page d'accueil après connexion réussie
   */
  private redirectToHome(): void {
    const accueilPage = this._DO.pages.accueil;
    const iconAccueil = this._DO.icons.accueil;
    const iconProfile = this._DO.icons.profile;
    const iconSettings = this._DO.icons.settings;

    // Afficher les icônes
    activeOrHiden(iconAccueil, 'Off'); // Cache l'icône accueil sur la page accueil
    activeOrHiden(iconSettings, 'On');
    activeOrHiden(iconProfile, 'On');

    // Activer la page accueil
    activeAnotherPage(accueilPage);
    updateUrl(accueilPage);

    console.log('🏠 Redirection vers accueil');
  }
}
