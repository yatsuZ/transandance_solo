/**
 * UserSession - Gestion de la session utilisateur en mémoire (singleton)
 *
 * Stocke les données utilisateur en RAM au lieu de localStorage
 * Source de vérité : Cookie JWT côté serveur
 *
 * ✅ Avantages :
 * - Pas de manipulation possible (pas accessible via console)
 * - Nettoyé automatiquement à la fermeture du navigateur
 * - Synchronisé avec le serveur via verifyAuth()
 */

export interface UserData {
  id: number;
  username: string;
  email: string | null;
  controls?: string; // JSON string des contrôles clavier
}

class UserSession {
  private static instance: UserSession;
  private currentUser: UserData | null = null;

  private constructor() {
    // Privé pour forcer l'utilisation du singleton
  }

  /**
   * Récupère l'instance unique
   */
  static getInstance(): UserSession {
    if (!UserSession.instance) {
      UserSession.instance = new UserSession();
    }
    return UserSession.instance;
  }

  /**
   * Définit les données utilisateur
   */
  setUser(user: UserData): void {
    this.currentUser = user;
    console.log(`✅ [UserSession] Session créée pour ${user.username} (ID: ${user.id})`);
  }

  /**
   * Récupère les données utilisateur
   */
  getUser(): UserData | null {
    return this.currentUser;
  }

  /**
   * Vérifie si un utilisateur est en session
   */
  hasUser(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Nettoie la session
   */
  clear(): void {
    if (this.currentUser) {
      console.log(`🧹 [UserSession] Session nettoyée pour ${this.currentUser.username}`);
    }
    this.currentUser = null;
  }

  /**
   * Récupère l'ID de l'utilisateur courant
   */
  getUserId(): number | null {
    return this.currentUser?.id ?? null;
  }

  /**
   * Récupère le username de l'utilisateur courant
   */
  getUsername(): string | null {
    return this.currentUser?.username ?? null;
  }
}

// Export singleton
export const userSession = UserSession.getInstance();
