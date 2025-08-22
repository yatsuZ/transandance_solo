import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import chalk from 'chalk';

console.log(chalk.magenta("\nPremier ticket : servir la page depuis un docker\n"));

const fastify = Fastify({
  logger: true, // Active les logs pour faciliter le débogage
});

// Enregistrer le plugin pour les fichiers statiques
fastify.register(fastifyStatic, {
  root: path.join(__dirname, './../../static'),
  prefix: '/', // Indique que les fichiers sont servis à la racine de l'URL
});

// Déclarer une route pour la page d'accueil (optionnel si tu utilises le plugin statique)
fastify.get('/', (request, reply) => {
  reply.sendFile('index.html');
});

// Lancer le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();