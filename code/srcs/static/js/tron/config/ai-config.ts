/**
 * Configuration de l'IA Tron
 */

export type AIDifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

interface AIDifficultyConfig {
  label: string;
  botName: string;
  lookAhead: number;
  randomness: number;
  updateInterval: number;
  aggressiveness: number;
}

// Configuration des difficultés IA
export const AI_DIFFICULTY: Record<AIDifficultyLevel, AIDifficultyConfig> = {
  EASY: {
    label: 'Débutant',
    botName: 'Rookie',
    lookAhead: 3,        // Regarde 3 cases devant
    randomness: 0.3,     // 30% de décisions aléatoires
    updateInterval: 200, // Met à jour la décision toutes les 200ms
    aggressiveness: 0.2  // 20% agressif, 80% défensif
  },
  MEDIUM: {
    label: 'Intermédiaire',
    botName: 'Challenger',
    lookAhead: 5,
    randomness: 0.15,
    updateInterval: 150,
    aggressiveness: 0.4  // 40% agressif
  },
  HARD: {
    label: 'Difficile',
    botName: 'Champion',
    lookAhead: 8,
    randomness: 0.05,
    updateInterval: 100,
    aggressiveness: 0.6  // 60% agressif
  },
  EXPERT: {
    label: 'Expert',
    botName: 'Legend',
    lookAhead: 12,
    randomness: 0.02,
    updateInterval: 80,
    aggressiveness: 0.8  // 80% agressif, très agressif
  }
};
