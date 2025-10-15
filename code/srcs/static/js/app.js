// SPA et REDIRECTION
document.addEventListener("DOMContentLoaded", () => {

  document.body.addEventListener("click", async (e) => {

    const link = e.target.closest("a[data-link]");
    if (!link) return;

    e.preventDefault();
    const pageName = link.getAttribute("data-link"); // ex: "match"

    // cacher toutes les pages
    document.querySelectorAll(".page").forEach(p => {
      p.classList.add("hidden");
      p.classList.remove("active");
    });

    // montrer la bonne page
    const targetId = "pages" + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    // console.log("targetId == ", targetId);
    const targetPage = document.getElementById(targetId);

    if (targetPage) {
      targetPage.classList.remove("hidden");
      targetPage.classList.add("active");
    }
    // anime.js animation
    anime({
      targets: '#app .container .arcade-header .arcade-title',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 500
    });
    anime({
      targets: '#app .container .arcade-header .arcade-subtitle',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 500
    });
  });
});

// Gestion de la music et nav icon
const music = document.getElementById('arcade-music');
const iconSound = document.getElementById('icon-sound');
const iconSettings = document.getElementById('icon-settings');
const popup = document.getElementById('music-popup');
const startBtn = document.getElementById('start-music');
const iconSoundImg = iconSound.querySelector('img');

let isPlaying = localStorage.getItem('isPlaying') === 'true';

// Quand l’utilisateur clique sur le bouton du pop-up
startBtn.addEventListener('click', () => {
  music.play().then(() => {
    isPlaying = true;
    iconSoundImg.src = './static/util/icon/son_on.png';
    localStorage.setItem('isPlaying', isPlaying);
    popup.style.display = 'none'; // on cache le pop-up
  }).catch(err => console.log("Erreur lecture musique :", err));
});

// Clic sur icône son pour play/pause
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

// Clic sur engrenage
iconSettings.addEventListener('click', () => {
  alert("⚙️ Paramètres à venir !");
});
