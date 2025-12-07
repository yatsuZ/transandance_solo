/**
 * AuthEvents - Gestion des événements des formulaires login/signup
 */

import { AuthManager } from './auth-manager.js';
import { activeAnotherPage, activeOrHiden } from '../navigation/page-manager.js';
import { updateUrl } from '../utils/url-helpers.js';
import { DOMElements } from '../core/dom-elements.js';
import { PAGE_IDS } from '../navigation/helpers.js';

export class AuthEvents {
  private _DO: DOMElements;

  constructor(dO: DOMElements) {
    this._DO = dO;
    this.attachEventListeners();
    this.checkURLParams();
  }

  /**
   * Attache les event listeners sur les formulaires
   */
  private attachEventListeners(): void {
    // Formulaire login
    if (this._DO.auth.loginForm) {
      this._DO.auth.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Formulaire signup
    if (this._DO.auth.signupForm) {
      this._DO.auth.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // Bouton vérifier 2FA
    this._DO.auth.btnVerify2FA.addEventListener('click', () => this.handle2FAVerify());

    // Bouton annuler 2FA
    this._DO.auth.btnCancel2FA.addEventListener('click', () => this.handle2FACancel());

    // Enter key sur input 2FA
    this._DO.auth.twofaCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handle2FAVerify();
      }
    });
  }

  /**
   * Vérifie les paramètres URL pour afficher des messages (ex: Google OAuth)
   */
  private checkURLParams(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const email = urlParams.get('email');

    // Cas: Tentative de connexion Google sans compte
    if (error === 'no_account' && email) {
      const signupErrorDiv = this._DO.auth.signupError;
      const emailInput = document.querySelector('#signup-email') as HTMLInputElement;

      // Afficher un message explicatif
      this.showError(
        signupErrorDiv,
        `🔐 Aucun compte trouvé pour ${email}. Créez d'abord un compte, puis vous pourrez le lier à Google.`
      );

      // Pré-remplir l'email
      if (emailInput) {
        emailInput.value = email;
      }

      // Nettoyer l'URL (enlever les paramètres)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // Stockage temporaire des credentials pour le 2FA
  private tempUsername: string = '';
  private tempPassword: string = '';

  /**
   * Gère la soumission du formulaire login
   */
  private async handleLogin(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const usernameInput = form.querySelector('#login-username') as HTMLInputElement;
    const passwordInput = form.querySelector('#login-password') as HTMLInputElement;
    const errorDiv = this._DO.auth.loginError;
    const submitBtn = this._DO.auth.loginBtn;

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      // Cas 1: 2FA requis
      if (result.requires2FA) {
        // Stocker les credentials
        this.tempUsername = username;
        this.tempPassword = password;

        // Cacher le formulaire login, afficher input 2FA
        this._DO.auth.loginFormSection.style.display = 'none';
        this._DO.auth.twofaInputSection.style.display = 'block';
        this._DO.auth.twofaCodeInput.focus();

        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.textContent = 'Se connecter';

        return;
      }

      // Cas 2: Connexion réussie (sans 2FA ou après validation 2FA)
      if (result.success && result.data) {
        // Masquer l'erreur
        this.hideError(errorDiv);

        // Vérifier l'auth pour initialiser la session
        await AuthManager.verifyAuth();

        // Rediriger vers la page d'accueil
        this.redirectToHome();
      } else {
        // Cas 3: Erreur
        this.showError(errorDiv, result.error || 'Identifiants incorrects');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Se connecter';
      }
    } catch (error) {
      console.error('[AuthEvents] Erreur lors de la connexion:', error);
      this.showError(errorDiv, 'Erreur de connexion');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  }

  /**
   * Gère la vérification du code 2FA
   */
  private async handle2FAVerify(): Promise<void> {
    const code = this._DO.auth.twofaCodeInput.value.trim();
    const errorDiv = this._DO.auth.twofaInputError;

    if (!code || code.length !== 6) {
      this.showError(errorDiv, 'Le code doit contenir 6 chiffres');
      return;
    }

    try {
      // Re-submit avec le code 2FA
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: this.tempUsername,
          password: this.tempPassword,
          twofa_token: code
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Nettoyer
        this._DO.auth.twofaCodeInput.value = '';
        this.tempUsername = '';
        this.tempPassword = '';

        // Masquer l'erreur
        this.hideError(errorDiv);

        // Vérifier l'auth pour initialiser la session
        await AuthManager.verifyAuth();

        // Rediriger vers la page d'accueil
        this.redirectToHome();
      } else {
        this.showError(errorDiv, result.error || 'Code invalide');
        this._DO.auth.twofaCodeInput.value = '';
        this._DO.auth.twofaCodeInput.focus();
      }
    } catch (error) {
      console.error('[AuthEvents] Erreur vérification 2FA:', error);
      this.showError(errorDiv, 'Erreur lors de la vérification');
    }
  }

  /**
   * Gère l'annulation du 2FA (retour au login)
   */
  private handle2FACancel(): void {
    // Nettoyer
    this._DO.auth.twofaCodeInput.value = '';
    this.tempUsername = '';
    this.tempPassword = '';
    this.hideError(this._DO.auth.twofaInputError);

    // Réafficher le formulaire login
    this._DO.auth.twofaInputSection.style.display = 'none';
    this._DO.auth.loginFormSection.style.display = 'block';
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
    const errorDiv = this._DO.auth.signupError;
    const submitBtn = this._DO.auth.signupBtn;

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
        // Masquer l'erreur
        this.hideError(errorDiv);

        // Vérifier l'auth pour initialiser la session
        await AuthManager.verifyAuth();

        // Rediriger vers la page d'accueil
        this.redirectToHome();
      } else {
        // Afficher l'erreur
        this.showError(errorDiv, result.error || 'Erreur lors de l\'inscription');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Créer mon compte';
      }
    } catch (error) {
      console.error('[AuthEvents] Erreur lors de l\'inscription:', error);
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
    const iconEdit = this._DO.icons.edit;
    const iconAccueil = this._DO.icons.accueil;
    const iconProfile = this._DO.icons.profile;
    const iconSettings = this._DO.icons.settings;

    // Afficher les icônes selon la logique de la page accueil
    // Sur la page accueil: accueil=OFF, profile=ON, settings=ON, edit=OFF
    activeOrHiden(iconEdit, 'Off');
    activeOrHiden(iconAccueil, 'Off'); // Cache l'icône accueil sur la page accueil
    activeOrHiden(iconProfile, 'On');
    activeOrHiden(iconSettings, 'On');

    // Activer la page accueil
    activeAnotherPage(accueilPage);
    updateUrl(accueilPage);
  }
}
