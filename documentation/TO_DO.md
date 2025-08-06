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
| Partie obligatoire                   | ❌   |
| Choisir les modules                 | ❌   |
| Écrire les TO_DO des modules choisis | ❌   |

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

> Commencez par **terminer la partie obligatoire**.  
> Ensuite, vous pourrez **choisir les modules** et rédiger cette partie.
