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

export function updateUrl(page: HTMLElement, prefix: string = "") {
  SiteManagement.activePage = page;

  const pageName = page.id.slice("pages".length).toLowerCase();
  const url = prefix ? `${prefix}/${pageName}` : `/${pageName}`;
  window.history.pushState({ page: pageName }, "", url);
}


// --- LOGGER ---

export function log(msg: string, type: "info"|"error"="info") {
  if(type === "error") console.error("[SiteManagement]", msg);
  else console.log("[SiteManagement]", msg);
}
