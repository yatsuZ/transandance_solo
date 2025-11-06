// SPA et REDIRECTION

export function initSPA() {
  const iconAccueil = document.querySelector('#icon-accueil') as HTMLElement | null;
  const iconSettings = document.getElementById('icon-settings') as HTMLElement | null;
  const activePage = document.querySelector('.active') as HTMLElement | null;

  if (!activePage) return console.error("Pas reussie a recupere .active");
  if (!iconAccueil) return console.error("Pas reussie a recupere #icon-accueil");
  if (!iconSettings) return console.error("Pas reussie a recupere icon-settings");

  // iconSettings.addEventListener('click', () => alert("⚙️ Paramètres à venir !"));


  if (activePage.id != "pagesAccueil")
    activeOrHiden(iconAccueil, "On")
  if (activePage.id != "pagesParametre")
    activeOrHiden(iconSettings, "On")

  // gere quand on click dans un bouton
  // Sélectionner uniquement les boutons avec data-link
  const linkButtons = document.querySelectorAll<HTMLButtonElement>("button[data-link]");

  // Ajouter l'événement uniquement à ceux-là
  linkButtons.forEach(btn => {

    btn.addEventListener("click", (e) => redirectionDePage(e, iconAccueil, iconSettings));
  });
}

function redirectionDePage(e: PointerEvent, iconAccueil: HTMLElement, iconSettings: HTMLElement) {
    e.preventDefault();
    const target = (e.target as Element | null);
    const link = target?.closest("button[data-link]");
    if (!link) return console.error("Bouton avec data-link introuvable");
    const get_data_link = link.getAttribute("data-link");
    if (!get_data_link || get_data_link.startsWith("go_to_") === false)
      return console.log("data-link invalide:", get_data_link);
    const pageName = get_data_link.slice("go_to_".length);

    activeOrHiden(iconAccueil, pageName === "accueil" ? "Off" : "On")
    activeOrHiden(iconSettings, pageName === "parametre" ? "Off" : "On")

    const targetId = "pages" + pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const targetPage = document.getElementById(targetId);
    if (!targetPage) return console.error("Page cible non trouvée:", targetId);


    document.querySelectorAll(".page").forEach(p => {
      activeOrHiden(p, "Off")
    });

    activeOrHiden(targetPage, "On")
}


////////////////////////////////////// UTIL


export function activeOrHiden(element: HTMLElement | Element, onOrOff : "On" | "Off" = "Off")
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