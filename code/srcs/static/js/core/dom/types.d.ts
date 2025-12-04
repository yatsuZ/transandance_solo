/**
 * Types pour les sections du DOM organisées par module
 */

// ========================================
// AUTH
// ========================================
export interface AuthElements {
  loginForm: HTMLFormElement;
  signupForm: HTMLFormElement;
  loginError: HTMLElement;
  signupError: HTMLElement;
  loginBtn: HTMLButtonElement;
  signupBtn: HTMLButtonElement;

  // 2FA Login
  loginFormSection: HTMLElement;
  twofaInputSection: HTMLElement;
  twofaCodeInput: HTMLInputElement;
  btnVerify2FA: HTMLButtonElement;
  btnCancel2FA: HTMLButtonElement;
  twofaInputError: HTMLElement;
}

// ========================================
// PROFILE
// ========================================
export interface ProfileElements {
  username: HTMLElement;
  pdp: HTMLImageElement;
  statMatch: HTMLElement;
  statWin: HTMLElement;
  statLose: HTMLElement;
  statTournamentsPlayed: HTMLElement;
  statTournamentsWon: HTMLElement;
  statGoal: HTMLElement;
  statGoalAgainst: HTMLElement;
  ControlLU: HTMLElement;
  ControlLD: HTMLElement;
  ControlRU: HTMLElement;
  ControlRD: HTMLElement;
  btnEditControl: HTMLElement;
  historyList: HTMLElement;
  historyEmpty: HTMLElement;
  friendsCount: HTMLElement;
  friendsList: HTMLElement;
  friendsEmpty: HTMLElement;
}

// ========================================
// LEADERBOARD
// ========================================
export interface LeaderboardElements {
  avatar1: HTMLImageElement;
  avatar2: HTMLImageElement;
  avatar3: HTMLImageElement;
  username1: HTMLElement;
  username2: HTMLElement;
  username3: HTMLElement;
  matches1: HTMLElement;
  matches2: HTMLElement;
  matches3: HTMLElement;
  goals1: HTMLElement;
  goals2: HTMLElement;
  goals3: HTMLElement;
  goalsConceded1: HTMLElement;
  goalsConceded2: HTMLElement;
  goalsConceded3: HTMLElement;
  friends1: HTMLElement;
  friends2: HTMLElement;
  friends3: HTMLElement;
  tableBody: HTMLElement;
  empty: HTMLElement;
  noMatchSection: HTMLElement;
  podiumSection: HTMLElement;
  rankingSection: HTMLElement;
}

// ========================================
// GAME (Match + Tournament + Canvas)
// ========================================
export interface GameElements {
  canva: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  matchElement: {
    playerCardL: HTMLElement;
    playerCardR: HTMLElement;
  };
  gameConfigElement: {
    formulaireGameConfig: HTMLFormElement;
    inputFormulaireGameConfig_PlayerLeft: HTMLInputElement;
    inputFormulaireGameConfig_PlayerRight: HTMLInputElement;
    checkboxGameConfig_PlayerLeftIsMe: HTMLInputElement;
    checkboxGameConfig_PlayerRightIsMe: HTMLInputElement;
    radioGameConfig_PlayerLeftTypeHuman: HTMLInputElement;
    radioGameConfig_PlayerLeftTypeIA: HTMLInputElement;
    radioGameConfig_PlayerRightTypeHuman: HTMLInputElement;
    radioGameConfig_PlayerRightTypeIA: HTMLInputElement;
  };
  resultElement: {
    winnerNameEl: HTMLElement;
    player1NameEl: HTMLElement;
    player1ScoreEl: HTMLElement;
    player2NameEl: HTMLElement;
    player2ScoreEl: HTMLElement;
  };
  tournamentElement: {
    texteWhovsWho: HTMLElement;
    spanWhoVsWho: HTMLElement;
    divOfButton: HTMLElement;
    form: HTMLFormElement;
    formPseudoTournament: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    formIsHumanCheckbox: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    formIsMeCheckbox: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
  };
}

// ========================================
// UI (Pages + Buttons + Icons + Media)
// ========================================
export interface UIElements {
  pages: Record<
    "login" | "signup" | "accueil" | "profile" | "leaderboard" | "gameConfig" | "match" | "result" | "beginTournament" | "treeTournament" | "parametre" | "error",
    HTMLElement
  >;
  errorElement: {
    codeEl: HTMLElement;
    descriptionEl: HTMLElement;
    imageEl: HTMLImageElement;
  };
  parametreElement: {
    volumeSlider: HTMLInputElement;
    volumeValue: HTMLElement;
    logoutBtn: HTMLButtonElement;

    // 2FA Settings
    twofaDisabled: HTMLElement;
    twofaSetup: HTMLElement;
    twofaEnabled: HTMLElement;
    twofaQRCode: HTMLImageElement;
    twofaVerifyCode: HTMLInputElement;
    twofaDisableModal: HTMLElement;
    twofaDisableCode: HTMLInputElement;
    btnSetup2FA: HTMLButtonElement;
    btnActivate2FA: HTMLButtonElement;
    btnDisable2FA: HTMLButtonElement;
    btnConfirmDisable: HTMLButtonElement;
    btnCancelSetup: HTMLButtonElement;
    btnCancelDisable: HTMLButtonElement;
    twofaSetupError: HTMLElement;
    twofaDisableError: HTMLElement;
  };
  buttons: {
    nextResult: HTMLButtonElement;
    giveUpTournament: HTMLButtonElement;
    startMatchTournament: HTMLButtonElement;
    startMusic: HTMLButtonElement;
    dontStartMusic: HTMLButtonElement;
    linkButtons: HTMLButtonElement[];
    allButtons: HTMLButtonElement[];
  };
  icons: {
    edit: HTMLElement;
    profile: HTMLElement;
    accueil: HTMLElement;
    settings: HTMLElement;
    sound: HTMLElement;
  };
  media: {
    music: {
      main_theme: HTMLAudioElement;
    };
    image: {
      sound: HTMLImageElement;
    };
  };
  popup: {
    startOrNotMusic: HTMLElement;
  };
  controlsModal: {
    modal: HTMLElement;
    inputLeftUp: HTMLInputElement;
    inputLeftDown: HTMLInputElement;
    inputRightUp: HTMLInputElement;
    inputRightDown: HTMLInputElement;
    btnSave: HTMLButtonElement;
    btnCancel: HTMLButtonElement;
  };
  profileEditModal: {
    modal: HTMLElement;
    form: HTMLFormElement;
    photoPreview: HTMLImageElement;
    photoInput: HTMLInputElement;
    inputUsername: HTMLInputElement;
    inputEmail: HTMLInputElement;
    inputPassword: HTMLInputElement;
    inputPasswordConfirm: HTMLInputElement;
    message: HTMLElement;
    btnSave: HTMLButtonElement;
    btnCancel: HTMLButtonElement;
  };
  subtitles: HTMLElement[];
  style: HTMLLinkElement;
}
