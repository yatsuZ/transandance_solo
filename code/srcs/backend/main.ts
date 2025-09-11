import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import chalk from 'chalk';

console.log(chalk.magenta("\nServeur démarré avec Fastify + EJS\n"));

// Divisé en plusieur fichier
// 1. config fastify

const fastify = Fastify({
  logger: true,
});

// Plugin EJS
fastify.register(fastifyView, {
  engine: { ejs },
  root: path.join(__dirname, './../../static/views'),
});

// Fichiers statiques (CSS / JS / images)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, './../../static'),
  prefix: '/static/', // accès via /static/css/style.css ou /static/js/app.js
});

// 2. Faire les routes

// Routes pour SPA
fastify.get('/', async (request, reply) => {
  return reply.view('main.ejs', { title: 'Accueil' });
});

fastify.get('/match', async (request, reply) => {
  return reply.view('match.ejs', { title: 'Match' });
});

fastify.get('/tournament', async (request, reply) => {
  return reply.view('tournament.ejs', { title: 'Tournoi' });
});

fastify.get('/result', async (request, reply) => {
  return reply.view('result.ejs', { title: 'Résultat' });
});

// 3. ft qui demare tout

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
