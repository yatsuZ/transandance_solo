/**
 * Gestion des éléments DOM pour l'interface utilisateur (pages, boutons, icons, media)
 */

import type { UIElements } from './types.js';

/**
 * Récupère tous les éléments DOM liés à l'UI
 */
export function getUIElements(): UIElements {
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

  const queryAll = <T extends HTMLElement>(sel: string, context: string): T[] => {
    const els = Array.from(document.querySelectorAll(sel)) as T[];
    if (els.length === 0) {
      throw new Error(`❌ [${context}] No elements found with selector "${sel}"`);
    }
    return els;
  };

  // Récupérer l'image dans l'icône son
  const iconSound = get<HTMLElement>("icon-sound", "Icons");
  const iconSoundImg = iconSound.querySelector<HTMLImageElement>("img");
  if (!iconSoundImg) {
    throw new Error("❌ [Icons] Image manquante dans l'icône son");
  }

  return {
    pages: {
      login: get<HTMLElement>("pagesLogin", "Pages"),
      signup: get<HTMLElement>("pagesSignup", "Pages"),
      accueil: get<HTMLElement>("pagesAccueil", "Pages"),
      profile: get<HTMLElement>("pagesProfile", "Pages"),
      leaderboard: get<HTMLElement>("pagesLeaderboard", "Pages"),
      gameConfig: get<HTMLElement>("pagesGame_Config", "Pages"),
      match: get<HTMLElement>("pagesMatch", "Pages"),
      result: get<HTMLElement>("pagesResult", "Pages"),
      beginTournament: get<HTMLElement>("pagesBegin_Tournament", "Pages"),
      treeTournament: get<HTMLElement>("pagesTree_Tournament", "Pages"),
      parametre: get<HTMLElement>("pagesParametre", "Pages"),
      error: get<HTMLElement>("pagesError", "Pages"),
    },
    errorElement: {
      codeEl: query<HTMLElement>(".error-code", "Error"),
      descriptionEl: query<HTMLElement>(".error-description", "Error"),
      imageEl: get<HTMLImageElement>("error-image", "Error"),
    },
    parametreElement: {
      volumeSlider: get<HTMLInputElement>("volume-slider", "Parametre"),
      volumeValue: get<HTMLElement>("volume-value", "Parametre"),
      logoutBtn: get<HTMLButtonElement>("logout-btn", "Parametre"),
    },
    buttons: {
      nextResult: get<HTMLButtonElement>("next-btn_result", "Buttons"),
      giveUpTournament: get<HTMLButtonElement>("givUpTournament", "Buttons"),
      startMatchTournament: get<HTMLButtonElement>("doMatchTournament", "Buttons"),
      startMusic: get<HTMLButtonElement>("start-music", "Buttons"),
      dontStartMusic: get<HTMLButtonElement>("dont-start-music", "Buttons"),
      linkButtons: queryAll<HTMLButtonElement>("button[data-link]", "Buttons"),
      allButtons: queryAll<HTMLButtonElement>("button", "Buttons"),
    },
    icons: {
      edit: get<HTMLElement>("icon-edit", "Icons"),
      profile: get<HTMLElement>("icon-profile", "Icons"),
      accueil: get<HTMLElement>("icon-accueil", "Icons"),
      settings: get<HTMLElement>("icon-settings", "Icons"),
      sound: iconSound,
    },
    media: {
      music: {
        main_theme: get<HTMLAudioElement>("arcade-music", "Media"),
      },
      image: {
        sound: iconSoundImg,
      },
    },
    popup: {
      startOrNotMusic: get<HTMLElement>("music-popup", "Media"),
    },
    controlsModal: {
      modal: get<HTMLElement>("controls-modal", "ControlsModal"),
      inputLeftUp: get<HTMLInputElement>("key-left-up", "ControlsModal"),
      inputLeftDown: get<HTMLInputElement>("key-left-down", "ControlsModal"),
      inputRightUp: get<HTMLInputElement>("key-right-up", "ControlsModal"),
      inputRightDown: get<HTMLInputElement>("key-right-down", "ControlsModal"),
      btnSave: get<HTMLButtonElement>("save-controls-btn", "ControlsModal"),
      btnCancel: get<HTMLButtonElement>("cancel-controls-btn", "ControlsModal"),
    },
    profileEditModal: {
      modal: get<HTMLElement>("profile-edit-modal", "ProfileEditModal"),
      form: get<HTMLFormElement>("profile-edit-form", "ProfileEditModal"),
      photoPreview: get<HTMLImageElement>("profile-edit-preview", "ProfileEditModal"),
      photoInput: get<HTMLInputElement>("profile-edit-photo-input", "ProfileEditModal"),
      inputUsername: get<HTMLInputElement>("profile-edit-username", "ProfileEditModal"),
      inputEmail: get<HTMLInputElement>("profile-edit-email", "ProfileEditModal"),
      inputPassword: get<HTMLInputElement>("profile-edit-password", "ProfileEditModal"),
      inputPasswordConfirm: get<HTMLInputElement>("profile-edit-password-confirm", "ProfileEditModal"),
      message: get<HTMLElement>("profile-edit-message", "ProfileEditModal"),
      btnSave: get<HTMLButtonElement>("profile-edit-save-btn", "ProfileEditModal"),
      btnCancel: get<HTMLButtonElement>("profile-edit-cancel-btn", "ProfileEditModal"),
    },
    subtitles: queryAll<HTMLElement>('.arcade-subtitle', "Subtitles"),
    style: query<HTMLLinkElement>('link[href="/static/css/main_style.css"]', "Style"),
  };
}
