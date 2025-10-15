// === GESTION DE LA MUSIQUE ===

export function initPopUpStartMusic() {
  const music = document.getElementById('arcade-music');
  const popup = document.getElementById('music-popup');
  const startBtn = document.getElementById('start-music');
  const iconSoundImg = document.querySelector('#icon-sound img');

  if (!music || !popup || !startBtn || !iconSoundImg) return;

  let isPlaying = localStorage.getItem('isPlaying') === 'true';

  startBtn.addEventListener('click', () => {
    music.play().then(() => {
      isPlaying = true;
      iconSoundImg.src = './static/util/icon/son_on.png';
      localStorage.setItem('isPlaying', isPlaying);
      popup.style.display = 'none';
    }).catch(err => console.log("Erreur lecture musique :", err));
  });
}

export function initOnOffMusic() {
  const music = document.getElementById('arcade-music');
  const iconSound = document.getElementById('icon-sound');
  const iconSoundImg = iconSound?.querySelector('img');

  if (!music || !iconSoundImg) return;

  let isPlaying = localStorage.getItem('isPlaying') === 'true';

  // Rétablit l’état au chargement
  iconSoundImg.src = isPlaying
    ? './static/util/icon/son_on.png'
    : './static/util/icon/son_off.png';

  if (isPlaying) music.play().catch(() => {});

  iconSound.addEventListener('click', () => {
    if (!isPlaying) {
      music.play().then(() => {
        isPlaying = true;
        iconSoundImg.src = './static/util/icon/son_on.png';
        localStorage.setItem('isPlaying', isPlaying);
      }).catch(err => console.log("Erreur lecture musique :", err));
    } else {
      music.pause();
      isPlaying = false;
      iconSoundImg.src = './static/util/icon/son_off.png';
      localStorage.setItem('isPlaying', isPlaying);
    }
  });
}
