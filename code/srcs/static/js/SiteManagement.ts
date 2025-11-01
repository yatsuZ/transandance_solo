import { PongGame } from './game.js';
import { initPopUpStartMusic, initOnOffMusic } from './music_gestion.js';
import { update_description_de_page } from './update_description.js';
import { initSPA } from './spa_redirection.js';

export class SiteManagement {
  private pongGame: PongGame | null = null;

  constructor() {
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  private init() {
    this.initStyleAndSPA();// fais
    this.initMusic();
    this.initPageEvents();
    this.initGameIfNeeded();
  }

  // gere le spa et charge le css avant dafficher le site
  private initStyleAndSPA() {
    const style = document.querySelector<HTMLLinkElement>('link[href="/static/css/main_style.css"]');
    if (!style) return console.error("Pas reussie a recupere style.css");

    if (style.sheet) initSPA();
    else style.addEventListener("load", initSPA);
  }

  // gere la gestion de music
  private initMusic() {
    initPopUpStartMusic();
    initOnOffMusic();
  }

  // gere les evenemnt action bouton
  private initPageEvents() {
    update_description_de_page();

    const iconSettings = document.getElementById('icon-settings');
    if (!iconSettings) return console.error("Pas reussie a recupere icon-settings");

    iconSettings.addEventListener('click', () => alert("⚙️ Paramètres à venir !"));
  }

  private initGameIfNeeded() {
    const activePage = document.querySelector('.active') as HTMLElement | null;
    if (activePage?.id === "pagesMatch") {
      const header = activePage.querySelector('.arcade-header') as HTMLElement | null;
      if (header) header.style.borderBottom = 'none';

      this.pongGame = new PongGame('pong-canvas');
    }
  }
}
