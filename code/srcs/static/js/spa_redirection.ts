import { DOMElements } from './SiteManagement.js';
import { clear_Formulaire_Of_Tournament, updateUrl } from './utils.js';
// SPA et REDIRECTION

export function initSPA(allDOMElement : DOMElements, activePage : HTMLElement |null ) {
  const iconAccueil = allDOMElement.icons.accueil;
  const iconSettings = allDOMElement.icons.settings;

  if (!activePage) return console.error("Pas reussie a recupere .active");
  if (!iconAccueil) return console.error("Pas reussie a recupere #icon-accueil");
  if (!iconSettings) return console.error("Pas reussie a recupere icon-settings");

  // iconSettings.addEventListener('click', () => alert("⚙️ Paramètres à venir !"));


  if (activePage.id != "pagesAccueil")
    activeOrHiden(iconAccueil, "On")
  if (activePage.id != "pagesParametre")
    activeOrHiden(iconSettings, "On")

  updateUrl(activePage);

  // gere quand on click dans un bouton
  // Sélectionner uniquement les boutons avec data-link
  const linkButtons = allDOMElement.buttons.linkButtons;

  // Ajouter l'événement uniquement à ceux-là
  linkButtons.forEach(btn => {
    btn.addEventListener("click", (e) => redirectionDePage(e, allDOMElement, iconAccueil, iconSettings));
  });
}

function redirectionDePage(e: PointerEvent, dO: DOMElements,iconAccueil: HTMLElement, iconSettings: HTMLElement) {
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
  const targetPage = findPage(dO.pages, targetId);
  if (targetPage === null) return;

  // Reset inputs
  clear_Formulaire_Of_Tournament(dO.tournamentElement.formPseudoTournament)
  activeAnotherPage(targetPage);
  updateUrl(targetPage);
}


////////////////////////////////////// UTIL


// a patir de la string on checher la page qui se sera la nvl page actif mais en vrai on devrais lappeler juste find Page
function findPage(allPages: DOMElements["pages"], targetId : string) : HTMLElement | null
{
  let targetPage = Object.values(allPages).find(p => p?.id === targetId);

  if (!targetPage) {
    console.warn(`[SPA] Page "${targetId}" introuvable dans DOMElements, tentative de récupération via document.getElementById...`);
    const tmpTargetPage = document.getElementById(targetId) as HTMLElement | null;
    if (tmpTargetPage) console.log(`[SPA] Page "${tmpTargetPage}" récupérée avec succès via document.getElementById.`);
    else console.error(`[SPA] Impossible de récupérer la page "${tmpTargetPage}" depuis le DOM.`);
    return tmpTargetPage;
  }
  return targetPage
}

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