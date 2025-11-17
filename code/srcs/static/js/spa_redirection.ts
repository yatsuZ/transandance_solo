import { DOMElements } from './dom_gestion.js';
import { SiteManagement } from './SiteManagement.js';
import { clear_Formulaire_Of_Tournament, findPageFromUrl, updateUrl } from './utils.js';
// SPA et REDIRECTION

/**
 * Initialise le système SPA avec routing
 * @param allDOMElement - Tous les éléments DOM
 * @param activePage - Page active au démarrage
 * @param customPopStateHandler - Handler personnalisé pour popstate (fourni par SiteManagement)
 */
export function initSPA(allDOMElement: DOMElements, activePage: HTMLElement | null,customPopStateHandler?: (event: PopStateEvent) => void) {
  const iconAccueil = allDOMElement.icons.accueil;
  const iconSettings = allDOMElement.icons.settings;

  if (!activePage) return console.error("Pas reussie a recupere .active");
  if (!iconAccueil) return console.error("Pas reussie a recupere #icon-accueil");
  if (!iconSettings) return console.error("Pas reussie a recupere icon-settings");

  // GÉRER LE RELOAD (F5) : Restaurer la page depuis l'URL // a modifier plus tard car serveur qui sen occupera
  const currentPath = window.location.pathname;
  if (currentPath !== '/' && currentPath !== '/accueil') {
    console.log("🔄 Reload détecté, restauration de la page depuis l'URL:", currentPath);
    const pageToRestore = findPageFromUrl(currentPath, allDOMElement.pages);
    if (pageToRestore) {
      activePage = pageToRestore;
      // Ne pas appeler updateUrl ici car l'URL est déjà correcte
    }
  }

  if (activePage.id != "pagesAccueil")
    activeOrHiden(iconAccueil, "On")
  if (activePage.id != "pagesParametre")
    activeOrHiden(iconSettings, "On")

  // Activer la page initiale
  activeAnotherPage(activePage);

  // Mettre à jour l'URL seulement si on est sur la racine
  if (currentPath === '/' || currentPath === '/accueil') 
    updateUrl(activePage);

  // gere quand on click dans un bouton
  // Sélectionner uniquement les boutons avec data-link
  const linkButtons = allDOMElement.buttons.linkButtons;

  // Ajouter l'événement uniquement à ceux-là
  linkButtons.forEach(btn => {
    btn.addEventListener("click", (e) => redirectionDePage(e, allDOMElement, iconAccueil, iconSettings));
  });

  // Gérer le bouton précédent/suivant du navigateur
  // Si un handler custom est fourni (par SiteManagement), l'utiliser
  if (customPopStateHandler) {
    window.addEventListener("popstate", customPopStateHandler);
    console.log("✅ Listener popstate personnalisé ajouté (géré par SiteManagement)");
  }
}

function redirectionDePage(e: PointerEvent, dO: DOMElements,iconAccueil: HTMLElement, iconSettings: HTMLElement) {
  e.preventDefault();
  const target = (e.target as Element | null);
  const link = target?.closest("button[data-link]");
  if (!link) return console.error("Bouton avec data-link introuvable");
  const get_data_link = link.getAttribute("data-link");
  if (!get_data_link || get_data_link.startsWith("go_to_") === false)
    return console.log("it s not a data-link for redirection:", get_data_link);
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
  SiteManagement.activePage = element;
}