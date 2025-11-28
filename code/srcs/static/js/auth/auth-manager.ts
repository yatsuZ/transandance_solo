/**
 * AuthManager - Gestion de l'authentification frontend
 * - Stockage JWT dans localStorage
 * - Login/Signup via API
 * - Vérification authentification
 * - Logout
 */

const TOKEN_KEY = 'pong_jwt_token';
const USER_KEY = 'pong_user_data';

export interface UserData {
  id: number;
  username: string;
  email: string | null;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: UserData;
  };
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  data?: {
    token: string;
    user: UserData;
  };
  message?: string;
  error?: string;
}

export class AuthManager {
  /**
   * Vérifie si l'utilisateur est connecté
   */
  static isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Vérifier si le token est expiré (basique)
    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);

      // Si le token a un exp et qu'il est expiré
      if (payload.exp && payload.exp < now) {
        console.log('🔒 Token expiré, déconnexion automatique');
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Récupère le token JWT stocké
   */
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Récupère les données utilisateur stockées
   */
  static getUserData(): UserData | null {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('❌ Erreur parsing user data:', error);
      return null;
    }
  }

  /**
   * Stocke le token et les données utilisateur
   */
  static saveAuthData(token: string, user: UserData): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('✅ Auth data sauvegardée pour:', user.username);
  }

  /**
   * Déconnecte l'utilisateur (supprime token + user data)
   */
  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('👋 Déconnexion effectuée');
  }

  /**
   * Décode un token JWT (sans vérification signature)
   * Utile pour lire l'expiration côté client
   */
  private static decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  /**
   * Login - Envoie une requête POST /api/auth/login
   */
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.data) {
        // Sauvegarder le token et user data
        this.saveAuthData(data.data.token, data.data.user);
        return data;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  /**
   * Signup - Envoie une requête POST /api/auth/signup
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
        body: JSON.stringify({
          username,
          password,
          email: email || null,
        }),
      });

      const data: SignupResponse = await response.json();

      if (response.ok && data.success && data.data) {
        // Sauvegarder le token et user data
        this.saveAuthData(data.data.token, data.data.user);
        return data;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur signup:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  /**
   * Récupère le header Authorization pour les requêtes API
   */
  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};

    return {
      'Authorization': `Bearer ${token}`,
    };
  }
}
