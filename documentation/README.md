# 📚 Documentation du Projet Pong

Bienvenue dans la documentation du projet ! Voici un sommaire pour t'aider à naviguer entre les différents fichiers.

---

## 📋 Sommaire des Fichiers

### 🎯 **TODO_DEMAIN.md**
**Ce qu'il reste à faire - Plan d'action pour demain**

Liste complète et détaillée des tâches à faire pour finir le projet :
- ✅ Ce qui est terminé (Auth backend, Navigation refactorisée, etc.)
- 🚧 Ce qui est en cours (Formulaires, Navigation)
- ❌ Ce qui reste à faire (Routes API Match/Tournament, Page Profile, Déconnexion)
- 📊 Estimation de progression (65% du projet)
- 📝 Plan d'action pour demain matin

**👉 Consulte ce fichier en premier chaque matin pour savoir quoi faire !**

---

### 🏗️ **ARCHITECTURE.md**
**Architecture complète du projet**

Documentation technique détaillée :
- 📁 Structure des dossiers (Backend/Frontend)
- 🔄 Flux de l'application (Démarrage, Navigation, Auth)
- 🎮 Game Logic (Match/Tournament/GameEngine)
- 🔒 Sécurité (JWT, Middleware, Protection routes)
- 🎨 Système de design (Thème arcade rétro)
- 📡 API Routes (actuelles et à venir)
- 🧪 Tests
- 🚀 Déploiement (Docker)

**👉 Consulte ce fichier quand tu as besoin de comprendre comment fonctionne le projet !**

---

### 🗺️ **ROADMAP_BDD.md**
**Roadmap pour l'implémentation de la base de données**

Plan détaillé pour implémenter la BDD SQLite :
- Structure des tables (Users, Matches, Tournaments)
- Routes API à créer
- Modèles de données
- Tests à écrire
- Ordre d'implémentation

**👉 Consulte ce fichier quand tu commences à implémenter les routes API Match/Tournament !**

---

### 📊 **CHANGELOG_BDD.md**
**Compte-rendu du module Base de Données**

Journal de bord de l'implémentation de la BDD :
- ✅ Ce qui a été fait
- 🔧 Problèmes rencontrés et solutions
- 📝 Notes techniques
- 🎯 Prochaines étapes

**👉 Consulte ce fichier pour voir l'historique des changements sur la BDD !**

---

### 📝 **TO_DO.md**
**Cahier des charges complet du projet**

Document principal qui liste TOUS les modules du projet :
- 🟠 Partie basique obligatoire (SPA, Docker, Sécurité, etc.)
- 📊 Récapitulatif des 8 modules choisis
- Détails de chaque module (critères, tâches)
- Ordre d'implémentation recommandé

**👉 Consulte ce fichier pour voir la vue d'ensemble du projet complet !**

---

### 📌 **remainder.md**
**Rappel rapide des tâches urgentes**

Liste très courte des tâches immédiates (anciennes) :
- Créer routes API users
- Mettre à jour tests
- Créer tests authentification

**⚠️ Ce fichier est OBSOLÈTE, utilise TODO_DEMAIN.md à la place !**

---

## 🚀 Workflow Recommandé

### Chaque matin :
1. 📖 Lire **TODO_DEMAIN.md** pour savoir quoi faire
2. ✅ Cocher les tâches au fur et à mesure
3. 📝 Mettre à jour si besoin

### En cas de doute sur l'architecture :
1. 📖 Consulter **ARCHITECTURE.md**
2. 🔍 Chercher le fichier concerné
3. 💡 Comprendre le flux

### Pour implémenter la BDD :
1. 📖 Lire **ROADMAP_BDD.md**
2. 📊 Suivre l'ordre d'implémentation
3. ✅ Mettre à jour **CHANGELOG_BDD.md**

### Pour voir la vue d'ensemble :
1. 📖 Consulter **TO_DO.md**
2. 📊 Voir les modules restants
3. 🎯 Planifier la suite

---

## 📂 Organisation des Fichiers

```
documentation/
├── README.md              ← TU ES ICI
├── TODO_DEMAIN.md         ← Plan d'action quotidien
├── ARCHITECTURE.md        ← Doc technique
├── ROADMAP_BDD.md         ← Plan BDD
├── CHANGELOG_BDD.md       ← Historique BDD
├── TO_DO.md               ← Cahier des charges complet
├── remainder.md           ← (Obsolète)
└── sujet/                 ← Sujet du projet
```

---

## 🎯 État Actuel du Projet

**Progression globale : ~65%**

### ✅ Terminé
- Backend Fastify avec routes API
- Authentification JWT (backend + frontend)
- SPA avec routing
- Pages login/signup
- Game engine (Pong)
- Match & Tournament logic
- Navigation refactorisée (`initSPA`)

### 🚧 En cours
- Validation formulaires
- Problème uppercase/lowercase inputs
- Refactorisation `handleButtonClick` & `handlePopStateNavigation`

### ❌ À faire
- Routes API matches/tournaments
- Page profile
- Bouton déconnexion
- Historique en BDD

---

**Temps restant estimé : 3-5 jours de dev**

Bon courage ! 🚀
