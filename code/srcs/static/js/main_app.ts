import { initSPA } from './spa_redirection.js';
import { initPopUpStartMusic, initOnOffMusic } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import {PongGame} from './game.js';

function script_js_du_coter_client()
{
  const style = document.querySelector<HTMLLinkElement>('link[href="/static/css/main_style.css"]');
  if (!style)
  {
    console.error("Pas reussie a recupere style.css");
    return;
  }

  if (style.sheet) 
    initSPA();
  else
    style.addEventListener("load", initSPA);
  
  initPopUpStartMusic();
  initOnOffMusic();
  update_description_de_page();
  
  const iconSettings = document.getElementById('icon-settings');
  if (!iconSettings)
  {
    console.error("Pas reussie a recupere icon-settings");
    return;
  }
  iconSettings.addEventListener('click', () => {
    alert("⚙️ Paramètres à venir !");
  });
}

script_js_du_coter_client();


document.addEventListener("DOMContentLoaded", () => {
  const activePage = document.querySelector('.active') as HTMLElement | null;
  // recupere la page active si la page active est match alors on active le jeux
  if (activePage?.id === "pagesMatch")
  {
    const pongGame = new PongGame('pong-canvas');
  }

});


