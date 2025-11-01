// SPA et REDIRECTION

export function initSPA() {
  const iconAccueil = document.querySelector('#icon-accueil') as HTMLElement | null;
  if (!iconAccueil) return console.error("Pas reussie a recupere #icon-accueil");

  const activePage = document.querySelector('.active') as HTMLElement | null;

  if (activePage?.id != "pagesAccueil" && iconAccueil)// autamatise au depart
    activeOrHiden(iconAccueil, "On")

  // gere quand on click dans un bouton
  document.body.addEventListener("click", async (e) => redirectionDePage(e, iconAccueil));
}

function redirectionDePage(e: PointerEvent, iconAccueil: HTMLElement) {
    e.preventDefault();
    const target = (e.target as Element | null);
    const link = target?.closest("button[data-link]");
    if (!link) return console.error("Bouton avec data-link introuvable");
    const get_data_link = link.getAttribute("data-link");
    if (!get_data_link || get_data_link.startsWith("go_to_") === false)
      return console.error("data-link invalide:", get_data_link);
    const pageName = get_data_link.slice("go_to_".length); 

    activeOrHiden(iconAccueil, pageName === "accueil" ? "Off" : "On")

    const targetId = "pages" + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const targetPage = document.getElementById(targetId);
    if (!targetPage) return console.error("Page cible non trouvée:", targetId);

    document.querySelectorAll(".page").forEach(p => {
      activeOrHiden(p, "Off")
    });

    activeOrHiden(targetPage, "On")
}


////////////////////////////////////// UTIL


function activeOrHiden(element: HTMLElement | Element, onOrOff : "On" | "Off" = "Off")
{
  if (onOrOff == "On")
  {
    element.classList.remove("hidden");
    element.classList.add("active");
  }
  else
  {
    element.classList.add("hidden");
    element.classList.remove("active");
  }
}