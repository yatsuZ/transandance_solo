# 📋 TODO - Authentification & Navigation

**Date de création : 28 Novembre 2025**

---

## ✅ TERMINÉ (Ce qui a été fait jusqu'à maintenant)

### 1. Authentification Backend
- ✅ Routes API `/api/auth/login` et `/api/auth/signup` fonctionnelles
- ✅ JWT avec bcrypt pour hashing des mots de passe
- ✅ Middleware d'authentification pour routes protégées
- ✅ Tests (30 tests passent)

### 2. Pages Frontend Auth
- ✅ Pages login et signup créées avec style arcade
- ✅ `AuthManager` pour gérer JWT (localStorage)
- ✅ `AuthEvents` pour gérer les formulaires
- ✅ Navigation protégée par JWT

### 3. Navigation - `initSPA()` refactorisée
- ✅ Ordre de vérification clair : Racine → 404 → Auth → Contexte
- ✅ Fonctions helpers créées (`resolveTargetPage`, `handleRootPath`, etc.)
- ✅ Gestion des icônes simplifiée (`updateIconsForPage`)
- ✅ Routes centralisées dans `route-config.ts`

---

## 🚧 EN COURS / À FAIRE

### **PRIORITÉ 1 : Formulaires Auth - Validation & Problème uppercase/lowercase**
**Urgence : HAUTE - À faire demain matin**

#### Problèmes à résoudre :
- [X] **Résoudre le problème de différenciation majuscules/minuscules dans les inputs**
  - Actuellement : `InputColorizer` créé (`/srcs/static/js/utils/input-colorizer.ts`)
  - Problème : Police "Press Start 2P" ne différencie pas visuellement maj/min
  - Solution testée : Colorisation des caractères (maj en jaune, min en orange)
  - **À VALIDER : Est-ce que cette solution fonctionne correctement ?**

- [X] **Vérifier que les formulaires envoient correctement à la BDD**
  - Fichier concerné : `/srcs/static/js/auth/auth-events.ts`
  - Méthodes : `handleLogin()` et `handleSignup()`
  - Test à faire : Login → Vérifier JWT stocké → Vérifier redirection accueil

- [X] **Tester le flow complet login/signup end-to-end**
  - Signup → Créer utilisateur en BDD
  - Login → Récupérer JWT
  - Navigation protégée → Vérifier accès pages


netoyer les fichier css et factoriser netoyer navigatio
---

### **PRIORITÉ 2 : Refactoriser & Simplifier `navigation-events.ts`**
**Urgence : HAUTE - Fichier fait 444 lignes (trop long)**

