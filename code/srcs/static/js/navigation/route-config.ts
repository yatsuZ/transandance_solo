/**
 * Configuration des routes de l'application
 */

/**
 * Routes interdites en accès direct (nécessitent un contexte actif : match/tournoi)
 * Ces pages ne peuvent être atteintes que via le flow normal de l'application
 */
export const CONTEXT_RESTRICTED_ROUTES = [
  '/match',
  '/match/result',
  '/tournament/match',
  '/tournament/result',
  '/tournament/tree_tournament'
] as const;

/**
 * Routes protégées (nécessitent une authentification JWT)
 */
export const AUTH_PROTECTED_ROUTES = [
  '/accueil',
  '/game_config',
  '/begin_tournament',
  '/parametre'
] as const;

/**
 * Routes publiques (accessibles sans auth)
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/signup'
] as const;

/**
 * Vérifie si une route nécessite un contexte actif (match/tournoi)
 * @param path - Chemin à vérifier
 * @returns true si la route nécessite un contexte
 */
export function isContextRestrictedRoute(path: string): boolean {
  return CONTEXT_RESTRICTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Vérifie si une route nécessite une authentification
 * @param path - Chemin à vérifier
 * @returns true si la route nécessite un JWT
 */
export function isAuthProtectedRoute(path: string): boolean {
  return AUTH_PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Vérifie si une route est publique
 * @param path - Chemin à vérifier
 * @returns true si la route est publique
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}
