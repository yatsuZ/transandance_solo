import { SiteManagement } from "./SiteManagement.js";

// --- Configuration globale ---
const MAX_NAME_LENGTH = 16;
const VALID_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// --- Fonctions utilitaires qu'on export ---
export function collectPlayers(input_ids: string[]): string[] | null {
  const players: string[] = [];

  for (const id of input_ids) {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) {
      alert(`Le champ ${id} est introuvable dans le DOM !`);
      return null;
    }
    const pseudo = input.value.trim();
    if (pseudo === "") {
      alert("Tous les joueurs doivent avoir un pseudo !");
      return null;
    }
    players.push(pseudo);
  }

  return players;
}

export function clearInputs(input_ids: string[]): void {
  input_ids.forEach(id => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (input) input.value = "";
  });
}

export function arePlayersValid(players: string[]): boolean {
  for (const pseudo of players) {
    if (!isNameValid(pseudo) || !isNameLengthValid(pseudo)) return false;
  }
  return areNamesUnique(players);
}

export function updateUrl(page: HTMLElement, prefix: string = "") {
  SiteManagement.activePage = page;
  const pageName = page.id.slice("pages".length).toLowerCase();
  const url = prefix ? `${prefix}/${pageName}` : `/${pageName}`;
  window.history.pushState({ page: pageName }, "", url);
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