#### Tâches :
- [X] **Factoriser `handleButtonClick()`**
  - Créer des helpers pour vérifications d'auth
  - Simplifier la logique (s'inspirer de `initSPA()`)
  - Réutiliser les fonctions de `route-config.ts`

- [X] **Factoriser `handlePopStateNavigation()`**
  - Appliquer la même logique que `initSPA()`
  - Ordre : Racine → 404 → Auth → Contexte
  - Réutiliser les helpers (`resolveTargetPage`, `updateIconsForPage`, etc.)

---

### **PRIORITÉ 3 : Routes API - Enregistrer Matches & Tournois en BDD**
**Urgence : MOYENNE - Après avoir fini navigation**

#### Tâches :
- [X] **Créer modèles BDD pour Match et Tournament**
  - Définir schéma Prisma ou TypeORM
  - Relations avec User (many-to-many pour Tournament, many-to-one pour Match)

- [X] **Routes API pour :**
  - `POST /api/matches` - Enregistrer un match
  - `POST /api/tournaments` - Enregistrer un tournoi
  - `GET /api/users/:id/matches` - Récupérer historique matches
  - `GET /api/users/:id/tournaments` - Récupérer historique tournois

- [X] **Lier les matches/tournois à l'utilisateur connecté (via JWT)**
  - Utiliser le middleware d'auth
  - Récupérer `userId` depuis le token JWT

- [X] **Tests pour ces routes**
  - Créer tests dans `/tests/`
  - Tester CRUD complet

**Fichiers à créer/modifier :**
```
/srcs/backend/routes/matches.ts (à créer)
/srcs/backend/routes/tournaments.ts (à créer)
/srcs/backend/models/match.model.ts (à créer)
/srcs/backend/models/tournament.model.ts (à créer)
/tests/api/matches.test.ts (à créer)
/tests/api/tournaments.test.ts (à créer)
```

---

### **PRIORITÉ 4 : Page Profile**
● Parfait ! Donc il te reste :

  Page Paramètre

  - ✅ Bouton "Déconnexion" pour logout (supprimer JWT + redirect login)
  - ❓ Choix input clavier (gauche/droite) → À décider si ici ou dans Profile

  Page Profile

  - ✅ Afficher les infos du user (username, email)
  - ✅ Historique des matchs (liste des matchs joués)
  - ✅ Statistiques (victoires, défaites, ratio, etc.)
  - ❓ Choix input clavier → À décider si ici ou dans Paramètre

  Mon avis :
  - Paramètre = Réglages techniques (déconnexion, contrôles clavier, son, etc.)
  - Profile = Stats et historique (infos perso, matchs, perf)

  Donc je mettrais les contrôles clavier dans Paramètre avec la déconnexion.

  Tu veux que je commence par quoi ?
  1. Bouton déconnexion dans Paramètre ?
  2. Page Profile avec stats + historique ?
  3. Les deux en même temps ?

#### Tâches :
- [ ] **Créer la page profile**
  - Fichier : `/srcs/static/views/pages/profile.ejs`
  - Style arcade cohérent avec le reste

- [ ] **Afficher les données utilisateur**
  - Username
  - Email (si existant)
  - Date de création du compte
  - Stats globales (nombre de matches, victoires, défaites)

- [ ] **Afficher historique des matches**
  - Liste des derniers matches
  - Affichage : Adversaire, Score, Date

- [ ] **Afficher historique des tournois**
  - Liste des tournois participés
  - Affichage : Nom du tournoi, Position finale, Date

**Fichiers à créer/modifier :**
```
/srcs/static/views/pages/profile.ejs (à créer)
/srcs/static/css/pages/profile.css (à créer)
/srcs/static/js/core/dom-elements.d.ts (ajouter page profile)
/srcs/static/js/core/dom-manager.ts (ajouter page profile)
/srcs/static/views/main.ejs (ajouter include profile)
```

---

### **PRIORITÉ 5 : Bouton Déconnexion**
**Urgence : BASSE - En dernier**

#### Tâches :
- [ ] **Ajouter bouton "Déconnexion" dans la page Paramètres**
  - Fichier : `/srcs/static/views/pages/parametre.ejs`
  - Style : Bouton rouge arcade "LOGOUT"

- [ ] **Implémenter `AuthManager.logout()`**
  - Clear localStorage (JWT + user data)
  - Rediriger vers login

- [ ] **Tester le flow complet**
  - Login → Utilisation → Logout → Vérifier redirection login
  - Vérifier que le JWT est bien supprimé
  - Vérifier qu'on ne peut plus accéder aux pages protégées

**Fichiers à modifier :**
```
/srcs/static/js/auth/auth-manager.ts (ajouter méthode logout)
/srcs/static/views/pages/parametre.ejs (ajouter bouton)
/srcs/static/css/pages/parametre.css (style bouton logout)
```

---

## 🎯 ESTIMATION DE PROGRESSION

### Où tu en es :
- **Backend Auth** : ✅ 100% terminé
- **Frontend Auth (base)** : ✅ 90% terminé (reste validation formulaires)
- **Navigation SPA** : ✅ 70% terminé (`initSPA` fait, reste `handleButtonClick` & `handlePopStateNavigation`)
- **Match/Tournament en BDD** : ❌ 0% (pas commencé)
- **Page Profile** : ❌ 0% (pas commencé)
- **Bouton Déconnexion** : ❌ 0% (pas commencé)

### **Progression globale du projet : ~60-65%**

### Ce qui reste à faire (estimation temps) :
1. **Formulaires + Navigation (1-2 jours)** ← En cours
2. **Routes API Match/Tournament (1-2 jours)**
3. **Page Profile (1 jour)**
4. **Bouton Déconnexion (0.5 jour)**

### **Temps restant estimé : 3-5 jours de dev**

---

## 🎮 Tu es proche de la fin ?

**OUI, tu es proche !** Voici pourquoi :

✅ **Les gros morceaux sont faits :**
- Architecture backend (Fastify + JWT + BDD)
- Game logic (Pong, Match, Tournament)
- SPA avec routing
- Auth (backend + frontend base)

🚧 **Ce qui reste est "facile" comparé à ce qui est fait :**
- Formulaires → Juste de la validation
- Routes API → Pattern déjà établi (tu l'as fait 30 fois)
- Page Profile → Juste de l'affichage
- Déconnexion → 10 lignes de code

💪 **Tu es à ~65% du projet complet**

Une fois ces 5 tâches terminées, tu auras un projet **full-stack complet** avec :
- ✅ Authentification JWT
- ✅ Jeu Pong multijoueur local
- ✅ Système de tournoi
- ✅ Historique en BDD
- ✅ Profil utilisateur
- ✅ SPA moderne

**Courage, tu y es presque ! 🚀**

---

## 📝 PLAN D'ACTION POUR DEMAIN MATIN

**Ordre recommandé :**

1. **☕ Premier café - Tester les formulaires (30 min)**
   - Lancer le projet : `npm run dev`
   - Tester signup → Vérifier BDD
   - Tester login → Vérifier JWT
   - Tester navigation protégée

2. **🔧 Résoudre problème uppercase/lowercase (1h)**
   - Option 1 : Garder `InputColorizer` et valider que ça fonctionne
   - Option 2 : Changer de police pour une qui différencie maj/min
   - Décision à prendre ensemble

3. **🚀 Refactoriser `handleButtonClick()` (2h)**
   - S'inspirer de `initSPA()`
   - Créer helpers
   - Tester navigation par boutons

4. **🚀 Refactoriser `handlePopStateNavigation()` (2h)**
   - Même logique que `initSPA()`
   - Tester back/forward du navigateur

5. **✅ Validation complète navigation (30 min)**
   - Tester tous les cas : login, logout, pages protégées, 404, 403
   - Vérifier que tout fonctionne

**Objectif de la journée : Finir PRIORITÉ 1 et PRIORITÉ 2**

---

## 📚 FICHIERS IMPORTANTS À CONNAÎTRE

### Navigation
```
/srcs/static/js/events/navigation-events.ts     ← Gère toute la navigation
/srcs/static/js/navigation/route-config.ts      ← Configuration des routes
/srcs/static/js/navigation/page-manager.ts      ← Gestion affichage pages
/srcs/static/js/utils/url-helpers.ts            ← Helpers URL
```

### Auth
```
/srcs/static/js/auth/auth-manager.ts            ← Gestion JWT localStorage
/srcs/static/js/auth/auth-events.ts             ← Events formulaires login/signup
/srcs/backend/core/auth/auth.service.ts         ← Service auth backend
/srcs/backend/core/auth/auth.middleware.ts      ← Middleware JWT
```

### Pages
```
/srcs/static/views/pages/login.ejs              ← Page login
/srcs/static/views/pages/signup.ejs             ← Page signup
/srcs/static/views/pages/accueil.ejs            ← Page accueil
/srcs/static/views/pages/parametre.ejs          ← Page paramètres
/srcs/static/views/main.ejs                     ← Template principal
```

### Styles
```
/srcs/static/css/pages/auth.css                 ← Styles login/signup
/srcs/static/css/style.css                      ← Styles globaux
```

---

## 💤 Bonne nuit !

On se voit demain pour finir la navigation et les formulaires ! 🚀

**N'oublie pas :**
- Tester les formulaires en premier
- Décider pour le problème uppercase/lowercase
- Refactoriser `handleButtonClick` et `handlePopStateNavigation`

Repose-toi bien ! 😴
