import { DOMElements } from "../core/dom-elements.js";
import { SiteManagement } from "../SiteManagement.js";

/**
 * Active ou masque un élément HTML
 * @param element - Élément à modifier
 * @param onOrOff - "On" pour activer, "Off" pour masquer
 */
export function activeOrHiden(element: HTMLElement | Element, onOrOff: "On" | "Off" = "Off") {
  if (onOrOff === "On") {
    element.classList.remove("hidden");
    element.classList.add("active");
  } else {
    element.classList.add("hidden");
    element.classList.remove("active");
  }
}

/**
 * Active une page et la définit comme page active dans SiteManagement
 * @param element - Page à activer
 */
export function activeAnotherPage(element: HTMLElement) {
  SiteManagement.activePage = element;
}

/**
 * Trouve une page dans la liste des pages par son ID
 * @param allPages - Toutes les pages disponibles
 * @param targetId - ID de la page à trouver
 * @returns La page trouvée ou null
 */
export function findPage(allPages: DOMElements["pages"], targetId: string): HTMLElement | null {
  let targetPage = Object.values(allPages).find(p => p?.id === targetId);

  if (!targetPage) {
    const tmpTargetPage = document.getElementById(targetId) as HTMLElement | null;
    return tmpTargetPage;
  }
  return targetPage;
}
