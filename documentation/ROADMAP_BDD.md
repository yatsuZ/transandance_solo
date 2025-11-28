# 🗺️ ROADMAP - Module Base de Données (BDD)

## 📋 Vue d'ensemble

Implémentation complète d'une base de données SQLite pour :
- Gestion des utilisateurs (users)
- Sauvegarde des matchs (matches)
- Gestion des tournois (tournaments)
- Authentification avec tokens JWT
- Interface frontend (profil + login/signup)

---

## 🎯 Phase 1 : Installation et Configuration

### ✅ Étape 1.1 : Installation de SQLite
```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

**Pourquoi better-sqlite3 ?**
- Synchrone (plus simple)
- Plus rapide que sqlite3
- Pas de callbacks (code plus propre)
- Support TypeScript natif

### ✅ Étape 1.2 : Créer la structure de dossiers
```
backend/
├── db/
│   ├── schema.sql          # Schéma complet de la BDD
│   ├── database.ts         # Classe Database principale
│   ├── models/
│   │   ├── User.ts         # Modèle User avec méthodes CRUD
│   │   ├── Match.ts        # Modèle Match
│   │   └── Tournament.ts   # Modèle Tournament
│   └── migrations/         # Pour évolutions futures
└── data/
    └── pong.db            # Fichier SQLite (créé automatiquement)
```

---

## 🗄️ Phase 2 : Définition de la Structure BDD

### Tables principales

#### **users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(16) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  avatar_url VARCHAR(255) DEFAULT '/static/util/icon/profile.png',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0
);
```

#### **matches**
```sql
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_left_id INTEGER NOT NULL,
  player_right_id INTEGER NOT NULL,
  player_left_name VARCHAR(16) NOT NULL,
  player_right_name VARCHAR(16) NOT NULL,
  score_left INTEGER NOT NULL,
  score_right INTEGER NOT NULL,
  winner_id INTEGER NOT NULL,
  game_type VARCHAR(10) DEFAULT 'pong',
  is_ai_match BOOLEAN DEFAULT 0,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (player_left_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (player_right_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **tournaments**
```sql
CREATE TABLE tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL,
  winner_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### **tournament_participants**
```sql
CREATE TABLE tournament_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  placement INTEGER,

  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **tournament_matches**
```sql
CREATE TABLE tournament_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  round VARCHAR(20),

  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);
```

---

## 💾 Phase 3 : Implémentation Backend

### ✅ Étape 3.1 : Classe Database
**Fichier:** `backend/db/database.ts`

```typescript
import Database from 'better-sqlite3';

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    // Exécuter schema.sql
  }

  getConnection() {
    return this.db;
  }
}
```

### ✅ Étape 3.2 : Modèle User
**Méthodes à implémenter:**
- `createUser(username, passwordHash, email?)`
- `getUserById(id)`
- `getUserByUsername(username)`
- `getAllUsers()`
- `updateUser(id, data)`
- `deleteUser(id)`
- `incrementWins(id)`
- `incrementLosses(id)`

### ✅ Étape 3.3 : Modèle Match
**Méthodes à implémenter:**
- `createMatch(data)`
- `getMatchById(id)`
- `getMatchesByUser(userId)`
- `getAllMatches()`
- `getRecentMatches(limit)`

### ✅ Étape 3.4 : Modèle Tournament
**Méthodes à implémenter:**
- `createTournament(name, participants)`
- `getTournamentById(id)`
- `addMatchToTournament(tournamentId, matchId, round)`
- `setWinner(tournamentId, winnerId)`

---

## 🧪 Phase 4 : Tests Unitaires

### ✅ Étape 4.1 : Créer les tests
**Fichier:** `tests/db/database.test.ts`

**Tests à écrire:**
- ✅ Création d'utilisateur
- ✅ Récupération par ID/username
- ✅ Update utilisateur
- ✅ Delete utilisateur
- ✅ Création de match
- ✅ Récupération des matchs d'un joueur
- ✅ Création de tournoi
- ✅ Ajout de participants

### ✅ Étape 4.2 : Lancer les tests
```bash
npm test
```

---

## 🌐 Phase 5 : Routes API (Fastify)

### ✅ Étape 5.1 : Routes Users
**Fichier:** `backend/routes/users.ts`

```typescript
// POST /api/users - Créer un utilisateur
// GET /api/users/:id - Récupérer un utilisateur
// GET /api/users - Liste tous les utilisateurs
// PUT /api/users/:id - Modifier un utilisateur
// DELETE /api/users/:id - Supprimer un utilisateur
```

### ✅ Étape 5.2 : Routes Matches
**Fichier:** `backend/routes/matches.ts`

```typescript
// POST /api/matches - Créer un match
// GET /api/matches/:id - Récupérer un match
// GET /api/matches/user/:userId - Matches d'un joueur
// GET /api/matches - Tous les matchs
```

### ✅ Étape 5.3 : Routes Tournaments
**Fichier:** `backend/routes/tournaments.ts`

```typescript
// POST /api/tournaments - Créer un tournoi
// GET /api/tournaments/:id - Récupérer un tournoi
// POST /api/tournaments/:id/matches - Ajouter un match
```

### ✅ Étape 5.4 : Enregistrer les routes dans main.ts
```typescript
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';

fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(matchRoutes, { prefix: '/api/matches' });
```

---

## 🎨 Phase 6 : Frontend (Pages + Connexion)

### ✅ Étape 6.1 : Page Sign Up / Login
**Fichiers:**
- `views/pages/signup.ejs`
- `views/pages/login.ejs`
- `static/js/auth/auth-manager.ts`

**Fonctionnalités:**
- Formulaire d'inscription
- Formulaire de connexion
- Validation côté client
- Requêtes fetch vers API

### ✅ Étape 6.2 : Page Profil
**Fichiers:**
- `views/pages/profile.ejs`
- `static/js/profile/profile-manager.ts`

**Affichage:**
- Nom d'utilisateur
- Avatar
- Statistiques (wins/losses)
- Historique des matchs

### ✅ Étape 6.3 : Connexion Frontend ↔ Backend
```typescript
// Exemple : Sauvegarder un match après une partie
async function saveMatch(data) {
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

---

## 🔐 Phase 7 : Authentification JWT

### ✅ Étape 7.1 : Installation
```bash
npm install @fastify/jwt
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### ✅ Étape 7.2 : Configuration JWT
**Fichier:** `backend/main.ts`

```typescript
import jwt from '@fastify/jwt';

fastify.register(jwt, {
  secret: 'your-secret-key-change-this'
});
```

### ✅ Étape 7.3 : Routes Auth
**Fichier:** `backend/routes/auth.ts`

```typescript
// POST /api/auth/signup - Inscription
// POST /api/auth/login - Connexion (retourne token)
// GET /api/auth/me - Récupérer l'utilisateur connecté (avec token)
```

### ✅ Étape 7.4 : Middleware de protection
```typescript
// Protéger les routes qui nécessitent une authentification
fastify.addHook('onRequest', async (request, reply) => {
  await request.jwtVerify();
});
```

### ✅ Étape 7.5 : Stockage du token côté client
```typescript
// LocalStorage ou SessionStorage
localStorage.setItem('token', token);

// Envoyer le token dans les requêtes
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## ✅ Phase 8 : Tests d'intégration

### ✅ Étape 8.1 : Tester le flow complet
1. Créer un compte (signup)
2. Se connecter (login) → récupérer token
3. Jouer un match
4. Sauvegarder le match avec le token
5. Récupérer l'historique
6. Vérifier les stats (wins/losses)

### ✅ Étape 8.2 : Tests avec curl
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"test123"}'

# Get profile (avec token)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Métriques de succès

- ✅ Tous les tests unitaires passent (>80% coverage)
- ✅ Les API retournent les bonnes données
- ✅ Le frontend peut créer/récupérer des users
- ✅ Les matchs sont sauvegardés correctement
- ✅ Les tokens JWT fonctionnent
- ✅ Les stats sont mises à jour après chaque match

---

## 🚀 Commandes utiles

```bash
# Installation BDD
npm install better-sqlite3 @types/better-sqlite3

# Installation Auth
npm install @fastify/jwt bcrypt @types/bcrypt

# Lancer les tests
npm test

# Lancer avec watch mode (dev)
npm run dev:watch

# Nettoyer la BDD (reset)
rm backend/data/pong.db
npm run dev  # Recrée la BDD
```

---

## 📝 Notes importantes

1. **Sécurité :**
   - TOUJOURS hasher les mots de passe (bcrypt)
   - Valider les inputs côté serveur
   - Protéger contre SQL injection (prepared statements)

2. **Performance :**
   - Créer des index sur les colonnes recherchées souvent
   - Utiliser des transactions pour insertions multiples

3. **Tests :**
   - Utiliser une BDD de test séparée (`:memory:`)
   - Nettoyer la BDD entre chaque test

---

**Dernière mise à jour :** 2025-01-26
**Statut :** En cours - Phase 1
