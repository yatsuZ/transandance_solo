/**
 * Type représentant tous les éléments DOM de l'application
 */
export type DOMElements = {
  pages: Record<
    "login" | "signup" | "accueil" | "gameConfig" | "match" | "result" | "beginTournament" | "treeTournament" | "parametre" | "error",
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
  };

  matchElement: Record<
    "playerCardL" | "playerCardR",
    HTMLElement
  >;

  gameConfigElement: {
    formulaireGameConfig: HTMLFormElement;
    inputFormulaireGameConfig_PlayerLeft: HTMLInputElement;
    inputFormulaireGameConfig_PlayerRight: HTMLInputElement;
  };

  tournamentElement: {
    texteWhovsWho: HTMLElement;
    spanWhoVsWho: HTMLElement;
    divOfButton: HTMLElement;
    form: HTMLFormElement;
    formPseudoTournament: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    formIsHumanCheckbox: [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
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

  subtitles: HTMLElement[];

  canva: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  style: HTMLLinkElement;
};