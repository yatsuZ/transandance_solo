import { animation_changement_de_page } from './animation.js';

// SPA et REDIRECTION
export function initSPA() {
  document.addEventListener("DOMContentLoaded", () => {

    document.body.addEventListener("click", async (e) => {

      const link = e.target.closest("button[data-link]");
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
      animation_changement_de_page()
    });
  });
}
