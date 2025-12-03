# To Do

Ce fichier fait office de cahier des charges.  
Il servira de base pour créer les tickets.

- [To Do](#to-do)
  - [Liste des tâches General](#liste-des-tâches-general)
    - [🟠 PARTIE BASIQUE OBLIGATOIRE (SANS MODULES)](#-partie-basique-obligatoire-sans-modules)
      - [🔧 GÉNÉRAL :](#-général-)
      - [🐳 DOCKER :](#-docker-)
      - [🔒 SÉCURITÉ :](#-sécurité-)
      - [🖥️ BACKEND :](#️-backend-)
      - [🎨 FRONTEND :](#-frontend-)
      - [🕹️ JEU :](#️-jeu-)
      - [🌐 AUTRES :](#-autres-)
  - [Les modules](#les-modules)

## Liste des tâches General

| À faire                              | Fait |
|-------------------------------------|------|
| Partie obligatoire                   | ✅   |
| Choisir les modules                 | ✅   |
| Écrire les TO_DO des modules choisis | ✅   |

---

### 🟠 PARTIE BASIQUE OBLIGATOIRE (SANS MODULES)

#### 🔧 GÉNÉRAL :
- Le site doit être une [Single Page Application (SPA)](https://en.wikipedia.org/wiki/Single-page_application).
- Les boutons **précédent / suivant** du navigateur doivent fonctionner correctement.

#### 🐳 DOCKER :
- Le site doit être entièrement hébergé dans un conteneur **Docker**.
- Le projet doit pouvoir être lancé avec **une seule commande**.

> ⚠️ **Alerte :** En raison des limitations du hub 42, nous avons la possibilité de porter le projet dans une machine virtuelle pour bénéficier des droits root et installer les versions souhaitées.

#### 🔒 SÉCURITÉ :
- Les **mots de passe** en base de données doivent être **hachés** (hashés).
- Le site doit être protégé contre les **injections SQL**.
- Toute communication (backend, WebSocket, etc.) doit passer par une connexion **HTTPS** (ex : utiliser `wss://` au lieu de `ws://`).
- Tu dois mettre en place une **validation des données** côté client **ou** côté serveur, selon si un backend est utilisé ou non.
- Tu dois prévoir une **protection des routes API** et une sécurité de base pour les connexions (avec ou sans JWT / 2FA).
- Les **variables d’environnement** doivent être **stockées localement**, **non committées sur Git**, et les **mots de passe de hachage** doivent être forts.

#### 🖥️ BACKEND :
- Utiliser `PHP` sans framework (peut être remplacé par un module "Framework").
- Si une base de données est utilisée, elle doit suivre les exigences du module "Database".

#### 🎨 FRONTEND :
- Utiliser `TypeScript` pour le front (modifiable via le module "Front").
- Le jeu doit respecter les contraintes du frontend (ou être adapté via le module "FrontEnd" ou "Graphics").

#### 🕹️ JEU :
- Permettre de jouer à **Pong à deux en direct sur le site**. (Le jeu en ligne est couvert par le module "Remote Players").
- Avoir un **système de tournoi** avec des matchs prédéfinis, enregistrement de pseudo, et reset à chaque tournoi. (Modifiable via un module).
- Tous les joueurs (et IA) doivent avoir les **mêmes règles**, **même paddle**, et **même vitesse**.

#### 🌐 AUTRES :
- Le site doit être **compatible avec la dernière version de Firefox**, ainsi que les autres navigateurs majeurs.
- Le site ne doit pas présenter **d’anomalies ou de bugs visibles** pendant son utilisation.

---

## Les modules

### 📊 Récapitulatif des modules choisis

| Module | Type | Points | Statut |
|--------|------|--------|--------|
| Framework Backend (Fastify) | Majeur | 1 | ✅ Fait |
| Database (SQLite) | Mineur | 0.5 | ✅ Fait |
| Standard User Management | Majeur | 1 | 🚧 75% (amis + profils restants) |
| Remote Authentication (Google OAuth) | Majeur | 1 | ❌ Pas commencé |
| 2FA & JWT | Majeur | 1 | 🟡 50% (JWT fait, 2FA à faire) |
| AI Opponent | Majeur | 1 | 🟡 50% (à améliorer) |
| Additional Game (Tron) | Majeur | 1 | ❌ Pas commencé |
| Game Customization | Mineur | 0.5 | ❌ Pas commencé |

**Total : 6 majeurs + 2 mineurs = 7 points**

---

### 🟢 MODULE 1 : Framework Backend (Majeur - 1 pt) ✅ FAIT

**Technologie choisie :** Fastify (Node.js)

**Critères de validation :**
- [x] Utiliser un framework backend spécifique (pas PHP vanilla)
- [x] Framework bien intégré avec le reste du projet
- [x] Routing fonctionnel
- [x] Gestion des fichiers statiques

---

### 🟢 MODULE 2 : Database (Mineur - 0.5 pt) ✅ FAIT

**Technologie choisie :** SQLite3 (better-sqlite3)

**Critères de validation :**
- [X] Base de données SQLite configurée
- [X] Schéma de tables créé (users, matches, tournaments, scores)
- [X] Intégration avec Fastify
- [X] CRUD fonctionnel

**Tâches :**
- [X] Installer `better-sqlite3`
- [X] Créer le fichier de schéma SQL
- [X] Créer les helpers/repository pour les requêtes
- [X] Initialisation automatique de la DB au démarrage

---

### 🟡 MODULE 3 : Standard User Management (Majeur - 1 pt) 🚧 EN COURS (~75%)

**Critères de validation :**
- [X] Inscription utilisateur (username, email, password hashé)
- [X] Connexion / Déconnexion (JWT avec HTTP-only cookies)
- [X] Profil utilisateur avec avatar (upload ou URL)
- [X] Historique des matchs joués
- [X] Statistiques (victoires/défaites, ratio, tournois)
- [X] **Page Leaderboard / Classement des joueurs** ✅ NOUVEAU
- [ ] Liste d'amis (ajouter/supprimer) ❌ À FAIRE PROCHAINEMENT
- [X] Voir les profils des autres utilisateurs

**Tâches :**
- [X] API routes : POST /register, POST /login, GET /logout
- [X] API routes : GET /profile, PUT /profile (avec upload avatar)
- [X] API routes : GET /matches/history/:userId
- [X] API routes : GET /users/leaderboard/top
- [ ] API routes : GET /friends, POST /friends/:id, DELETE /friends/:id ❌ À FAIRE
- [X] API routes : GET /profile/:id (voir profil d'un autre user) ❌ À FAIRE
- [X] Hash des mots de passe (bcrypt)
- [X] Upload d'avatar (multer + stockage local)
- [X] Pages frontend : inscription, connexion, profil, leaderboard
- [X] Pages frontend : liste d'amis, profil des autres users 

---

### 🟡 MODULE 4 : Remote Authentication - Google OAuth (Majeur - 1 pt)

**Critères de validation :**
- [ ] Authentification via Google Sign-In
- [ ] Création automatique du compte si premier login
- [ ] Liaison avec compte existant possible
- [ ] Token Google validé côté serveur

**Tâches :**
- [ ] Créer projet Google Cloud Console
- [ ] Configurer OAuth 2.0 credentials
- [ ] API route : GET /auth/google, GET /auth/google/callback
- [ ] Stocker les infos Google (google_id, email, avatar)
- [ ] Bouton "Se connecter avec Google" sur le frontend

---

### 🟡 MODULE 5 : 2FA & JWT (Majeur - 1 pt)

**Critères de validation :**
- [ ] JWT pour l'authentification (access token + refresh token)
- [ ] 2FA avec application authenticator (TOTP)
- [ ] QR code pour configurer le 2FA
- [ ] Activation/désactivation du 2FA dans les paramètres
- [ ] Tokens stockés de manière sécurisée

**Tâches :**
- [ ] Installer `jsonwebtoken` et `otplib` (ou `speakeasy`)
- [ ] Génération JWT à la connexion
- [ ] Middleware de vérification JWT
- [ ] API routes : POST /2fa/enable, POST /2fa/verify, POST /2fa/disable
- [ ] Génération QR code pour Google Authenticator / Authy
- [ ] Page frontend pour activer/vérifier le 2FA

---

### 🟡 MODULE 6 : AI Opponent (Majeur - 1 pt)

**Contrainte du sujet :** L'IA ne peut "voir" le jeu qu'**une fois par seconde**.

**Critères de validation :**
- [ ] IA capable de jouer contre un humain
- [ ] IA respecte la contrainte de vision (1x/sec)
- [ ] IA utilise un algorithme intelligent (pas juste suivre la balle)
- [ ] IA peut gagner de manière réaliste
- [ ] Pas d'utilisation de l'algorithme A*

**Tâches :**
- [ ] Limiter les updates de l'IA à 1 fois par seconde
- [ ] Implémenter la prédiction de trajectoire de la balle
- [ ] Ajouter une stratégie (anticipation, positionnement)
- [ ] Ajouter un peu d'imprécision pour rendre l'IA battable
- [ ] Différents niveaux de difficulté (optionnel)

---

### 🟡 MODULE 7 : Additional Game - Tron (Majeur - 1 pt)

**Critères de validation :**
- [ ] Nouveau jeu différent de Pong
- [ ] Intégré au système de tournoi existant
- [ ] Historique des matchs enregistré
- [ ] Matchmaking fonctionnel
- [ ] Interface utilisateur cohérente avec le reste du site

**Tâches :**
- [ ] Créer la logique du jeu Tron (2 joueurs, traces, collisions)
- [ ] Canvas ou DOM pour le rendu
- [ ] Contrôles clavier (flèches / ZQSD)
- [ ] Intégrer au système de tournoi
- [ ] Page de sélection du jeu (Pong ou Tron)
- [ ] Enregistrer les résultats en DB

---

### 🟡 MODULE 8 : Game Customization (Mineur - 0.5 pt)

**Critères de validation :**
- [ ] Options de personnalisation du jeu
- [ ] Power-ups disponibles
- [ ] Personnalisation sauvegardée par utilisateur

**Tâches :**
- [ ] Choix de la couleur du paddle
- [ ] Choix de la couleur de la balle
- [ ] Choix de la couleur du terrain
- [ ] Choix de la couleur du texte/score
- [ ] Photo de profil (avatar)
- [ ] Power-ups en jeu (vitesse, taille paddle, etc.)
- [ ] Sauvegarder les préférences en DB
- [ ] Page paramètres pour configurer

---

## Ordre d'implémentation recommandé

1. **Database (SQLite)** - Pré-requis pour tout le reste
2. **Standard User Management** - Inscription/connexion/profils
3. **Remote Authentication (Google OAuth)** - Complémente le user management
4. **2FA & JWT** - Sécurise l'authentification
5. **AI Opponent** - Améliorer l'IA existante
6. **Additional Game (Tron)** - Nouveau jeu
7. **Game Customization** - Personnalisation finale
