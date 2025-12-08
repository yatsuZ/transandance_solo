// === GESTION DE LA MUSIQUE ===

import { DOMElements } from "../core/dom-elements.js";
import { AuthManager } from "../auth/auth-manager.js";

/**
 * Charge les préférences musicales depuis la BDD
 */
async function loadMusicPreferences(): Promise<{ volume: number; enabled: number } | null> {
  try {
    console.log('[Music] 📡 Chargement des préférences depuis l\'API...');
    const response = await fetch('/api/users/preferences/music', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn(`[Music] ⚠️ Impossible de charger les préférences: ${response.status}`);
      if (response.status === 401) {
        console.log('[Music] 🔒 Non authentifié - utilisation des valeurs par défaut');
      }
      return null;
    }

    const prefs = await response.json();
    console.log('[Music] ✅ Préférences chargées:', prefs);
    return prefs;
  } catch (error) {
    console.error('[Music] ❌ Erreur chargement préférences:', error);
    return null;
  }
}

/**
 * Sauvegarde les préférences musicales dans la BDD
 */
async function saveMusicPreferences(volume?: number, enabled?: number): Promise<void> {
  try {
    const body: any = {};
    if (volume !== undefined) body.volume = volume;
    if (enabled !== undefined) body.enabled = enabled;

    await fetch('/api/users/preferences/music', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('[Music] Erreur sauvegarde préférences:', error);
  }
}

export async function initMusicSystem(all_DO: DOMElements) {
  const music = all_DO.media.music.main_theme;
  const popup = all_DO.popup.startOrNotMusic;
  const startBtn = all_DO.buttons.startMusic;
  const dontStartBtn = all_DO.buttons.dontStartMusic;
  const iconSound = all_DO.icons.sound;
  const iconSoundImg = all_DO.media.image.sound;

  console.log('[Music] 🎵 Initialisation du système musical...');

  // CORRECTION GLITCH : Cacher la popup dès le début
  popup.style.display = 'none';

  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = await AuthManager.verifyAuth();
  console.log(`[Music] ${isLoggedIn ? '✅ Utilisateur connecté' : '❌ Utilisateur non connecté'}`);

  // Toujours essayer de charger les préférences (le cookie peut être valide)
  const prefs = await loadMusicPreferences();

  if (prefs) {
    console.log(`[Music] 📋 Préférences trouvées: volume=${prefs.volume}%, enabled=${prefs.enabled}`);
    music.volume = prefs.volume / 100;

    // enabled: 0=popup, 1=oui, 2=non
    if (prefs.enabled === 1) {
      // Musique autorisée : essayer de démarrer automatiquement
      console.log('[Music] ▶️ Tentative de démarrage automatique...');

      try {
        await music.play();
        console.log('[Music] ✅ Musique démarrée avec succès');
        updateMusicUI(iconSoundImg, 'on');
      } catch (err) {
        // NAVIGATEUR BLOQUE L'AUTOPLAY : afficher la popup quand même
        console.log('[Music] ⚠️ Autoplay bloqué par le navigateur - affichage du popup');
        popup.style.display = 'flex';
        updateMusicUI(iconSoundImg, 'off');
      }
    } else if (prefs.enabled === 2) {
      // Musique refusée : ne pas afficher popup
      console.log('[Music] 🔇 Musique désactivée (préférence utilisateur)');
      updateMusicUI(iconSoundImg, 'off');
    } else {
      // Première visite (0) : afficher popup
      console.log('[Music] ❓ Première visite - affichage du popup');
      popup.style.display = 'flex';
    }
  } else {
    // Pas de préférences : afficher popup
    console.log('[Music] 📋 Aucune préférence - affichage du popup');
    popup.style.display = 'flex';
  }

  // Événements boutons popup
  startBtn.addEventListener('click', () => handleStartMusic(music, iconSoundImg, popup, isLoggedIn));
  dontStartBtn.addEventListener('click', () => handleDontStartMusic(iconSoundImg, popup, isLoggedIn));

  // Événement toggle son
  iconSound.addEventListener('click', () => toggleMusic(music, iconSoundImg, isLoggedIn));
}

// === UTILITAIRE ===

async function handleStartMusic(music: HTMLAudioElement, iconSoundImg: HTMLImageElement, popup: HTMLElement, isLoggedIn: boolean) {
  music.play()
    .then(async () => {
      updateMusicUI(iconSoundImg, 'on');
      popup.style.display = 'none';
      // Sauvegarder la préférence : musique autorisée (1)
      if (isLoggedIn) {
        await saveMusicPreferences(undefined, 1);
        console.log('[Music] ✅ Préférence musique sauvegardée : autorisée');
      }
    })
    .catch(err => console.error("Erreur lecture musique :", err));
}

async function handleDontStartMusic(iconSoundImg: HTMLImageElement, popup: HTMLElement, isLoggedIn: boolean) {
  updateMusicUI(iconSoundImg, 'off');
  popup.style.display = 'none';
  // Sauvegarder la préférence : musique refusée (2)
  if (isLoggedIn) {
    await saveMusicPreferences(undefined, 2);
    console.log('[Music] ✅ Préférence musique sauvegardée : refusée');
  }
}

async function toggleMusic(music: HTMLAudioElement, iconSoundImg: HTMLImageElement, isLoggedIn: boolean) {
  if (music.paused) {
    music.play()
      .then(async () => {
        updateMusicUI(iconSoundImg, 'on');
        // Sauvegarder enabled=1 uniquement si connecté
        if (isLoggedIn) {
          await saveMusicPreferences(undefined, 1);
          console.log('[Music] ✅ Préférence musique sauvegardée : autorisée');
        }
      })
      .catch(err => console.error("Erreur lecture musique :", err));
  } else {
    music.pause();
    updateMusicUI(iconSoundImg, 'off');
    // Sauvegarder enabled=2 uniquement si connecté
    if (isLoggedIn) {
      await saveMusicPreferences(undefined, 2);
      console.log('[Music] ✅ Préférence musique sauvegardée : refusée');
    }
  }
}

// === UTILITAIRE COMMUN ===
function updateMusicUI(icon: HTMLImageElement, state: 'on' | 'off') {
  icon.src = `/static/util/icon/son_${state}.png`;
}

// === GESTION DU VOLUME ===
export async function initVolumeControl(all_DO: DOMElements) {
  const music = all_DO.media.music.main_theme;
  const volumeSlider = all_DO.parametreElement.volumeSlider;
  const volumeValue = all_DO.parametreElement.volumeValue;

  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = await AuthManager.verifyAuth();

  let volumePercent = 50; // Valeur par défaut

  if (isLoggedIn) {
    // Charger le volume depuis la BDD
    const prefs = await loadMusicPreferences();
    if (prefs) {
      volumePercent = prefs.volume;
    }
  }

  // Appliquer le volume initial
  music.volume = volumePercent / 100;
  volumeSlider.value = volumePercent.toString();
  volumeValue.textContent = `${volumePercent}%`;

  // Événement sur le slider avec debounce pour éviter trop de requêtes
  let volumeSaveTimeout: number | null = null;
  volumeSlider.addEventListener('input', () => {
    const value = parseInt(volumeSlider.value, 10);
    music.volume = value / 100;
    volumeValue.textContent = `${value}%`;

    // Sauvegarder dans la BDD si connecté (avec debounce de 500ms)
    if (isLoggedIn) {
      if (volumeSaveTimeout !== null) {
        clearTimeout(volumeSaveTimeout);
      }
      volumeSaveTimeout = window.setTimeout(async () => {
        await saveMusicPreferences(value, undefined);
        console.log(`[Music] ✅ Volume sauvegardé : ${value}%`);
      }, 500);
    }
  });
}

