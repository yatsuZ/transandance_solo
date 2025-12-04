import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import ejs from 'ejs';
import chalk from 'chalk';
import os from 'os';
import qrcode from 'qrcode-terminal';
import userRoutes from './routes/users/index.js';
import matchRoutes from './routes/matches/index.js';
import authRoutes from './routes/auth/index.js';
import twofaRoutes from './routes/auth/twofa.routes.js';
import tournamentRoutes from './routes/tournaments/index.js';
import friendshipRoutes from './routes/friendships/index.js';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

// Constantes de configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes

/**
 * Fonction pour construire l'application Fastify
 * Utilisée par main.ts ET par les tests
 */
export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test', // Désactiver les logs en mode test
  });

  // Créer le dossier uploads/avatars s'il n'existe pas
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Dossier uploads/avatars créé');
  }

  // Plugin Cookie (pour gérer les cookies HTTP-only)
  await fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'ATTENTion_YaSssine8JEdoisDefinirDansLesVariebleDenvirnementCArklacVisibleToutLemondeVoiiiitEtCpasBienPOurlasecu',
    parseOptions: {}
  });

  // Plugin Multipart (pour upload de fichiers)
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    }
  });

  // Plugin EJS
  await fastify.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, './../../static/views'),
  });

  // Fichiers statiques (CSS / JS / images)
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, './../../static'),
    prefix: '/static/',
  });

  // Dossier uploads (avatars uploadés par les users)
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false // Important pour éviter les conflits avec le premier plugin static
  });

  // Routes API
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(twofaRoutes, { prefix: '/api/auth/2fa' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(matchRoutes, { prefix: '/api/matches' });
  await fastify.register(tournamentRoutes, { prefix: '/api/tournaments' });
  await fastify.register(friendshipRoutes, { prefix: '/api/friendships' });

  // Routes frontend
  fastify.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/static/')) {
      return reply.code(404).send({ error: 'File not found' });
    }
    if (request.url.startsWith('/api/')) {
      return reply.code(404).send({ success: false, error: 'API endpoint not found' });
    }
    return reply.view('main.ejs');
  });

  fastify.get('/', async (request, reply) => {
    return reply.view('main.ejs');
  });

  return fastify;
}

// 4. Fonction pour récupérer l'adresse IP locale
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Démarrer le serveur SEULEMENT si on n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
  const start = async () => {
    console.log(chalk.magenta("\n🚀 Serveur démarré avec Fastify + EJS\n"));

    try {
      const fastify = await buildApp();
      const port = parseInt(process.env.FASTIFY_PORT || '3000', 10);
      const host = '0.0.0.0';

      await fastify.listen({ port, host });

      const hostIP = process.env.HOST_IP || getLocalIP();
      const localURL = `https://${hostIP}`;

      console.log(chalk.cyanBright(`\n🌐 Accessible sur ton PC : https://localhost`));
      console.log(chalk.greenBright(`📱 Scan ce QR code pour ouvrir sur ton téléphone :`));
      console.log(chalk.yellowBright(`(${localURL})\n`));
      console.log(chalk.gray(`ℹ️  Fastify écoute en interne sur le port ${port} (forwarding via nginx HTTPS)`));

      qrcode.generate(localURL, { small: true });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  start();
}
