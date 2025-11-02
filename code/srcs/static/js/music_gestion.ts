// === GESTION DE LA MUSIQUE ===

export function initMusicSystem() {
  const music = document.getElementById('arcade-music') as HTMLAudioElement | null;
  const popup = document.getElementById('music-popup');
  const startBtn = document.getElementById('start-music');
  const dontStartBtn = document.getElementById('dont-start-music');
  const iconSound = document.getElementById('icon-sound');
  const iconSoundImg = iconSound?.querySelector('img') as HTMLImageElement | null;

  if (!music || !popup || !startBtn || !dontStartBtn || !iconSoundImg || !iconSound)
    return console.error("initMusicSystem: élément(s) manquant(s)");


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

