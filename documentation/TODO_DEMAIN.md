# 📋 TODO - Prochaine Session

**Date de mise à jour : 1er Décembre 2025**

---

## ✅ CE QUI A ÉTÉ FAIT AUJOURD'HUI

### 1. Page Leaderboard / Classement ✅
- ✅ Création de la page leaderboard complète (HTML/CSS)
- ✅ Design avec podium pour le top 3 (or/argent/bronze + couronne)
- ✅ Tableau pour les rangs 4-20
- ✅ `LeaderboardManager` créé pour gérer l'affichage
- ✅ Intégration dans le système DOMElements
- ✅ Route protégée `/leaderboard` ajoutée
- ✅ Navigation intégrée (initSPA, boutons, popstate)
- ✅ API backend déjà existante : GET `/api/users/leaderboard/top`
- ✅ Fix du problème de double wrapper (leaderboard.ejs)

**Status : Leaderboard COMPLET, prêt à tester après rebuild**

---

## 🎯 PROCHAINE SESSION - MODULE 3 : Standard User Management

### Objectif : Compléter le Module 3 à 100%

**Ce qui reste à faire :**

### **PRIORITÉ 1 : Système d'amis (Friends System)**

#### Backend :
- [ ] **Créer table `friends` en BDD**
  ```sql
  CREATE TABLE friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id),
    UNIQUE(user_id, friend_id)
  );
  ```

- [ ] **Routes API à créer :**
  - `GET /api/friends` - Liste des amis (status = 'accepted')
  - `GET /api/friends/requests` - Demandes d'amis en attente
  - `POST /api/friends/:userId` - Envoyer demande d'ami
  - `PUT /api/friends/:friendId/accept` - Accepter demande
  - `PUT /api/friends/:friendId/reject` - Refuser demande
  - `DELETE /api/friends/:friendId` - Supprimer ami

- [ ] **Repository à créer :**
  - `/srcs/backend/database/repositories/friend.repository.ts`
  - Méthodes : `getFriends()`, `sendRequest()`, `acceptRequest()`, `rejectRequest()`, `removeFriend()`

#### Frontend :
- [ ] **Créer la page Friends**
  - Fichier : `/srcs/static/views/pages/friends.ejs`
  - Style : `/srcs/static/css/pages/friends.css`

- [ ] **Sections de la page :**
  - Liste des amis (avec avatars, usernames)
  - Demandes d'amis en attente (avec boutons Accepter/Refuser)
  - Bouton "Supprimer" pour chaque ami
  - Barre de recherche pour trouver des utilisateurs

- [ ] **Manager à créer :**
  - `/srcs/static/js/friends/friends-manager.ts`
  - Méthodes : `loadFriends()`, `sendRequest()`, `acceptRequest()`, `rejectRequest()`, `removeFriend()`

- [ ] **Intégration :**
  - Ajouter "friends" dans DOMElements
  - Ajouter route `/friends` dans navigation helpers
  - Ajouter bouton dans accueil.ejs

---

### **PRIORITÉ 2 : Voir les profils des autres utilisateurs**

#### Backend :
- [ ] **Route API à créer :**
  - `GET /api/users/:userId/profile` - Récupérer profil public d'un user
  - Retourne : username, avatar, stats (wins, losses, ratio, tournois), historique matchs

#### Frontend :
- [ ] **Modifier ProfilePageManager**
  - Ajouter méthode `loadUserProfile(userId: number)` (en plus de `loadProfile()` qui charge le profil courant)
  - Différencier profil courant vs profil d'un autre user
  - Cacher le bouton "Éditer" si ce n'est pas notre profil

- [ ] **Navigation :**
  - Permettre de cliquer sur un username (dans leaderboard, friends, match history) pour ouvrir son profil
  - Route dynamique : `/profile/:userId`
  - Si `:userId` = user connecté → afficher profil éditable
  - Sinon → afficher profil en lecture seule

- [ ] **Ajouter bouton "Ajouter en ami"**
  - Dans le profil d'un autre user
  - Envoyer demande d'ami via l'API

