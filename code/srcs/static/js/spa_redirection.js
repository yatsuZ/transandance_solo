import { animation_changement_de_page } from './animation.js';
import {init_canvas} from './canvas_draw.js';

// SPA et REDIRECTION
export function initSPA() {
  const iconAccueil = document.querySelector('#icon-accueil');

  document.addEventListener("DOMContentLoaded", () => {

    document.body.addEventListener("click", async (e) => {

      const link = e.target.closest("button[data-link]");
      if (!link) return;
      e.preventDefault();
      const get_data_link = link.getAttribute("data-link");
      if (get_data_link.startsWith("go_to_") === false) return
      const pageName = get_data_link.slice("go_to_".length); // ex: "match"

      if (pageName === "accueil")
      {
        iconAccueil.classList.add("hidden");
        iconAccueil.classList.remove("active");
      }
      else 
      {
        iconAccueil.classList.remove("hidden");
        iconAccueil.classList.add("active");
      }

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
      if (pageName === "match")
      {
        init_canvas();
      }
// cacher 
      // anime.js animation
      animation_changement_de_page()
    });
  });
}
