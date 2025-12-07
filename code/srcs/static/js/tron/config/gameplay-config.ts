/**
 * Configuration du gameplay Tron
 */

// Nombre de rounds pour gagner un match
export const WINNING_SCORE = 3;

// Vitesse du jeu (ms entre chaque frame)
export const GAME_SPEED = 30; // Plus rapide !

// Taille d'une cellule de la grille (en pixels)
export const GRID_SIZE = 5; // Carrés plus fins !

// Délai entre les rounds (ms)
export const ROUND_DELAY = 2000;

// Accélération progressive
export const SPEED_INCREASE_INTERVAL = 3000; // Tous les 5 secondes (plus rapide !)
export const SPEED_INCREASE_RATE = 0.80; // Réduire de 15% (accélération plus forte !)
export const MIN_GAME_SPEED = 30; // Vitesse minimale
