# 📊 COMPTE-RENDU - Module Base de Données

**Date :** 2025-01-26
**Branche :** bdd
**Statut :** ✅ Structure complète - Tests en cours

---

## 🎯 Objectif

Implémenter un module de base de données SQLite pour gérer :
- Les utilisateurs (users)
- Les matchs (matches) - PvP et PvIA uniquement
- Les tournois (tournaments) avec participants et matches

---

## ✅ Réalisations

### 1. Installation et Configuration

**Package installé :**
```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

**Pourquoi better-sqlite3 ?**
- Synchrone (pas de callbacks/async)
- Plus rapide que sqlite3
- Support TypeScript natif
- Simple à utiliser

---

### 2. Schéma de Base de Données

**Fichier :** `backend/core/db/script/schema.sql`

**5 tables créées :**

#### **users** (Utilisateurs enregistrés)
- `id`, `username`, `email`, `password_hash`
- `avatar_url`
- **Stats :** `wins`, `losses`, `total_goals_scored`, `total_goals_conceded`, `total_matches`
- **Meta :** `created_at`, `updated_at`

**Note :** Les IA et guests ne sont PAS dans cette table

---

#### **matches** (Historique des matchs)
- **Joueurs :** `player_left_id`, `player_left_name`, `player_right_id`, `player_right_name`
- **Scores :** `score_left`, `score_right`
- **Résultat :** `winner_id`, `winner_name`
- **État :** `status` ('in_progress', 'completed', 'leave')
- **Meta :** `game_type`, `start_at`, `end_at`

**Cas d'usage :**
- `player_id = NULL` + nom → Guest ou IA
- `status = 'in_progress'` → Match en cours
- `status = 'completed'` → Victoire normale
- `status = 'leave'` → Quelqu'un a quitté (pas de vainqueur)

**On stocke uniquement :** PvP et PvIA (PAS IAvIA)

---

#### **tournaments** (Tournois)
- **Gestion :** `manager_id` (créateur du tournoi)
- **Résultat :** `winner_participant_id`
- **Progression :** `nbr_of_matches`, `matches_remaining`
- **État :** `status` ('in_progress', 'completed', 'leave')
- **Meta :** `created_at`, `end_at`

**Logique :**
- `matches_remaining` décrémente de 3 → 0
- Quand `matches_remaining = 0` → tournoi terminé

---

#### **tournament_participants** (Participants)
- **Identité :** `user_id` (NULL si guest/bot), `display_name`, `is_bot`
- **Progression :** `placement` (1er, 2e, 3e, 4e), `is_eliminated`

**Types de participants :**
- `user_id != NULL` → User (avec pseudo custom possible)
- `user_id = NULL` + `is_bot = 0` → Guest
- `user_id = NULL` + `is_bot = 1` → Bot

---

#### **tournament_matches** (Matches d'un tournoi)
- `tournament_id`, `match_id`
- `match_index` (3, 2, 1) → permet de scaler facilement
- `round` ('semi-final-1', 'semi-final-2', 'final')

**Exemple pour 4 joueurs (3 matches) :**
- Index 3 → Semi-final 1
- Index 2 → Semi-final 2
- Index 1 → Final

---

### 3. Architecture Backend

**Pattern Repository :** Classes séparées par entité

```
backend/core/db/
├── config.ts                  # DatabaseManager
├── models/
│   ├── User.ts               # UserRepository
│   ├── Match.ts              # MatchRepository
│   └── Tournament.ts         # TournamentRepository
├── script/
│   └── schema.sql
└── (généré automatiquement)
    └── ../../data/pong.db
