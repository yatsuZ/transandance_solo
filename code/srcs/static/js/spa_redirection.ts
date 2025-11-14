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
  const pageName = activePage.id.slice("pages".length).toLocaleLowerCase();
  const newUrl = `/${pageName}`;
  window.history.pushState({ page: pageName }, "", newUrl);

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


    // Reset inputs
    const inputIds = ["player1", "player2", "player3", "player4"];
    inputIds.forEach(id => {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input) input.value = "";
    });
    document.querySelectorAll(".page").forEach(p => {
      activeOrHiden(p, "Off")
    });

  activeOrHiden(targetPage, "On")
  // Met à jour l'URL sans recharger la page // ajouter cette evenemnt dans tournoi et game aussi 
  const newUrl = `/${pageName}`;
  window.history.pushState({ page: pageName }, "", newUrl);
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

export function activeAnotherPage(element: HTMLElement)
{
  document.querySelectorAll(".page").forEach(p => {activeOrHiden(p, "Off")});

  activeOrHiden(element, "On");
}