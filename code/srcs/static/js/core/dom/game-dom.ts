/**
 * Gestion des éléments DOM pour le jeu (match, tournament, canvas)
 */

import type { GameElements } from './types.js';

/**
 * Récupère tous les éléments DOM liés au jeu
 */
export function getGameElements(): GameElements {
  const get = <T extends HTMLElement>(id: string, context: string): T => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`❌ [${context}] Element with ID "${id}" not found`);
    }
    return element as T;
  };

  // Canvas
  const canva = get<HTMLCanvasElement>("game-canvas", "Game");
  const ctx = canva.getContext("2d");
  if (!ctx) {
    throw new Error("❌ [Game] Failed to get 2D context from canvas");
  }

  // Helper pour récupérer un query selector
  const query = <T extends HTMLElement>(sel: string, context: string): T => {
    const el = document.querySelector(sel);
    if (!el) {
      throw new Error(`❌ [${context}] Element with selector "${sel}" not found`);
    }
    return el as T;
  };

  return {
    canva,
    ctx,
    matchElement: {
      playerCardL: get<HTMLElement>("player-Left-Card-Match", "Match"),
      playerCardR: get<HTMLElement>("player-Right-Card-Match", "Match"),
    },
    gameConfigElement: {
      formulaireGameConfig: get<HTMLFormElement>("match-form", "GameConfig"),
      inputFormulaireGameConfig_PlayerLeft: get<HTMLInputElement>("playerLeft", "GameConfig"),
      inputFormulaireGameConfig_PlayerRight: get<HTMLInputElement>("playerRight", "GameConfig"),
      checkboxGameConfig_PlayerLeftIsMe: get<HTMLInputElement>("playerLeftIsMe", "GameConfig"),
      checkboxGameConfig_PlayerRightIsMe: get<HTMLInputElement>("playerRightIsMe", "GameConfig"),
      radioGameConfig_PlayerLeftTypeHuman: query<HTMLInputElement>('input[name="playerLeftType"][value="human"]', "GameConfig"),
      radioGameConfig_PlayerLeftTypeIA: query<HTMLInputElement>('input[name="playerLeftType"][value="ia"]', "GameConfig"),
      radioGameConfig_PlayerRightTypeHuman: query<HTMLInputElement>('input[name="playerRightType"][value="human"]', "GameConfig"),
      radioGameConfig_PlayerRightTypeIA: query<HTMLInputElement>('input[name="playerRightType"][value="ia"]', "GameConfig"),
      // Sélecteurs de difficulté IA
      playerLeftAIDifficultyBlock: get<HTMLElement>("playerLeftAIDifficulty", "GameConfig"),
      playerRightAIDifficultyBlock: get<HTMLElement>("playerRightAIDifficulty", "GameConfig"),
      playerLeftDifficultySelect: get<HTMLSelectElement>("playerLeftDifficulty", "GameConfig"),
      playerRightDifficultySelect: get<HTMLSelectElement>("playerRightDifficulty", "GameConfig"),
    },
    resultElement: {
      winnerNameEl: get<HTMLElement>("winner-name", "Result"),
      player1NameEl: get<HTMLElement>("player1-name", "Result"),
      player1ScoreEl: get<HTMLElement>("player1-score", "Result"),
      player2NameEl: get<HTMLElement>("player2-name", "Result"),
      player2ScoreEl: get<HTMLElement>("player2-score", "Result"),
    },
    tournamentElement: {
      texteWhovsWho: query<HTMLElement>(".texte-label", "Tournament"),
      spanWhoVsWho: get<HTMLElement>("WhoVsWho", "Tournament"),
      divOfButton: query<HTMLElement>(".menu-buttons-tree-tournament-padding", "Tournament"),
      form: get<HTMLFormElement>("tournament-form", "Tournament"),
      formPseudoTournament: [
        get<HTMLInputElement>("player1", "Tournament"),
        get<HTMLInputElement>("player2", "Tournament"),
        get<HTMLInputElement>("player3", "Tournament"),
        get<HTMLInputElement>("player4", "Tournament"),
      ],
      formIsHumanCheckbox: [
        get<HTMLInputElement>("human1", "Tournament"),
        get<HTMLInputElement>("human2", "Tournament"),
        get<HTMLInputElement>("human3", "Tournament"),
        get<HTMLInputElement>("human4", "Tournament"),
      ],
      formIsMeCheckbox: [
        get<HTMLInputElement>("isMe1", "Tournament"),
        get<HTMLInputElement>("isMe2", "Tournament"),
        get<HTMLInputElement>("isMe3", "Tournament"),
        get<HTMLInputElement>("isMe4", "Tournament"),
      ],
      // Sélecteurs de difficulté IA pour tournoi
      playerDifficultyBlocks: [
        get<HTMLElement>("player1AIDifficulty", "Tournament"),
        get<HTMLElement>("player2AIDifficulty", "Tournament"),
        get<HTMLElement>("player3AIDifficulty", "Tournament"),
        get<HTMLElement>("player4AIDifficulty", "Tournament"),
      ],
      playerDifficultySelects: [
        get<HTMLSelectElement>("player1Difficulty", "Tournament"),
        get<HTMLSelectElement>("player2Difficulty", "Tournament"),
        get<HTMLSelectElement>("player3Difficulty", "Tournament"),
        get<HTMLSelectElement>("player4Difficulty", "Tournament"),
      ],
    },
  };
}
