/**
 * Gestion des éléments DOM pour l'authentification
 */

import type { AuthElements } from './types.js';

/**
 * Récupère tous les éléments DOM liés à l'authentification
 */
export function getAuthElements(): AuthElements {
  const get = <T extends HTMLElement>(id: string, context: string): T => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`❌ [${context}] Element with ID "${id}" not found`);
    }
    return element as T;
  };

  return {
    loginForm: get<HTMLFormElement>("login-form", "Auth"),
    signupForm: get<HTMLFormElement>("signup-form", "Auth"),
    loginError: get<HTMLElement>("login-error", "Auth"),
    signupError: get<HTMLElement>("signup-error", "Auth"),
    loginBtn: get<HTMLButtonElement>("login-btn", "Auth"),
    signupBtn: get<HTMLButtonElement>("signup-btn", "Auth"),

    // 2FA Login
    loginFormSection: get<HTMLElement>("login-form-section", "Auth"),
    twofaInputSection: get<HTMLElement>("twofa-input-section", "Auth"),
    twofaCodeInput: get<HTMLInputElement>("twofa-code-input", "Auth"),
    btnVerify2FA: get<HTMLButtonElement>("btn-verify-2fa", "Auth"),
    btnCancel2FA: get<HTMLButtonElement>("btn-cancel-2fa", "Auth"),
    twofaInputError: get<HTMLElement>("twofa-input-error", "Auth"),
  };
}
