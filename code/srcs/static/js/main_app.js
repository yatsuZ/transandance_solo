import { initSPA } from './spa_redirection.js';
import { initPopUpStartMusic, initOnOffMusic } from './music_gestion.js';

const style = document.querySelector('link[href="/static/css/main_style.css"]');

if (style.sheet) {
  initSPA();
} else {
  style.addEventListener("load", initSPA);
}

initPopUpStartMusic();
initOnOffMusic();

const iconSettings = document.getElementById('icon-settings');

iconSettings.addEventListener('click', () => {
  alert("⚙️ Paramètres à venir !");
});


