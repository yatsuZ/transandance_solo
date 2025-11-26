// === GESTION DE LA MUSIQUE ===

import { DOMElements } from "../core/dom-elements";

export function initMusicSystem(all_DO: DOMElements) {
  const music = all_DO.media.music.main_theme;
  const popup = all_DO.popup.startOrNotMusic;
  const startBtn = all_DO.buttons.startMusic;
  const dontStartBtn = all_DO.buttons.dontStartMusic;
  const iconSound = all_DO.icons.sound;
  const iconSoundImg = all_DO.media.image.sound;

  // attache les événements
  startBtn.addEventListener('click', () => handleStartMusic(music, iconSoundImg, popup));
  dontStartBtn.addEventListener('click', () => handleDontStartMusic(iconSoundImg, popup));

  const isPlaying = localStorage.getItem('isPlaying') === 'true';
  updateMusicUI(iconSoundImg, isPlaying ? 'on' : 'off');

  if (isPlaying) {music.play().catch(err => console.error("Erreur au démarrage musique :", err));}

  iconSound.addEventListener('click', () => toggleMusic(music, iconSoundImg));

}

// === UTILITAIRE ===

function handleStartMusic(music: HTMLAudioElement, iconSoundImg : HTMLImageElement, popup: HTMLElement) {
  music.play()
    .then(() => {
      updateMusicUI(iconSoundImg, 'on');
      popup.style.display = 'none';
    })
    .catch(err => console.error("Erreur lecture musique :", err));
}

function handleDontStartMusic(iconSoundImg : HTMLImageElement, popup: HTMLElement) {
  updateMusicUI(iconSoundImg, 'off');
  popup.style.display = 'none';
}

function toggleMusic(music: HTMLAudioElement, iconSoundImg : HTMLImageElement) {
  if (music.paused) {
    music.play()
      .then(() => updateMusicUI(iconSoundImg, 'on'))
      .catch(err => console.error("Erreur lecture musique :", err));
  } else {
    music.pause();
    updateMusicUI(iconSoundImg, 'off');
  }
}


// === UTILITAIRE COMMUN ===
function updateMusicUI(icon: HTMLImageElement, state: 'on' | 'off') {
  icon.src = `./static/util/icon/son_${state}.png`;
  localStorage.setItem('isPlaying', state === 'on' ? 'true' : 'false');
}

// === GESTION DU VOLUME ===
export function initVolumeControl(all_DO: DOMElements) {
  const music = all_DO.media.music.main_theme;
  const volumeSlider = all_DO.parametreElement.volumeSlider;
  const volumeValue = all_DO.parametreElement.volumeValue;

  // Récupérer le volume sauvegardé (par défaut 50%)
  const savedVolume = localStorage.getItem('musicVolume') || '50';
  const volumePercent = parseInt(savedVolume, 10);

  // Appliquer le volume initial
  music.volume = volumePercent / 100;
  volumeSlider.value = savedVolume;
  volumeValue.textContent = `${volumePercent}%`;

  // Événement sur le slider
  volumeSlider.addEventListener('input', () => {
    const value = parseInt(volumeSlider.value, 10);
    music.volume = value / 100;
    volumeValue.textContent = `${value}%`;
    localStorage.setItem('musicVolume', value.toString());
  });
}

