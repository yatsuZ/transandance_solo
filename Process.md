# Roadmap du projet : Servir une page web avec Fastify

## 1. Création de l'arborescence

Pour bien organiser le projet, voici la structure de dossiers et fichiers mise en place :

```

/srcs
└── main.ts          # Point d'entrée de l'application Fastify en TypeScript
/static
└── index.html       # Page HTML statique à servir
/package.json          # Fichier de configuration npm avec les dépendances
/tsconfig.json         # Configuration TypeScript (optionnel)

```

---

## 2. Rédaction des fichiers

- **src/main.ts** :  
  - Création du serveur Fastify  
  - Activation du plugin `@fastify/static` pour servir les fichiers statiques  
  - Déclaration d'une route GET `/` qui renvoie la page HTML  
  - Activation du logger pour faciliter le debug

- **static/index.html** :  
  - Page HTML simple pour tester que le serveur fonctionne bien

- **package.json** :  
  - Liste des dépendances utilisées :  
    - `fastify` : framework serveur rapide et léger  
    - `@fastify/static` : plugin pour servir des fichiers statiques  
    - `typescript` et `ts-node-dev` pour le développement en TypeScript

---

## 3. Pourquoi ces librairies ?

- **Fastify** : pour sa rapidité et sa simplicité à créer des serveurs Node.js  
- **@fastify/static** : pour servir facilement des fichiers statiques (HTML, CSS, JS)  
- **TypeScript + ts-node-dev** : pour avoir du typage fort et un reload automatique en dev

---

## 4. Prochaine étape : Dockerisation

L'objectif est maintenant de dockeriser l'application pour pouvoir la lancer facilement partout.

- Créer un `Dockerfile` adapté  
- Utiliser un `docker-compose.yml` pour orchestrer le conteneur (et d'autres services si besoin)  
- Automatiser la construction et le lancement via un `Makefile`

---

## 5. Objectifs futurs

- Gérer facilement le développement, la build et le déploiement avec Docker et Makefile  
- Ajouter des tests automatisés  
- Mettre en place un système de logs stylisés et lisibles  
- Étendre l'application avec des APIs et plus de routes