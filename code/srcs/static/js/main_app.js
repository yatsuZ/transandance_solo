import { initSPA } from './spa_redirection.js';
import { initPopUpStartMusic, initOnOffMusic } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';

const style = document.querySelector('link[href="/static/css/main_style.css"]');

if (style.sheet) {
  initSPA();
} else {
  style.addEventListener("load", initSPA);
}

initPopUpStartMusic();
initOnOffMusic();
update_description_de_page();

const iconSettings = document.getElementById('icon-settings');

iconSettings.addEventListener('click', () => {
  alert("⚙️ Paramètres à venir !");
});


