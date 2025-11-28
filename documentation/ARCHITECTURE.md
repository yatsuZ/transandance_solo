# 🏗️ Architecture du Projet - Pong Game

**Dernière mise à jour : 28 Novembre 2025**

---

## 📁 Structure des Dossiers

```
code/
├── srcs/
│   ├── backend/               # Backend Fastify
│   │   ├── core/
│   │   │   ├── auth/         # Auth (JWT, middleware, service)
│   │   │   ├── database/     # Connexion BDD
│   │   │   └── errors/       # Gestion erreurs
│   │   ├── routes/           # Routes API
│   │   │   ├── auth.ts       # Routes auth (/api/auth/login, /signup)
│   │   │   ├── users.ts      # Routes users
│   │   │   └── index.ts      # Enregistrement routes
│   │   ├── models/           # Modèles de données
│   │   ├── services/         # Services métier
│   │   └── main.ts           # Point d'entrée backend
│   │
│   └── static/               # Frontend SPA
│       ├── css/
│       │   ├── pages/        # CSS par page
│       │   │   ├── auth.css
│       │   │   ├── accueil.css
│       │   │   └── ...
│       │   └── style.css     # CSS global
│       │
│       ├── js/
│       │   ├── auth/         # Gestion authentification
│       │   │   ├── auth-manager.ts      # Gestion JWT localStorage
│       │   │   └── auth-events.ts       # Events formulaires
│       │   │
│       │   ├── core/         # Core de l'app
│       │   │   ├── dom-elements.d.ts    # Types éléments DOM
│       │   │   └── dom-manager.ts       # Récupération éléments DOM
│       │   │
│       │   ├── events/       # Gestion événements
│       │   │   └── navigation-events.ts # Navigation SPA
│       │   │
│       │   ├── navigation/   # Navigation
│       │   │   ├── route-config.ts      # Config routes
│       │   │   └── page-manager.ts      # Gestion pages
│       │   │
│       │   ├── game-management/  # Logique jeu
│       │   │   ├── match-controller.ts
│       │   │   ├── tournament-controller.ts
│       │   │   └── game-engine.ts
│       │   │
│       │   ├── ui/           # Interface utilisateur
│       │   │   ├── music-manager.ts
│       │   │   └── description-manager.ts
│       │   │
│       │   ├── utils/        # Utilitaires
│       │   │   ├── url-helpers.ts
│       │   │   ├── validators.ts
│       │   │   └── input-colorizer.ts
│       │   │
│       │   ├── SiteManagement.ts  # Orchestrateur principal
│       │   └── main.ts            # Point d'entrée frontend
│       │
│       ├── views/            # Templates EJS
│       │   ├── pages/        # Pages du site
│       │   │   ├── login.ejs
│       │   │   ├── signup.ejs
│       │   │   ├── accueil.ejs
│       │   │   ├── match.ejs
│       │   │   └── ...
│       │   ├── partials/     # Composants réutilisables
│       │   │   ├── header.ejs
│       │   │   ├── footer.ejs
│       │   │   └── icon_bar.ejs
│       │   └── main.ejs      # Template principal
│       │
│       └── util/             # Assets statiques
│           ├── icon/
│           ├── img/
│           └── music/
│
├── tests/                    # Tests
│   ├── api/                  # Tests API
│   └── helpers/              # Helpers de test
│
├── documentation/            # Documentation (MD files)
│   ├── TODO_DEMAIN.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP_BDD.md
│   └── CHANGELOG_BDD.md
│
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🔄 Flux de l'Application

### 1️⃣ Démarrage de l'Application

```
1. Utilisateur accède à http://localhost:3000/
2. Backend Fastify sert main.ejs
3. Frontend charge main.ts
4. main.ts crée DOMElements
5. main.ts instancie SiteManagement
6. SiteManagement initialise :
   - MusicSystem
   - VolumeControl
   - MatchController
   - TournamentController
   - NavigationEvents ← Gère toute la navigation
   - AuthEvents ← Gère formulaires login/signup
```

### 2️⃣ Navigation SPA (Single Page Application)

**Gérée par `NavigationEvents`**

```
NavigationEvents
├── initSPA()                    ← Au chargement (F5)
│   ├── 1. Route racine (/)     → Login ou Accueil selon JWT
│   ├── 2. Route 404            → Page erreur si invalide
│   ├── 3. Auth (JWT)           → 403 si pas de JWT sur page protégée
│   ├── 4. Contexte             → 403 si pas de match/tournoi actif
│   └── 5. Navigation normale   → Affiche la page demandée
│
├── handleButtonClick()          ← Clics sur boutons [data-link]
│   └── (À refactoriser - même logique que initSPA)
│
└── handlePopStateNavigation()   ← Back/Forward navigateur
    └── (À refactoriser - même logique que initSPA)
```

### 3️⃣ Authentification

**Backend :**
```
POST /api/auth/signup
├── Validation (username, password, email?)
├── Hash password (bcrypt)
├── Save to database
└── Return JWT + user data

POST /api/auth/login
├── Validation (username, password)
├── Verify credentials
├── Generate JWT
└── Return JWT + user data
```

**Frontend :**
```
AuthManager (auth-manager.ts)
├── login(username, password)      → Appelle API, stocke JWT
├── signup(username, password, email?) → Appelle API, stocke JWT
├── logout()                       → Clear localStorage
├── isLoggedIn()                   → Vérifie JWT valide
├── getToken()                     → Récupère JWT
└── getAuthHeader()                → Header Authorization

