/**
 * Configuration des routes de l'application
 */

/**
 * Routes interdites en accès direct (nécessitent un contexte actif)
 * Ces pages ne peuvent être atteintes que via le flow normal de l'application
 */
export const RESTRICTED_ROUTES = [
  '/match',
  '/match/result',
  '/tournament',
  '/tournament/match',
  '/tournament/result',
  '/tournament/tree_tournament'
] as const;

/**
 * Vérifie si une route est restreinte
 * @param path - Chemin à vérifier
 * @returns true si la route est restreinte
 */
export function isRestrictedRoute(path: string): boolean {
  return RESTRICTED_ROUTES.some(route => path.startsWith(route));
}
