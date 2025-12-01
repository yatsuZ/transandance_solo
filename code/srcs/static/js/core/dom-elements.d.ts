/**
 * Type représentant tous les éléments DOM de l'application
 */
export type DOMElements = {
  pages: Record<
    "login" | "signup" | "accueil" | "profile" | "leaderboard" | "gameConfig" | "match" | "result" | "beginTournament" | "treeTournament" | "parametre" | "error",
    HTMLElement
  >;

  errorElement: {
    codeEl: HTMLElement;
    descriptionEl: HTMLElement;
    imageEl: HTMLImageElement;
  };

  resultElement: Record<
    "winnerNameEl" | "player1NameEl" | "player1ScoreEl" | "player2NameEl" | "player2ScoreEl",
    HTMLElement
  >;

  parametreElement: {
    volumeSlider: HTMLInputElement;
    volumeValue: HTMLElement;
    logoutBtn: HTMLButtonElement;
  };

  matchElement: Record<
    "playerCardL" | "playerCardR",
    HTMLElement
  >;

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

  tournamentElement: {
    texteWhovsWho: HTMLElement;
    spanWhoVsWho: HTMLElement;
    divOfButton: HTMLElement;
    form: HTMLFormElement;
    formPseudoTournament: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    formIsHumanCheckbox: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    formIsMeCheckbox: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
  };

  buttons: {
    nextResult: HTMLButtonElement;
    giveUpTournament: HTMLButtonElement;
    startMatchTournament: HTMLButtonElement;
    startMusic: HTMLButtonElement;
    dontStartMusic: HTMLButtonElement;
    linkButtons: HTMLButtonElement[];
    allButtons: HTMLButtonElement[]; // Tous les boutons du document
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

  profile: {
    username: HTMLElement;
    pdp : HTMLImageElement;
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
  }

  leaderboard: {
    avatar1: HTMLImageElement;
    avatar2: HTMLImageElement;
    avatar3: HTMLImageElement;
    username1: HTMLElement;
    username2: HTMLElement;
    username3: HTMLElement;
    wins1: HTMLElement;
    wins2: HTMLElement;
    wins3: HTMLElement;
    tableBody: HTMLElement;
    tableContainer: HTMLElement;
    empty: HTMLElement;
    podium: HTMLElement;
  }

  subtitles: HTMLElement[];

  canva: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  style: HTMLLinkElement;
};