```

---

### 4. Méthodes CRUD Implémentées

#### **UserRepository** (15 méthodes)

**CRUD de base :**
- `createUser(data)` → Créer un utilisateur
- `getUserById(id)` → Récupérer par ID
- `getUserByUsername(username)` → Récupérer par username
- `getUserByEmail(email)` → Récupérer par email
- `getAllUsers()` → Liste complète
- `updateUser(id, data)` → Modifier un user
- `deleteUser(id)` → Supprimer un user

**Stats :**
- `incrementWins(id)` → +1 victoire
- `incrementLosses(id)` → +1 défaite
- `updateStats(id, stats)` → Mise à jour complète après match

**Autres :**
- `getLeaderboard(limit)` → Classement des meilleurs joueurs

---

#### **MatchRepository** (13 méthodes)

**CRUD de base :**
- `createMatch(data)` → Créer un match (status='in_progress')
- `getMatchById(id)` → Récupérer par ID
- `getMatchesByUser(userId)` → Historique d'un joueur
- `getAllMatches(limit?)` → Tous les matches
- `deleteMatch(id)` → Supprimer un match

**Filtres :**
- `getInProgressMatches()` → Matches en cours
- `getCompletedMatches(limit?)` → Matches terminés

**Gestion du match :**
- `updateMatchScore(id, data)` → Mettre à jour les scores pendant le match
- `endMatch(id, winnerId, winnerName, status)` → Terminer avec vainqueur
- `markMatchAsLeave(id)` → Marquer comme abandonné

**Stats :**
- `getMatchStatsForPlayer(matchId, playerId)` → Stats d'un joueur pour un match

---

#### **TournamentRepository** (20 méthodes)

**CRUD Tournaments (9 méthodes) :**
- `createTournament(data)` → Créer un tournoi
- `getTournamentById(id)` → Récupérer par ID
- `getAllTournaments(limit?)` → Tous les tournois
- `getTournamentsByManager(managerId)` → Tournois créés par un user
- `getInProgressTournaments()` → Tournois en cours
- `decrementMatchesRemaining(id)` → -1 match restant
- `endTournament(id, winnerId, status)` → Terminer le tournoi
- `markTournamentAsLeave(id)` → Marquer comme abandonné
- `deleteTournament(id)` → Supprimer (CASCADE)

**CRUD Participants (6 méthodes) :**
- `addParticipant(data)` → Ajouter un participant
- `getParticipantById(id)` → Récupérer par ID
- `getParticipants(tournamentId)` → Tous les participants
- `getActiveParticipants(tournamentId)` → Participants encore en lice
- `eliminateParticipant(id)` → Marquer comme éliminé
- `setPlacement(id, placement)` → Définir le classement final

**CRUD Tournament Matches (5 méthodes) :**
- `addMatchToTournament(data)` → Lier un match au tournoi
- `getTournamentMatchById(id)` → Récupérer par ID
- `getMatches(tournamentId)` → Tous les matches du tournoi
- `getNextMatch(tournamentId)` → Prochain match à jouer

---

### 5. Exports et Utilisation

**Export simple (pas de plugin Fastify) :**

```typescript
// Import dans les routes
import { userRepo } from '../core/db/models/User.js';
import { matchRepo } from '../core/db/models/Match.js';
import { tournamentRepo } from '../core/db/models/Tournament.js';

// Utilisation
const user = userRepo.getUserById(1);
const match = matchRepo.createMatch(data);
```

**Avantages :**
- Simple et direct
- Utilisable partout (routes, tests, scripts)
- Pas couplé à Fastify

---

## 📊 Statistiques

- **5 tables SQL** créées
- **3 repositories TypeScript** implémentés
- **48 méthodes CRUD** au total
- **Type-safe** avec interfaces TypeScript
- **Synchrone** (better-sqlite3)

---

## 🔄 Clés Étrangères et Relations

**ON DELETE CASCADE :**
- `tournaments.manager_id` → Si manager supprimé, tournoi supprimé
- `tournament_participants.tournament_id` → Si tournoi supprimé, participants supprimés
- `tournament_matches.tournament_id` → Si tournoi supprimé, matches supprimés

**ON DELETE SET NULL :**
- `matches.player_left_id` / `player_right_id` / `winner_id` → Si user supprimé, ID devient NULL (nom gardé)
- `tournaments.winner_participant_id` → Si participant supprimé, winner_id devient NULL

**Pourquoi ?**
- CASCADE : Nettoie automatiquement les données liées
- SET NULL : Garde l'historique même si l'entité est supprimée

---

## 🚀 Prochaines Étapes

1. ✅ **Tests unitaires** pour les 3 repositories
2. ⏳ **Routes API Fastify** (POST/GET users, matches, tournaments)
3. ⏳ **Intégration frontend** (sauvegarder les matches après une partie)
4. ⏳ **JWT & Auth** (tokens, login, signup)
5. ⏳ **Pages frontend** (profil, login, signup)

---

## 📝 Notes Techniques

**Synchrone vs Asynchrone :**
- ✅ **better-sqlite3** = Synchrone (pas de `async/await`)
- ❌ **sqlite3** = Asynchrone (callbacks)

**Pourquoi synchrone ?**
- Code plus simple
- Pas de callback hell
- Plus rapide
- Parfait pour un projet local

**Fichier BDD :**
- Chemin : `backend/data/pong.db`
- Créé automatiquement au premier démarrage
- Peut être supprimé avec `npm run clean:data`

---

**Dernière mise à jour :** 2025-01-26
**Statut :** Structure complète, tests en cours
