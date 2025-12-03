/**
 * Gestionnaire centralisé du DOM - Point d'entrée principal
 * Ce module assemble tous les éléments DOM de l'application en utilisant des sous-modules organisés
 */

import { DOMElements } from "./dom-elements.js";
import { getAuthElements } from "./dom/auth-dom.js";
import { getProfileElements } from "./dom/profile-dom.js";
import { getLeaderboardElements } from "./dom/leaderboard-dom.js";
import { getGameElements } from "./dom/game-dom.js";
import { getUIElements } from "./dom/ui-dom.js";

/**
 * Initialise et récupère tous les éléments DOM de l'application
 * @throws {Error} Si un élément requis n'est pas trouvé dans le DOM
 * @returns {DOMElements} Objet contenant tous les éléments DOM typés
 */
export function init_All_Dom(): DOMElements {
  // Récupération de tous les éléments par section
  const auth = getAuthElements();
  const profile = getProfileElements();
  const leaderboard = getLeaderboardElements();
  const game = getGameElements();
  const ui = getUIElements();

  // Assemblage et retour de tous les éléments
  return {
    // Auth
    auth,

    // Profile
    profile,

    // Leaderboard
    leaderboard,

    // Game elements (canvas, match, tournament, game config)
    canva: game.canva,
    ctx: game.ctx,
    matchElement: game.matchElement,
    gameConfigElement: game.gameConfigElement,
    resultElement: game.resultElement,
    tournamentElement: game.tournamentElement,

    // UI elements (pages, buttons, icons, media, modals, style)
    pages: ui.pages,
    errorElement: ui.errorElement,
    parametreElement: ui.parametreElement,
    buttons: ui.buttons,
    icons: ui.icons,
    media: ui.media,
    popup: ui.popup,
    controlsModal: ui.controlsModal,
    profileEditModal: ui.profileEditModal,
    subtitles: ui.subtitles,
    style: ui.style,
  };
}


