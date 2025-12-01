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
  const pageProfile = get<HTMLElement>("pagesProfile", "Pages");
  const pageLeaderboard = get<HTMLElement>("pagesLeaderboard", "Pages");
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
  const logoutBtn = get<HTMLButtonElement>("logout-btn", "Parametre");

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

  // Checkboxes "C'est moi"
  const checkboxGameConfig_PlayerLeftIsMe = get<HTMLInputElement>("playerLeftIsMe", "GameConfig");
  const checkboxGameConfig_PlayerRightIsMe = get<HTMLInputElement>("playerRightIsMe", "GameConfig");

  // Radios type Humain/IA
  const radioGameConfig_PlayerLeftTypeHuman = query<HTMLInputElement>('input[name="playerLeftType"][value="human"]', "GameConfig");
  const radioGameConfig_PlayerLeftTypeIA = query<HTMLInputElement>('input[name="playerLeftType"][value="ia"]', "GameConfig");
  const radioGameConfig_PlayerRightTypeHuman = query<HTMLInputElement>('input[name="playerRightType"][value="human"]', "GameConfig");
  const radioGameConfig_PlayerRightTypeIA = query<HTMLInputElement>('input[name="playerRightType"][value="ia"]', "GameConfig");

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

  // Checkboxes "C'est moi" pour tournoi
  const formIsMeCheckbox = getInputArray(
    ["isMe1", "isMe2", "isMe3", "isMe4"],
    "Tournament - C'est moi"
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
  const iconEdit = get<HTMLElement>("icon-edit", "Icons");
  const iconProfile = get<HTMLElement>("icon-profile", "Icons");
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
  // CONTROLS MODAL
  // ========================================
  const controlsModal = get<HTMLElement>("controls-modal", "ControlsModal");
  const controlsModalInputLeftUp = get<HTMLInputElement>("key-left-up", "ControlsModal");
  const controlsModalInputLeftDown = get<HTMLInputElement>("key-left-down", "ControlsModal");
  const controlsModalInputRightUp = get<HTMLInputElement>("key-right-up", "ControlsModal");
  const controlsModalInputRightDown = get<HTMLInputElement>("key-right-down", "ControlsModal");
  const controlsModalBtnSave = get<HTMLButtonElement>("save-controls-btn", "ControlsModal");
  const controlsModalBtnCancel = get<HTMLButtonElement>("cancel-controls-btn", "ControlsModal");

  // ========================================
  // PROFILE EDIT MODAL
  // ========================================
  const profileEditModal = get<HTMLElement>("profile-edit-modal", "ProfileEditModal");
  const profileEditForm = get<HTMLFormElement>("profile-edit-form", "ProfileEditModal");
  const profileEditPhotoPreview = get<HTMLImageElement>("profile-edit-preview", "ProfileEditModal");
  const profileEditPhotoInput = get<HTMLInputElement>("profile-edit-photo-input", "ProfileEditModal");
  const profileEditInputUsername = get<HTMLInputElement>("profile-edit-username", "ProfileEditModal");
  const profileEditInputEmail = get<HTMLInputElement>("profile-edit-email", "ProfileEditModal");
  const profileEditInputPassword = get<HTMLInputElement>("profile-edit-password", "ProfileEditModal");
  const profileEditInputPasswordConfirm = get<HTMLInputElement>("profile-edit-password-confirm", "ProfileEditModal");
  const profileEditMessage = get<HTMLElement>("profile-edit-message", "ProfileEditModal");
  const profileEditBtnSave = get<HTMLButtonElement>("profile-edit-save-btn", "ProfileEditModal");
  const profileEditBtnCancel = get<HTMLButtonElement>("profile-edit-cancel-btn", "ProfileEditModal");

  // ========================================
  // PROFILE PAGE ELEMENT
  // ========================================

  const ProfilePageUsername = get<HTMLElement>("profile-username", "ProfilePage");
  const ProfilePagepdp = get<HTMLImageElement>("profile-picture", "ProfilePage");
  const ProfilePageStatMatch = get<HTMLElement>("stat-matches", "ProfilePage");
  const ProfilePageStatWin = get<HTMLElement>("stat-wins", "ProfilePage");
  const ProfilePageStatLose = get<HTMLElement>("stat-losses", "ProfilePage");
  const ProfilePageStatTournamentsPlayed = get<HTMLElement>("stat-tournaments-played", "ProfilePage");
  const ProfilePageStatTournamentsWon = get<HTMLElement>("stat-tournaments-won", "ProfilePage");
  const ProfilePageStatGoal = get<HTMLElement>("stat-goals-for", "ProfilePage");
  const ProfilePageStatGoalAgainst = get<HTMLElement>("stat-goals-against", "ProfilePage");

  const ProfilePageControlLU = get<HTMLElement>("control-left-up", "ProfilePage");
  const ProfilePageControlLD = get<HTMLElement>("control-left-down", "ProfilePage");
  const ProfilePageControlRU = get<HTMLElement>("control-right-up", "ProfilePage");
  const ProfilePageControlRD = get<HTMLElement>("control-right-down", "ProfilePage");

  const ProfilePagebtnEditControl = get<HTMLElement>("edit-controls-btn", "ProfilePage");

  const ProfilePageHistoryList = get<HTMLElement>("history-list", "ProfilePage");
  const ProfilePageHistoryEmpty = get<HTMLElement>("history-empty", "ProfilePage");

  // ========================================
  // LEADERBOARD PAGE ELEMENT
  // ========================================

  const LeaderboardAvatar1 = get<HTMLImageElement>("leaderboard-avatar-1", "LeaderboardPage");
  const LeaderboardAvatar2 = get<HTMLImageElement>("leaderboard-avatar-2", "LeaderboardPage");
  const LeaderboardAvatar3 = get<HTMLImageElement>("leaderboard-avatar-3", "LeaderboardPage");
  const LeaderboardUsername1 = get<HTMLElement>("leaderboard-username-1", "LeaderboardPage");
  const LeaderboardUsername2 = get<HTMLElement>("leaderboard-username-2", "LeaderboardPage");
  const LeaderboardUsername3 = get<HTMLElement>("leaderboard-username-3", "LeaderboardPage");
  const LeaderboardWins1 = get<HTMLElement>("leaderboard-wins-1", "LeaderboardPage");
  const LeaderboardWins2 = get<HTMLElement>("leaderboard-wins-2", "LeaderboardPage");
  const LeaderboardWins3 = get<HTMLElement>("leaderboard-wins-3", "LeaderboardPage");
  const LeaderboardTableBody = get<HTMLElement>("leaderboard-table-body", "LeaderboardPage");
  const LeaderboardTableContainer = query<HTMLElement>(".leaderboard-table-container", "LeaderboardPage");
  const LeaderboardEmpty = get<HTMLElement>("leaderboard-empty", "LeaderboardPage");
  const LeaderboardPodium = query<HTMLElement>(".podium", "LeaderboardPage");

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
      profile: pageProfile,
      leaderboard: pageLeaderboard,
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
      logoutBtn,
    },

    matchElement: {
      playerCardL,
      playerCardR,
    },

    gameConfigElement: {
      formulaireGameConfig,
      inputFormulaireGameConfig_PlayerLeft,
      inputFormulaireGameConfig_PlayerRight,
      checkboxGameConfig_PlayerLeftIsMe,
      checkboxGameConfig_PlayerRightIsMe,
      radioGameConfig_PlayerLeftTypeHuman,
      radioGameConfig_PlayerLeftTypeIA,
      radioGameConfig_PlayerRightTypeHuman,
      radioGameConfig_PlayerRightTypeIA,
    },

    tournamentElement: {
      texteWhovsWho,
      spanWhoVsWho,
      divOfButton,
      form,
      formPseudoTournament,
      formIsHumanCheckbox,
      formIsMeCheckbox,
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
      edit: iconEdit,
      profile: iconProfile,
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

    controlsModal: {
      modal: controlsModal,
      inputLeftUp: controlsModalInputLeftUp,
      inputLeftDown: controlsModalInputLeftDown,
      inputRightUp: controlsModalInputRightUp,
      inputRightDown: controlsModalInputRightDown,
      btnSave: controlsModalBtnSave,
      btnCancel: controlsModalBtnCancel,
    },

    profileEditModal: {
      modal: profileEditModal,
      form: profileEditForm,
      photoPreview: profileEditPhotoPreview,
      photoInput: profileEditPhotoInput,
      inputUsername: profileEditInputUsername,
      inputEmail: profileEditInputEmail,
      inputPassword: profileEditInputPassword,
      inputPasswordConfirm: profileEditInputPasswordConfirm,
      message: profileEditMessage,
      btnSave: profileEditBtnSave,
      btnCancel: profileEditBtnCancel,
    },

    profile: {
      username: ProfilePageUsername,
      pdp : ProfilePagepdp,
      statMatch: ProfilePageStatMatch,
      statWin: ProfilePageStatWin,
      statLose: ProfilePageStatLose,
      statTournamentsPlayed: ProfilePageStatTournamentsPlayed,
      statTournamentsWon: ProfilePageStatTournamentsWon,
      statGoal: ProfilePageStatGoal,
      statGoalAgainst: ProfilePageStatGoalAgainst,

      ControlLU: ProfilePageControlLU,
      ControlLD: ProfilePageControlLD,
      ControlRU: ProfilePageControlRU,
      ControlRD: ProfilePageControlRD,

      btnEditControl: ProfilePagebtnEditControl,

      historyList: ProfilePageHistoryList,
      historyEmpty: ProfilePageHistoryEmpty,
    },

    leaderboard: {
      avatar1: LeaderboardAvatar1,
      avatar2: LeaderboardAvatar2,
      avatar3: LeaderboardAvatar3,
      username1: LeaderboardUsername1,
      username2: LeaderboardUsername2,
      username3: LeaderboardUsername3,
      wins1: LeaderboardWins1,
      wins2: LeaderboardWins2,
      wins3: LeaderboardWins3,
      tableBody: LeaderboardTableBody,
      tableContainer: LeaderboardTableContainer,
      empty: LeaderboardEmpty,
      podium: LeaderboardPodium,
    },

    subtitles,

    canva,
    ctx,
    style,
  };
}


