/**
 * Type représentant tous les éléments DOM de l'application
 * Les types sont organisés par module dans ./dom/types.d.ts
 */

import type {
  AuthElements,
  ProfileElements,
  LeaderboardElements,
  GameElements,
  UIElements
} from './dom/types.js';

/**
 * Interface principale regroupant tous les éléments DOM
 */
export type DOMElements = {
  // Auth section
  auth: AuthElements;

  // Profile section
  profile: ProfileElements;

  // Leaderboard section
  leaderboard: LeaderboardElements;

  // Game section (canvas, match, config, results, tournament)
  canva: GameElements['canva'];
  ctx: GameElements['ctx'];
  matchElement: GameElements['matchElement'];
  gameConfigElement: GameElements['gameConfigElement'];
  resultElement: GameElements['resultElement'];
  tournamentElement: GameElements['tournamentElement'];

  // UI section (pages, buttons, icons, media, modals, style)
  pages: UIElements['pages'];
  errorElement: UIElements['errorElement'];
  parametreElement: UIElements['parametreElement'];
  buttons: UIElements['buttons'];
  icons: UIElements['icons'];
  media: UIElements['media'];
  popup: UIElements['popup'];
  controlsModal: UIElements['controlsModal'];
  profileEditModal: UIElements['profileEditModal'];
  subtitles: UIElements['subtitles'];
  style: UIElements['style'];
};