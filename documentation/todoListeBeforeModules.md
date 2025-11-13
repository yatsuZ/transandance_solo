# 📋 TODO AVANT LES MODULES

Liste des tâches à accomplir avant de commencer la partie modules du projet Transcendence.

---

## 🔴 PARTIE OBLIGATOIRE MANQUANTE (CRITIQUE)

### 1. Routing & Navigation
- [ ] Implémenter l'History API pour le routing SPA
  - [X] Utiliser `history.pushState()` lors des changements de page
  - [ ] Gérer l'événement `popstate` pour back/forward du navigateur
  - [ ] Tester que précédent/suivant fonctionnent correctement
  - [ ] Mettre à jour l'URL sans recharger la page

### 2. HTTPS
- [ ] Générer un certificat SSL (self-signed pour dev)
- [ ] Configurer Fastify pour utiliser HTTPS
- [ ] Mettre à jour Docker pour exposer le port HTTPS
- [ ] Tester avec `https://` au lieu de `http://`
- [ ] Adapter le QR code pour HTTPS

### 3. Module Backend
- [ ] Choisir et documenter le module "Backend Framework" (pour justifier l'utilisation de Node.js/Fastify au lieu de PHP)

---

## 🧹 NETTOYAGE & OPTIMISATION CODE

### 4. Event Listeners Cleanup
- [ ] Identifier tous les `addEventListener` dans le projet
- [ ] Créer des fonctions nommées pour chaque event handler
- [ ] Implémenter `removeEventListener` dans les méthodes de cleanup
  - [ ] `Tournament.ts` : cleanup des listeners du tournoi
  - [ ] `main_app.ts` : cleanup des listeners de navigation
  - [ ] `input.ts` : cleanup des listeners clavier
  - [ ] `Game.ts` : cleanup des listeners du jeu
- [ ] Tester qu'il n'y a plus de memory leaks (créer/détruire plusieurs tournois)

### 5. Nettoyage général du code
- [ ] Uniformiser le nommage (tout en anglais OU tout en français)
- [ ] Supprimer les `console.log` de debug inutiles
- [ ] Supprimer le code commenté non utilisé
- [ ] Vérifier la cohérence camelCase vs snake_case
- [ ] Améliorer les commentaires (français ou anglais, mais cohérent)
- [ ] Retirer les alertes (`alert()`) et utiliser des modals/overlays

### 6. Optimisation des ressources
**Objectif :** Faire tourner l'app plus rapidement et plus smoothly

- [ ] **Memory leaks**
  - [ ] Créer 5-10 tournois d'affilée
  - [ ] Ouvrir DevTools → Memory → voir si la RAM augmente à chaque tournoi
  - [ ] Si oui : trouver les event listeners ou objets non détruits

---

## 🎨 AMÉLIORATIONS UI/UX

### 7. Migration vers Tailwind CSS
- [ ] Installer Tailwind CSS dans le projet
  - [ ] `npm install -D tailwindcss postcss autoprefixer`
  - [ ] Générer le config : `npx tailwindcss init`
  - [ ] Configurer `tailwind.config.js` pour scanner les fichiers `.ejs` et `.ts`

- [ ] Setup du build Tailwind
  - [ ] Créer un fichier `input.css` avec les directives Tailwind
  - [ ] Ajouter script de build CSS dans `package.json`
  - [ ] Tester que les classes Tailwind fonctionnent

- [ ] Migration progressive
  - [ ] Commencer par les composants simples (boutons, cards)
  - [ ] Migrer la navigation
  - [ ] Migrer les pages (home, match, tournament, etc.)
  - [ ] Supprimer progressivement `style.css` au fur et à mesure

- [ ] Cleanup final
  - [ ] Supprimer complètement `style.css` une fois tout migré
  - [ ] Vérifier que tout le style passe par Tailwind
  - [ ] Optimiser avec PurgeCSS (normalement inclus dans Tailwind)

### 8. Page de configuration de jeu
- [ ] Créer une nouvelle page `game-config.ejs`
- [ ] Implémenter le choix du mode
  - [ ] Bouton "Match Simple"

- [ ] Configuration Match Simple
  - [ ] Choisir le nombre de points pour gagner (3, 5, 7, 10)
  - [ ] Joueur Gauche : Humain ou IA si IA choisir le type d'ia plus choisir le nom
  - [ ] Joueur Droite : Humain ou IA si IA choisir le type d'ia plus choisir le nom
  - [ ] Bouton "Lancer le match"

- [ ] Configuration Tournoi
  - [ ] 4 joueurs avec input nom
  - [ ] Pour chaque joueur : toggle Humain/IA
  - [ ] (Optionnel) Difficulté IA : Facile / Moyen / Difficile
  - [ ] Bouton "Lancer le tournoi"

- [ ] Intégrer dans le flow
  - [ ] Depuis home, aller vers config au lieu d'aller direct au jeu
  - [ ] Passer les paramètres choisis au jeu

### 9. Page Settings
- [ ] Implémenter la page settings (actuellement vide)

- [ ] Section Contrôles
  - [ ] Joueur Gauche : remapper W/S vers autres touches
  - [ ] Joueur Droite : remapper Arrow Up/Down vers autres touches
  - [ ] Bouton "Réinitialiser aux touches par défaut"
  - [ ] Sauvegarder dans localStorage

- [ ] Section Audio
  - [ ] Slider volume musique (0-100%)
  - [ ] Toggle sons activés/désactivés
  - [ ] Tester le son directement depuis settings

- [ ] Section Affichage
  - [ ] (Optionnel) Changer les couleurs du terrain
  - [ ] (Optionnel) Thème clair/sombre

- [ ] Section Langue (optionnel)
  - [ ] Toggle FR/EN si tu veux internationaliser

### 10. Améliorer le game design
**Problème identifié :** Terrain trop carré = pas assez de temps pour se replacer

- [ ] **Redimensionner le terrain**
  - [ ] Changer le ratio 4:3 vers un ratio plus large (16:9 ou 16:10)
  - [ ] Modifier `Field.ts` pour utiliser le nouveau ratio
  - [ ] Tester que le jeu est plus équilibré (plus de temps de réaction)
  - [ ] Vérifier que ça reste responsive

- [ ] **Ajuster la vitesse de balle**
  - [ ] Si le terrain est plus large, peut-être augmenter légèrement la vitesse
  - [ ] Tester plusieurs vitesses pour trouver le sweet spot
  - [ ] S'assurer que l'IA peut toujours suivre

- [ ] **Ajouter des effets sonores**
  - [ ] Son collision balle/paddle
  - [ ] Son but marqué
  - [ ] Son victoire
  - [ ] Intégrer avec le toggle sound de settings

- [ ] **Améliorer les animations**
  - [ ] Animation countdown avant début de match (3... 2... 1... GO!)
  - [ ] Animation lors d'un but (ralenti, texte "GOAL!", pause 1-2 sec)
  - [ ] Animation de victoire (confettis, texte animé)
  - [ ] Transition smooth entre les matchs de tournoi

- [ ] **Améliorer le feedback visuel**
  - [ ] Effet flash/shake lors collision balle/paddle
  - [ ] Trail/traînée pour la balle (ligne qui suit la balle)
  - [ ] (Optionnel) Particules lors des collisions
  - [ ] Meilleur affichage du score (plus gros, animations +1)

---

## ✅ TESTS & VALIDATION

### 11. Tests multi-navigateurs
- [ ] Tester sur Firefox (dernière version)
- [ ] Tester sur Chrome
- [ ] Tester sur Safari (si possible)
- [ ] Vérifier la compatibilité mobile (responsive)

### 12. Tests fonctionnels
- [ ] Vérifier qu'il n'y a plus de bugs lors de tournois multiples
- [ ] Tester toutes les combinaisons de jeu (PvP, PvIA, IAvP, IAvIA)
- [ ] Vérifier que les scores sont corrects
- [ ] Tester le resize de fenêtre pendant un match
- [ ] Vérifier que la musique toggle fonctionne
- [ ] Vérifier que les contrôles custom (settings) fonctionnent

### 13. Validation des règles
- [ ] Vérifier que tous les joueurs/IA ont le même paddle (taille identique)
- [ ] Vérifier que tous les joueurs/IA ont la même vitesse de déplacement
- [ ] Vérifier que les règles sont identiques pour tous (même vitesse de balle, même conditions de victoire)

---

## 🎯 PRÉPARATION MODULES

### 14. Choix des modules
- [ ] Lire la liste des modules disponibles dans le sujet
- [ ] Choisir les 7 modules (majeurs + mineurs) pour atteindre le score requis
- [ ] Documenter les choix dans `TO_DO.md`
- [ ] Créer les tickets pour chaque module choisi

### 15. Architecture pour les modules
- [ ] Réfléchir à l'architecture pour l'authentification (si module User Management)
- [ ] Prévoir la structure base de données (si module Database)
- [ ] Planifier l'intégration WebSocket (si module Remote Players)
- [ ] Anticiper les changements nécessaires dans le code existant

---

## 🚀 ORDRE RECOMMANDÉ

### Phase 1 : Finir la partie obligatoire (PRIORITÉ HAUTE)
1. History API (routing)
2. HTTPS
3. Event listeners cleanup
4. Module Backend (documentation)

### Phase 2 : Stabilisation & qualité
5. Nettoyage général du code
6. Tests multi-navigateurs
7. Validation des règles

### Phase 3 : Migration Tailwind
8. Installation et setup Tailwind
9. Migration progressive des styles
10. Cleanup du CSS vanilla

### Phase 4 : Expérience utilisateur
11. Améliorer le terrain de jeu (ratio + équilibrage)
12. Page configuration de jeu
13. Page settings
14. Effets sonores et visuels

### Phase 5 : Optimisation & polish
15. Optimisation des ressources
16. Animations et feedback visuel
17. Tests finaux

### Phase 6 : Préparation modules
18. Choix des modules
19. Architecture pour les modules

---

**Date de création :** 2025-11-12
**Objectif :** Finir la partie obligatoire et polish avant les modules 🎯
