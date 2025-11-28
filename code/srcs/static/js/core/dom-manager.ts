import { DOMElements } from "./dom-elements";
/**
 * Types et utilitaires pour la gestion centralisée du DOM
 * Ce module initialise et type tous les éléments DOM de l'application
 */


/**
 * Initialise et récupère tous les éléments DOM de l'application
 * @throws {Error} Si un élément requis n'est pas trouvé dans le DOM
 * @returns {DOMElements} Objet contenant tous les éléments DOM typés
 */
export function init_All_Dom(): DOMElements {

  /**
   * Récupère un élément par son ID
   * @param id - L'ID de l'élément à récupérer
   * @param context - Contexte pour le message d'erreur (optionnel)
   * @throws {Error} Si l'élément n'existe pas
   */
  function get<T extends HTMLElement>(id: string, context?: string): T {
    const el = document.getElementById(id);
    if (!el) {
      const errorMsg = context
        ? `❌ [${context}] Élément manquant : #${id}`
        : `❌ Élément manquant : #${id}`;
      throw new Error(errorMsg);
    }
    return el as T;
  }

  /**
   * Récupère un élément par sélecteur CSS
   * @param sel - Le sélecteur CSS
   * @param context - Contexte pour le message d'erreur (optionnel)
   * @throws {Error} Si l'élément n'existe pas
   */
  function query<T extends HTMLElement>(sel: string, context?: string): T {
    const el = document.querySelector(sel);
    if (!el) {
      const errorMsg = context
        ? `❌ [${context}] Élément manquant : ${sel}`
        : `❌ Élément manquant : ${sel}`;
      throw new Error(errorMsg);
    }
    return el as T;
  }

  /**
   * Récupère plusieurs éléments par sélecteur CSS
   * @param sel - Le sélecteur CSS
   * @param context - Contexte pour le message d'erreur (optionnel)
   * @throws {Error} Si aucun élément n'est trouvé
   */
  function queryAll<T extends HTMLElement>(sel: string, context?: string): T[] {
    const els = Array.from(document.querySelectorAll(sel)) as T[];
    if (els.length === 0) {
      const errorMsg = context
        ? `❌ [${context}] Aucun élément trouvé : ${sel}`
        : `❌ Aucun élément trouvé : ${sel}`;
      throw new Error(errorMsg);
    }
    return els;
  }

  /**
   * Helper pour récupérer un tableau d'inputs par leurs IDs
   * @param ids - Tableau des IDs à récupérer
   * @param context - Contexte pour les messages d'erreur
   * @returns Tuple typé des 4 inputs
   */
  function getInputArray(ids: [string, string, string, string], context: string): [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement] {
    return ids.map(id => get<HTMLInputElement>(id, context)) as
      [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
  }

  // ========================================
  // CANVAS & CONTEXTE 2D
  // ========================================
  const canva = get<HTMLCanvasElement>("game-canvas", "Canvas");
  const ctx = canva.getContext("2d");
  if (!ctx) {
    throw new Error("❌ [Canvas] Impossible de récupérer le contexte 2D");
  }

  // ========================================
  // PAGES DE L'APPLICATION
  // ========================================
  const pageLogin = get<HTMLElement>("pagesLogin", "Pages");
  const pageSignup = get<HTMLElement>("pagesSignup", "Pages");
  const pageAccueil = get<HTMLElement>("pagesAccueil", "Pages");
  const pageGameConfig = get<HTMLElement>("pagesGame_Config", "Pages");
  const pageMatch = get<HTMLElement>("pagesMatch", "Pages");
  const pageResult = get<HTMLElement>("pagesResult", "Pages");
  const pageBeginTournament = get<HTMLElement>("pagesBegin_Tournament", "Pages");
  const pageTreeTournament = get<HTMLElement>("pagesTree_Tournament", "Pages");
  const pageParametre = get<HTMLElement>("pagesParametre", "Pages");
  const pageError = get<HTMLElement>("pagesError", "Pages");

  // ========================================
  // PAGE ERREUR
  // ========================================
  const errorCodeEl = query<HTMLElement>(".error-code", "Error");
  const errorDescriptionEl = query<HTMLElement>(".error-description", "Error");
  const errorImageEl = get<HTMLImageElement>("error-image", "Error");

  // ========================================
  // PAGE RÉSULTAT
  // ========================================
  const winnerNameEl = get<HTMLElement>("winner-name", "Result");
  const player1NameEl = get<HTMLElement>("player1-name", "Result");
  const player1ScoreEl = get<HTMLElement>("player1-score", "Result");
  const player2NameEl = get<HTMLElement>("player2-name", "Result");
  const player2ScoreEl = get<HTMLElement>("player2-score", "Result");

  // ========================================
  // PAGE PARAMETRE
  // ========================================
  const volumeSlider = get<HTMLInputElement>("volume-slider", "Parametre");
  const volumeValue = get<HTMLElement>("volume-value", "Parametre");

  // ========================================
  // PAGE MATCH
  // ========================================
  const playerCardL = get<HTMLElement>("player-Left-Card-Match", "Match");
  const playerCardR = get<HTMLElement>("player-Right-Card-Match", "Match");

  // ========================================
  // GAME CONFIG (Formulaire Match Config)
  // ========================================
  const formulaireGameConfig = get<HTMLFormElement>("match-form", "GameConfig");
  const inputFormulaireGameConfig_PlayerLeft = get<HTMLInputElement>("playerLeft", "GameConfig");
  const inputFormulaireGameConfig_PlayerRight = get<HTMLInputElement>("playerRight", "GameConfig");

  // ========================================
  // TOURNOI
  // ========================================
  const texteWhovsWho = query<HTMLElement>(".texte-label", "Tournament");
  const spanWhoVsWho = get<HTMLElement>("WhoVsWho", "Tournament");
  const divOfButton = query<HTMLElement>(".menu-buttons-tree-tournament-padding", "Tournament");
  const form = get<HTMLFormElement>("tournament-form", "Tournament");

  // Formulaire des pseudos (optimisé avec helper)
  const formPseudoTournament = getInputArray(
    ["player1", "player2", "player3", "player4"],
    "Tournament - Pseudos"
  );

  // Checkboxes humain/IA (optimisé avec helper)
  const formIsHumanCheckbox = getInputArray(
    ["human1", "human2", "human3", "human4"],
    "Tournament - Checkboxes"
  );

  // ========================================
  // BOUTONS
  // ========================================
  const nextResult = get<HTMLButtonElement>("next-btn_result", "Buttons");
  const giveUpTournament = get<HTMLButtonElement>("givUpTournament", "Buttons");
  const startMatchTournament = get<HTMLButtonElement>("doMatchTournament", "Buttons");
  const startMusic = get<HTMLButtonElement>("start-music", "Buttons");
  const dontStartMusic = get<HTMLButtonElement>("dont-start-music", "Buttons");
  const linkButtons = queryAll<HTMLButtonElement>("button[data-link]", "Buttons");
  const allButtons = queryAll<HTMLButtonElement>("button", "Buttons");

  // ========================================
  // ICÔNES
  // ========================================
  const iconAccueil = get<HTMLElement>("icon-accueil", "Icons");
  const iconSettings = get<HTMLElement>("icon-settings", "Icons");
  const iconSound = get<HTMLElement>("icon-sound", "Icons");

  // Récupération de l'image dans l'icône son
  const iconSoundImg = iconSound.querySelector<HTMLImageElement>("img");
  if (!iconSoundImg) {
    throw new Error("❌ [Icons] Image manquante dans l'icône son");
  }

  // ========================================
  // MÉDIA (MUSIQUE & IMAGES)
  // ========================================
  const music = get<HTMLAudioElement>("arcade-music", "Media");
  const popup = get<HTMLElement>("music-popup", "Media");

  // ========================================
  // STYLE CSS
  // ========================================
  const style = query<HTMLLinkElement>('link[href="/static/css/main_style.css"]', "Style");

  // ========================================
  // SOUS-TITRES (pour update_description)
  // ========================================
  const subtitles = queryAll<HTMLElement>('.arcade-subtitle', "Subtitles");

  // ========================================
  // ASSEMBLAGE ET RETOUR DE TOUS LES ÉLÉMENTS
  // ========================================
  return {
    pages: {
      login: pageLogin,
      signup: pageSignup,
      accueil: pageAccueil,
      gameConfig : pageGameConfig,
      match: pageMatch,
      result: pageResult,
      beginTournament: pageBeginTournament,
      treeTournament: pageTreeTournament,
      parametre: pageParametre,
      error: pageError,
    },

    errorElement: {
      codeEl: errorCodeEl,
      descriptionEl: errorDescriptionEl,
      imageEl: errorImageEl,
    },

    resultElement: {
      winnerNameEl,
      player1NameEl,
      player1ScoreEl,
      player2NameEl,
      player2ScoreEl,
    },

    parametreElement: {
      volumeSlider,
      volumeValue,
    },

    matchElement: {
      playerCardL,
      playerCardR,
    },

    gameConfigElement: {
      formulaireGameConfig,
      inputFormulaireGameConfig_PlayerLeft,
      inputFormulaireGameConfig_PlayerRight,
    },

    tournamentElement: {
      texteWhovsWho,
      spanWhoVsWho,
      divOfButton,
      form,
      formPseudoTournament,
      formIsHumanCheckbox,
    },

    buttons: {
      nextResult,
      giveUpTournament,
      startMatchTournament,
      startMusic,
      dontStartMusic,
      linkButtons,
      allButtons,
    },

    icons: {
      accueil: iconAccueil,
      settings: iconSettings,
      sound: iconSound,
    },

    media: {
      music: { main_theme: music },
      image: { sound: iconSoundImg },
    },

    popup: {
      startOrNotMusic: popup,
    },

    subtitles,

    canva,
    ctx,
    style,
  };
}


