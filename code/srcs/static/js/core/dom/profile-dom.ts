/**
 * Gestion des éléments DOM pour le profil utilisateur
 */

import type { ProfileElements } from './types.js';

/**
 * Récupère tous les éléments DOM liés au profil
 */
export function getProfileElements(): ProfileElements {
  const get = <T extends HTMLElement>(id: string, context: string): T => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`❌ [${context}] Element with ID "${id}" not found`);
    }
    return element as T;
  };

  return {
    username: get<HTMLElement>("profile-username", "ProfilePage"),
    pdp: get<HTMLImageElement>("profile-picture", "ProfilePage"),
    statMatch: get<HTMLElement>("stat-matches", "ProfilePage"),
    statWin: get<HTMLElement>("stat-wins", "ProfilePage"),
    statLose: get<HTMLElement>("stat-losses", "ProfilePage"),
    statTournamentsPlayed: get<HTMLElement>("stat-tournaments-played", "ProfilePage"),
    statTournamentsWon: get<HTMLElement>("stat-tournaments-won", "ProfilePage"),
    statGoal: get<HTMLElement>("stat-goals-for", "ProfilePage"),
    statGoalAgainst: get<HTMLElement>("stat-goals-against", "ProfilePage"),
    ControlLU: get<HTMLElement>("control-left-up", "ProfilePage"),
    ControlLD: get<HTMLElement>("control-left-down", "ProfilePage"),
    ControlLL: get<HTMLElement>("control-left-left", "ProfilePage"),
    ControlLR: get<HTMLElement>("control-left-right", "ProfilePage"),
    ControlRU: get<HTMLElement>("control-right-up", "ProfilePage"),
    ControlRD: get<HTMLElement>("control-right-down", "ProfilePage"),
    ControlRL: get<HTMLElement>("control-right-left", "ProfilePage"),
    ControlRR: get<HTMLElement>("control-right-right", "ProfilePage"),
    btnEditControl: get<HTMLElement>("edit-controls-btn", "ProfilePage"),
    historyList: get<HTMLElement>("history-list", "ProfilePage"),
    historyEmpty: get<HTMLElement>("history-empty", "ProfilePage"),
    friendsCount: get<HTMLElement>("friends-count", "ProfilePage"),
    friendsList: get<HTMLElement>("friends-list", "ProfilePage"),
    friendsEmpty: get<HTMLElement>("friends-empty", "ProfilePage"),
  };
}
