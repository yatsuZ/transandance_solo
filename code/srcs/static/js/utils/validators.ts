import { DOMElements } from "../core/dom-elements";

// --- Configuration globale ---
const MAX_NAME_LENGTH = 16;
const VALID_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Collecte les pseudos depuis les inputs du formulaire tournoi
 * @param inputElements - Les inputs du formulaire
 * @returns Array de pseudos ou null si invalide
 */
export function collectPlayers(inputElements: DOMElements["tournamentElement"]["formPseudoTournament"]): string[] | null {
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

/**
 * Vide le formulaire de tournoi
 * @param inputElements - Les inputs à vider
 */
export function clear_Formulaire_Of_Tournament(inputElements: DOMElements["tournamentElement"]["formPseudoTournament"]): void {
  inputElements.forEach(input => {
    if (input) input.value = "";
  });
}

/**
 * Vérifie que tous les joueurs ont des pseudos valides et uniques
 * @param players - Liste des pseudos
 * @returns true si tous les pseudos sont valides
 */
export function arePlayersValid(players: string[]): boolean {
  for (const pseudo of players) {
    if (!isNameValid(pseudo) || !isNameLengthValid(pseudo)) return false;
  }
  return areNamesUnique(players);
}

// --- Fonctions utilitaires privées ---

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