---

## 📊 ÉTAT DES MODULES

### Module 3 : Standard User Management
**Progression actuelle : 75% → Objectif : 100%**

✅ **Déjà fait :**
- Inscription / Connexion / Déconnexion
- Profil utilisateur avec avatar (upload)
- Historique des matchs
- Statistiques (wins, losses, ratio, tournois)
- Page Leaderboard (classement des joueurs)

❌ **Reste à faire :**
- Système d'amis (add/remove/requests)
- Voir profils des autres utilisateurs

---

## 🗂️ FICHIERS À CRÉER / MODIFIER

### Backend
```
📁 /srcs/backend/database/
  └── migrations/
      └── 006_create_friends_table.sql (à créer)
  └── repositories/
      └── friend.repository.ts (à créer)

📁 /srcs/backend/routes/
  └── friends/
      └── index.ts (à créer)
      └── handlers/
          └── get-friends.ts (à créer)
          └── send-request.ts (à créer)
          └── accept-request.ts (à créer)
          └── reject-request.ts (à créer)
          └── remove-friend.ts (à créer)
  └── users/
      └── handlers/
          └── get-user-profile.ts (à créer)
```

### Frontend
```
📁 /srcs/static/views/pages/
  └── friends.ejs (à créer)

📁 /srcs/static/css/pages/
  └── friends.css (à créer)

📁 /srcs/static/js/
  └── friends/
      └── friends-manager.ts (à créer)
  └── profile/
      └── profile-page-manager.ts (à modifier - ajouter loadUserProfile)
  └── core/
      └── dom-elements.d.ts (à modifier - ajouter friends)
      └── dom-manager.ts (à modifier - ajouter friends)
  └── navigation/
      └── helpers.ts (à modifier - ajouter route /friends et /profile/:userId)
```

---

## 🎮 APRÈS MODULE 3 - SUITE DU PROJET

Une fois le Module 3 terminé (100%), tu auras complété :
- ✅ Module 1 : Framework Backend (Fastify) - 1 pt
- ✅ Module 2 : Database (SQLite) - 0.5 pt
- ✅ Module 3 : Standard User Management - 1 pt
- 🟡 Module 5 : JWT (partie faite) - 0.5 pt sur 1 pt

**Points acquis : 3 / 7 points (~43%)**

**Modules restants à faire :**
1. Module 4 : Google OAuth - 1 pt
2. Module 5 : 2FA (partie restante) - 0.5 pt
3. Module 6 : AI Opponent (amélioration) - 1 pt
4. Module 7 : Tron - 1 pt
5. Module 8 : Game Customization - 0.5 pt

---

## 💡 CONSEILS POUR LA PROCHAINE SESSION

### Ordre recommandé :
1. **Commencer par le backend Friends** (BDD + Routes API + Tests)
2. **Puis le frontend Friends** (Page + Manager + Navigation)
3. **Ensuite View User Profile** (Backend + Frontend)
4. **Tester le flow complet** (Amis + Profils)

### Estimation temps :
- **Système d'amis (backend + frontend)** : 4-6h
- **Voir profils utilisateurs** : 2-3h
- **Tests & debug** : 1-2h

**Total estimé : 1 journée de dev**

---

## 📚 RAPPEL : LEADERBOARD À TESTER

N'oublie pas de tester le leaderboard avant de commencer le reste :
```bash
npm run build
npm run start
```

Puis vérifier :
- ✅ Page accessible via bouton "🏅 Classement"
- ✅ Top 3 affiché dans le podium
- ✅ Rangs 4-20 affichés dans le tableau
- ✅ Données correctes (wins, losses, ratio, tournois)

---

## 🚀 Bonne prochaine session !

**Objectif : Compléter Module 3 à 100%**

Une fois terminé, tu auras un système de gestion utilisateur complet avec :
- ✅ Auth (signup/login/logout)
- ✅ Profils (stats + historique)
- ✅ Classement (leaderboard)
- ✅ Amis (add/remove/requests)
- ✅ Profils publics (voir autres users)

Courage ! 💪
