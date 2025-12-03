/**
 * Gestion des éléments DOM pour le leaderboard
 */

import type { LeaderboardElements } from './types.js';

/**
 * Récupère tous les éléments DOM liés au leaderboard
 */
export function getLeaderboardElements(): LeaderboardElements {
  const get = <T extends HTMLElement>(id: string, context: string): T => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`❌ [${context}] Element with ID "${id}" not found`);
    }
    return element as T;
  };

  const query = <T extends HTMLElement>(sel: string, context: string): T => {
    const el = document.querySelector(sel);
    if (!el) {
      throw new Error(`❌ [${context}] Element with selector "${sel}" not found`);
    }
    return el as T;
  };

  return {
    avatar1: get<HTMLImageElement>("leaderboard-avatar-1", "Leaderboard"),
    avatar2: get<HTMLImageElement>("leaderboard-avatar-2", "Leaderboard"),
    avatar3: get<HTMLImageElement>("leaderboard-avatar-3", "Leaderboard"),
    username1: get<HTMLElement>("leaderboard-username-1", "Leaderboard"),
    username2: get<HTMLElement>("leaderboard-username-2", "Leaderboard"),
    username3: get<HTMLElement>("leaderboard-username-3", "Leaderboard"),
    matches1: get<HTMLElement>("leaderboard-matches-1", "Leaderboard"),
    matches2: get<HTMLElement>("leaderboard-matches-2", "Leaderboard"),
    matches3: get<HTMLElement>("leaderboard-matches-3", "Leaderboard"),
    goals1: get<HTMLElement>("leaderboard-goals-1", "Leaderboard"),
    goals2: get<HTMLElement>("leaderboard-goals-2", "Leaderboard"),
    goals3: get<HTMLElement>("leaderboard-goals-3", "Leaderboard"),
    goalsConceded1: get<HTMLElement>("leaderboard-goals-conceded-1", "Leaderboard"),
    goalsConceded2: get<HTMLElement>("leaderboard-goals-conceded-2", "Leaderboard"),
    goalsConceded3: get<HTMLElement>("leaderboard-goals-conceded-3", "Leaderboard"),
    friends1: get<HTMLElement>("leaderboard-friends-1", "Leaderboard"),
    friends2: get<HTMLElement>("leaderboard-friends-2", "Leaderboard"),
    friends3: get<HTMLElement>("leaderboard-friends-3", "Leaderboard"),
    tableBody: get<HTMLElement>("ranking-table-body", "Leaderboard"),
    empty: get<HTMLElement>("ranking-empty", "Leaderboard"),
    noMatchSection: get<HTMLElement>("no-match-section", "Leaderboard"),
    podiumSection: query<HTMLElement>(".podium-section", "Leaderboard"),
    rankingSection: query<HTMLElement>(".ranking-section", "Leaderboard"),
  };
}
