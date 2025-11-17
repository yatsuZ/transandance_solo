import { DOMElements } from "./dom_gestion.js";
import { SiteManagement } from "./SiteManagement.js";


// --- Fonctions utilitaires qu'on export ---

// --- Configuration globale ---
// -- fonction utilie pour la classs tournoi
const MAX_NAME_LENGTH = 16;
const VALID_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export function collectPlayers(inputElements:DOMElements["tournamentElement"]["formPseudoTournament"]): string[] | null {
  const players: string[] = [];

  for (const input of inputElements) {
    const pseudo = input.value.trim();
    if (pseudo === "") {
      alert("Tous les joueurs doivent avoir un pseudo !");
      return null;
    }
    players.push(pseudo);
  }

  return players;
}

export function clear_Formulaire_Of_Tournament(inputElements:DOMElements["tournamentElement"]["formPseudoTournament"]): void {
  inputElements.forEach(input => {
    if (input) input.value = "";
  });
}

export function arePlayersValid(players: string[]): boolean {
  for (const pseudo of players) {
    if (!isNameValid(pseudo) || !isNameLengthValid(pseudo)) return false;
  }
  return areNamesUnique(players);
}

// --- Fonctions utilitaires ---
function isNameValid(name: string): boolean {
  if (!VALID_NAME_REGEX.test(name)) {
    alert(`Le pseudo "${name}" contient des caractères invalides.\nUtilise uniquement des lettres, chiffres, _ ou -`);
    return false;
  }
  return true;
}

function isNameLengthValid(name: string): boolean {
  if (name.length > MAX_NAME_LENGTH) {
    alert(`Le pseudo "${name}" est trop long (${name.length}/${MAX_NAME_LENGTH}).`);
    return false;
  }
  return true;
}

function areNamesUnique(players: string[]): boolean {
  const uniquePlayers = new Set(players);
  if (uniquePlayers.size !== players.length) {
    alert("Les pseudos des joueurs doivent être uniques !");
    return false;
  }
  return true;
}

// -- URL ---

/**
 * Trouve la page correspondante à partir d'une URL
 * Gère les chemins imbriqués comme /tournament/match ou /tournament/result
 */
export function findPageFromUrl(url: string, allPages: DOMElements["pages"]): HTMLElement | null {
  // Nettoyer l'URL et séparer les segments
  const segments = url.split('/').filter(s => s.length > 0);

  // CAS SPÉCIAL : URL racine "/" ou "/accueil" -> toujours page d'accueil
  if (segments.length === 0 || segments[segments.length - 1] === 'accueil') {
    return allPages.accueil;
  }

  // Dernier segment = nom de la page
  const pageName = segments[segments.length - 1];

  // Convertir en ID de page (ex: "match" -> "pagesMatch", "begin_tournament" -> "pagesBegin_Tournament")
  // Mettre en majuscule le premier caractère + chaque caractère après un underscore
  const convertedName = pageName
    .split('_')
    .map((part, index) => {
      // Première lettre de chaque partie en majuscule
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('_');

  const targetId = "pages" + convertedName;

  // Chercher dans les pages disponibles
  const targetPage = Object.values(allPages).find(p => p?.id === targetId);

  if (!targetPage) {
    console.warn(`[findPageFromUrl] Page "${targetId}" introuvable pour l'URL "${url}"`);
    return allPages.accueil; // Fallback sur accueil
  }

  return targetPage;
}

export function updateUrl(page: HTMLElement, prefix: string = "") {
  SiteManagement.activePage = page;

  const pageName = page.id.slice("pages".length).toLowerCase();
  const url = prefix ? `${prefix}/${pageName}` : `/${pageName}`;
  window.history.pushState({ page: pageName, prefix }, "", url);
}


// --- LOGGER ---

export function log(msg: string, type: "info"|"error"="info") {
  if(type === "error") console.error("[SiteManagement]", msg);
  else console.log("[SiteManagement]", msg);
}