AuthEvents (auth-events.ts)
├── handleLogin(e)                 → Submit formulaire login
└── handleSignup(e)                → Submit formulaire signup
```

### 4️⃣ Gestion des Routes

**Configuration (`route-config.ts`) :**
```typescript
// Routes nécessitant un contexte actif (match/tournoi)
CONTEXT_RESTRICTED_ROUTES = [
  '/match',
  '/match/result',
  '/tournament/match',
  '/tournament/result',
  '/tournament/tree_tournament'
]

// Routes protégées (nécessitent JWT)
AUTH_PROTECTED_ROUTES = [
  '/accueil',
  '/game_config',
  '/begin_tournament',
  '/parametre'
]

// Routes publiques
PUBLIC_ROUTES = [
  '/login',
  '/signup'
]
```

**Vérifications :**
```typescript
isContextRestrictedRoute(path)  // true si besoin match/tournoi actif
isAuthProtectedRoute(path)      // true si besoin JWT
isPublicRoute(path)             // true si public (login/signup)
```

---

## 🎮 Game Logic

### Match Controller
```
MatchController
├── startMatch(player1, player2)
├── hasActiveMatch()
├── stopMatch(reason)
└── initMatchOnStartup()
```

### Tournament Controller
```
TournamentController
├── startTournament(players[])
├── hasActiveTournament()
├── stopTournament(reason)
├── nextMatch()
└── handleMatchResult(winner)
```

### Game Engine
```
GameEngine
├── init(canvas, players)
├── update()          ← Boucle de jeu
├── render()          ← Affichage
├── handleInput()     ← Gestion clavier
└── detectCollision() ← Physique
```

---

## 🔒 Sécurité

### JWT (JSON Web Token)
```
Structure du token :
{
  userId: number,
  username: string,
  iat: number,        // Issued at
  exp: number         // Expiration
}

Stockage : localStorage
Clé : 'pong_jwt_token'
```

### Middleware d'authentification
```typescript
// Backend - Protège les routes
authMiddleware(request, reply, done) {
  1. Récupère token depuis header Authorization
  2. Vérifie signature JWT
  3. Décode payload
  4. Attache userId à request.user
  5. Continue ou renvoie 401
}
```

### Frontend - Protection routes
```typescript
// navigation-events.ts - initSPA()
if (isAuthProtectedRoute(path) && !isLoggedIn()) {
  showErrorPage(403)  // Accès interdit
}
```

---

## 🎨 Système de Design

### Thème Arcade Rétro
- **Police principale** : "Press Start 2P" (pixel art)
- **Couleurs** :
  - Vert néon : `#00ff4c` (principal)
  - Jaune : `#ffcc00` (accents)
  - Orange : `#ff9933` (secondaire)
  - Noir : `#000` (fond)

### Composants Réutilisables
```
icon_bar.ejs        → Barre de navigation (accueil, son, paramètres)
header.ejs          → Header global
footer.ejs          → Footer global
```

---

## 📡 API Routes (Actuel)

### Auth
```
POST   /api/auth/signup      → Créer compte
POST   /api/auth/login       → Se connecter
```

### Users
```
GET    /api/users            → Liste utilisateurs
GET    /api/users/:id        → Détails utilisateur
PUT    /api/users/:id        → Modifier utilisateur (protégé)
DELETE /api/users/:id        → Supprimer utilisateur (protégé)
```

### À venir
```
POST   /api/matches          → Enregistrer match
GET    /api/users/:id/matches → Historique matches
POST   /api/tournaments      → Enregistrer tournoi
GET    /api/users/:id/tournaments → Historique tournois
```

---

## 🧪 Tests

### Structure
```
tests/
├── api/
│   ├── auth.test.ts       → Tests routes auth
│   └── users.test.ts      → Tests routes users
└── helpers/
    └── auth.ts            → Helpers pour tests auth
```

### Commandes
```bash
npm test                    # Tous les tests
npm test auth              # Tests auth uniquement
npm test users             # Tests users uniquement
```

---

## 🚀 Déploiement

### Docker
```bash
# Build
docker-compose build

# Run
docker-compose up

# Accès
http://localhost:3000
```

### Variables d'environnement
```
.env
├── FASTIFY_PORT=3000
├── JWT_SECRET=your_secret_key
├── DATABASE_URL=postgresql://...
└── HOST_IP=192.168.1.13
```

---

## 📊 État Actuel du Projet

### ✅ Fonctionnel
- Backend Fastify avec routes API
- Base de données (users)
- Authentification JWT
- SPA avec routing
- Pages login/signup
- Game engine (Pong)
- Match & Tournament logic
- Navigation protégée (partiel)

### 🚧 En cours
- Refactorisation navigation
- Validation formulaires
- Problème uppercase/lowercase inputs

### ❌ À faire
- Routes API matches/tournaments
- Page profile
- Bouton déconnexion
- Historique en BDD

---

## 🔗 Dépendances Principales

### Backend
```json
"fastify": "^5.2.0",
"bcrypt": "^5.1.1",
"jsonwebtoken": "^9.0.2",
"@fastify/jwt": "^9.0.2",
"@fastify/cors": "^10.0.1"
```

### Frontend
```json
"typescript": "^5.7.2"
```

### Dev
```json
"tsx": "^4.19.2",
"vitest": "^2.1.8"
```

---

## 📝 Conventions de Code

### Nommage
```typescript
// Classes : PascalCase
class NavigationEvents {}

// Fonctions/méthodes : camelCase
private initSPA() {}

// Constantes : UPPER_SNAKE_CASE
const AUTH_PROTECTED_ROUTES = []

// Fichiers : kebab-case
auth-manager.ts
navigation-events.ts
```

### Organisation
- **1 fichier = 1 responsabilité**
- **Max ~300 lignes par fichier** (sauf exceptions)
- **Commentaires clairs** pour logique complexe
- **Types TypeScript** partout

---

Bonne nuit et bon dev demain ! 🚀
