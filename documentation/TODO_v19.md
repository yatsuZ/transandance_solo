# 📋 TODO ft_transcendence v19

**Dernière mise à jour** : 2025-12-09
**Points actuels** : 13/14 ❌ **INSUFFISANT**
**Objectif** : 17/14 ✅ (marge de sécurité)

---

## 🚨 ÉLÉMENTS CRITIQUES (BLOQUANTS)

Sans ces éléments → **REJET AUTOMATIQUE** même avec 50 points

### 1. Privacy Policy Page
- [ ] Créer `/privacy` route dans le backend
- [ ] Créer page EJS `privacy.ejs` avec contenu légal
- [ ] Ajouter lien dans footer/menu
- [ ] Tester accessibilité

### 2. Terms of Service Page
- [ ] Créer `/terms` route dans le backend
- [ ] Créer page EJS `terms.ejs` avec conditions d'utilisation
- [ ] Ajouter lien dans footer/menu
- [ ] Tester accessibilité

### 3. README.md Complet v19
- [ ] **Team Information** : Rôles (PO, PM, Tech Lead) - solo donc tout toi
- [ ] **Project Management** : Organisation, planning, méthodologie
- [ ] **Technical Stack** : Liste complète des technologies
- [ ] **Database Schema** : Schéma des 5 tables avec relations
- [ ] **Features List** : Liste détaillée de toutes les fonctionnalités
- [ ] **Modules** : Tableau avec tous les modules + justifications + points
- [ ] **Individual Contributions** : Tes contributions (solo donc 100%)
- [ ] Instructions de déploiement Docker
- [ ] Guide d'utilisation

---

## ✅ MODULES VALIDÉS (13 points)

### User Management (5 points)
- [x] Standard user management (email/password, bcrypt, JWT) - **2pts Major**
- [x] Game statistics & history (matches table avec stats) - **1pt Minor**
- [x] OAuth Google (Google OAuth 2.0 implémenté) - **1pt Minor**
- [x] 2FA (TOTP avec QR code) - **1pt Minor**

### Gaming (5 points)
- [x] Web-based game (Pong avec Canvas) - **2pts Major**
- [x] Add another game (Tron implémenté) - **2pts Major**
- [x] Tournament system (4 joueurs, matchmaking, bracket) - **1pt Minor**

### AI (2 points)
- [x] AI Opponent (4 niveaux d'IA fonctionnels) - **2pts Major**

### Game Customization (1 point EN COURS)
- [ ] **Power-ups pour Pong** : vitesse, taille paddle, balles multiples
- [ ] **OU Maps différentes pour Tron** : obstacles, zones bonus
- [ ] **OU Customisation visuelle** : couleurs, thèmes, effets
- [ ] Tester et documenter

**Note** : Actuellement marqué comme ⚠️ EN COURS - à sécuriser absolument

---

## 🎯 MODULE PRIORITAIRE : CHAT (+4 POINTS)

**Objectif** : Passer de 13 à 17 points en implémentant le chat

### Backend Chat (WebSockets)
- [ ] Installer `ws` ou `socket.io` pour WebSockets
- [ ] Créer WebSocket server dans backend
- [ ] Créer table `messages` dans SQLite
  ```sql
  CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    timestamp DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );
  ```
- [ ] API endpoints :
  - `POST /api/chat/send` - envoyer message
  - `GET /api/chat/history/:userId` - historique messages
  - WebSocket `/ws/chat` - temps réel
- [ ] Authentification WebSocket avec JWT

### Frontend Chat
- [ ] Interface chat avec liste amis (réutiliser friendships)
- [ ] Zone de messages en temps réel
- [ ] Input pour envoyer messages
- [ ] Notifications nouveaux messages
- [ ] Client WebSocket TypeScript

### Tests Chat
- [ ] 2 users peuvent chatter en simultané
- [ ] Messages persistés dans BDD
- [ ] Temps réel fonctionne (< 1s latence)
- [ ] Pas de perte de messages

**Points gagnés** : +4 (Chat=2pts + WebSockets=2pts)

---

## 📅 PLAN 3 JOURS

### JOUR 1 : Game Customization + Sécurisation ⏰
- [ ] Améliorer Game Customization (ajouter power-ups OU maps)
- [ ] Vérifier que Tournament est bien documenté
- [ ] S'assurer que AI 4 niveaux est démontrable
- [ ] Tester tous les modules actuels

### JOUR 2 : Chat + WebSockets ⏰
- [ ] Morning : Backend chat + WebSocket server + BDD
- [ ] Afternoon : Frontend chat interface
- [ ] Evening : Tests chat en temps réel

### JOUR 3 : Obligatoire + Finitions ⏰
- [ ] Morning : Privacy Policy + Terms of Service pages
- [ ] Afternoon : README.md complet v19
- [ ] Evening : Tests multi-users + nettoyage code
- [ ] Vérification finale : 0 erreurs console

---

## ✅ PARTIE OBLIGATOIRE (Checklist)

### Technique
- [x] Frontend responsive (Canvas + TypeScript)
- [x] CSS framework ou custom (custom styles)
- [x] Backend framework (Fastify)
- [x] Database (SQLite3)
- [x] User management standard (email/password)
- [x] Form validation (frontend + backend)
- [x] HTTPS everywhere (Nginx reverse proxy)
- [x] Docker (docker-compose.yml)
- [x] Compatible Google Chrome
- [x] No console errors
- [x] .env local (.env + .env.example)
- [x] Git avec commits clairs
- [x] **Support multi-users** (2+ users simultanés) ✅

### Documentation (CRITIQUE)
- [ ] **Privacy Policy page** (`/privacy`)
- [ ] **Terms of Service page** (`/terms`)
- [ ] **README.md complet** avec TOUTES les sections v19

---

## 🎯 RÉSULTAT FINAL ATTENDU

**Après 3 jours** :
- ✅ Partie obligatoire : **100%**
- ✅ Points modules : **17 / 14** (+3 marge)
- ✅ Projet validable confortablement
- ✅ Fonctionnalités impressionnantes (chat temps réel)

---

## 📊 RÉCAPITULATIF POINTS

| État | Points | Détail |
|------|--------|--------|
| **Actuellement** | 13 | User Mgmt(5) + Gaming(5) + AI(2) + GameCustom(1 en cours) |
| **Minimum requis** | 14 | ❌ Insuffisant (risque rejet si GameCustom contesté) |
| **Avec Chat** | 17 | ✅ Confortable (13 + Chat(2) + WebSockets(2)) |
| **Marge de sécurité** | +3 | 17 - 14 = 3 points de marge |

---

## ⚠️ POINTS D'ATTENTION

1. **Game Customization** : Doit être incontestable (power-ups OU maps OU custom visuel)
2. **Chat** : Minimum viable = messages + temps réel + persistance BDD
3. **README** : Ne pas négliger, c'est **ÉLIMINATOIRE**
4. **Tests multi-users** : Vérifier que tout fonctionne avec 2+ users

---

**Status actuel** : 🟡 EN COURS - JOUR 1 - Game Customization
