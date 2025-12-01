/**
 * AuthManager - Gestion de l'authentification frontend
 * - JWT stocké dans cookie HTTP-only (géré par le serveur)
 * - Données utilisateur dans UserSession (RAM, singleton)
 * - Login/Signup via API
 * - Vérification authentification
 * - Logout
 */

import { userSession, type UserData } from './user-session.js';
import { uiPreferences, type PlayerControls } from '../core/ui-preferences.js';

export type { UserData };

export interface LoginResponse {
  success: boolean;
  data?: {
    user: UserData;
  };
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  data?: {
    user: UserData;
  };
  message?: string;
  error?: string;
}

export class AuthManager {
  /**
   * Vérifie si l'utilisateur est connecté (vérification synchrone locale)
   * Vérifie si la session utilisateur existe en mémoire
   * ⚠️ Ne vérifie PAS si le cookie JWT est valide côté serveur
   * Pour une vérification complète, utiliser verifyAuth()
   */
  static isLoggedIn(): boolean {
    return userSession.hasUser();
  }

  /**
   * Vérifie l'authentification côté serveur (async)
   * Appelle /api/auth/me pour vérifier le cookie JWT et récupérer les données utilisateur
   * @returns true si authentifié, false sinon
   */
  static async verifyAuth(): Promise<boolean> {
    try {
      console.log('🔍 [verifyAuth] Vérification du cookie JWT...');

      // Appeler /api/auth/me pour vérifier le cookie et récupérer les données user
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // Envoie le cookie automatiquement
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          const user = data.data.user;
          console.log(`✅ [verifyAuth] Cookie JWT valide pour ${user.username}`);

          // Mettre à jour la session en mémoire
          userSession.setUser(user);

          // Charger les contrôles depuis les données user
          if (user.controls) {
            try {
              const controls: PlayerControls = JSON.parse(user.controls);
              uiPreferences.setControls(controls);
              console.log('🎮 [verifyAuth] Contrôles chargés depuis la BDD');
            } catch (error) {
              console.log('⚠️ [verifyAuth] Contrôles corrompus, utilisation des valeurs par défaut');
            }
          }

          return true;
        } else {
          console.log('⚠️ [verifyAuth] Réponse serveur invalide');
          userSession.clear();
          return false;
        }
      } else if (response.status === 401) {
        // Cookie invalide/expiré
        console.log('🧹 [verifyAuth] Cookie JWT invalide/expiré ! Nettoyage de la session');
        userSession.clear();
        return false;
      } else {
        // Autre erreur (500, etc.) - on considère comme déconnecté par sécurité
        console.log(`⚠️ [verifyAuth] Erreur serveur (${response.status}) → Non authentifié par sécurité`);
        userSession.clear();
        return false;
      }
    } catch (error) {
      console.log('⚠️ [verifyAuth] Erreur réseau lors de la vérification auth:', error);
      userSession.clear();
      return false;
    }
  }

  /**
   * Récupère les données utilisateur depuis la session en mémoire
   */
  static getUserData(): UserData | null {
    return userSession.getUser();
  }

  /**
   * Stocke les données utilisateur dans la session en mémoire
   * Le JWT est géré automatiquement par les cookies HTTP-only
   */
  static saveUserData(user: UserData): void {
    userSession.setUser(user);
  }

  /**
   * Déconnecte l'utilisateur
   * Nettoie la session en mémoire et appelle l'API logout pour supprimer le cookie
   */
  static async logout(): Promise<void> {
    // Nettoyer la session en mémoire
    userSession.clear();

    // Appeler l'API pour supprimer le cookie côté serveur
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Important pour envoyer le cookie
      });
      console.log('👋 Déconnexion effectuée');
    } catch (error) {
      console.log('⚠️ Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Login - Envoie une requête POST /api/auth/login
   * Le JWT est automatiquement stocké dans un cookie HTTP-only par le serveur
   */
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour recevoir et envoyer les cookies
        body: JSON.stringify({ username, password }),
      });

      // Toujours parser la réponse, même si status != 200
      const data: LoginResponse = await response.json();

      // Si succès, sauvegarder les données utilisateur (pas le token, il est dans le cookie)
      if (response.ok && data.success && data.data) {
        this.saveUserData(data.data.user);
      }

      // Retourner la réponse (succès ou échec) sans lever d'erreur
      return data;
    } catch (error) {
      // Seulement si erreur réseau (pas de réponse du serveur)
      console.log('⚠️ Impossible de se connecter au serveur');
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  /**
   * Signup - Envoie une requête POST /api/auth/signup
   * Le JWT est automatiquement stocké dans un cookie HTTP-only par le serveur
   */
  static async signup(
    username: string,
    password: string,
    email?: string
  ): Promise<SignupResponse> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour recevoir et envoyer les cookies
        body: JSON.stringify({
          username,
          password,
          email: email || null,
        }),
      });

      // Toujours parser la réponse, même si status != 200
      const data: SignupResponse = await response.json();

      // Si succès, sauvegarder les données utilisateur (pas le token, il est dans le cookie)
      if (response.ok && data.success && data.data) {
        this.saveUserData(data.data.user);
      }

      // Retourner la réponse (succès ou échec) sans lever d'erreur
      return data;
    } catch (error) {
      // Seulement si erreur réseau (pas de réponse du serveur)
      console.log('⚠️ Impossible de créer le compte');
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }
}
