import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import chalk from 'chalk';
import os from 'os';
import qrcode from 'qrcode-terminal';

console.log(chalk.magenta("\n🚀 Serveur démarré avec Fastify + EJS\n"));


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
  prefix: '/static/',
});

// 2. Routes
// Fallback SPA : servir main.ejs pour toutes les routes
fastify.setNotFoundHandler(async (request, reply) => {
  // Si c'est une requête pour un fichier statique, renvoyer 404
  if (request.url.startsWith('/static/')) {
    return reply.code(404).send({ error: 'File not found' });
  }
  // Sinon, servir la SPA (le client gérera la validation de route)
  return reply.view('main.ejs');
});

// Route principale
fastify.get('/', async (request, reply) => {
  return reply.view('main.ejs');
});

// 3. Fonction pour récupérer l'adresse IP locale
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

// 4. Démarrer le serveur
const start = async () => {
  try {
    const port = 3001;
    const host = '0.0.0.0';

    await fastify.listen({ port, host });

    const hostIP = process.env.HOST_IP || getLocalIP(); // fallback si hors Docker
    const localURL = `http://${hostIP}:${port}`;
``
    console.log(chalk.cyanBright(`\n🌐 Accessible sur ton PC : http://localhost:${port}`));
    console.log(chalk.greenBright(`📱 Scan ce QR code pour ouvrir sur ton téléphone :`));
    console.log(chalk.yellowBright(`(${localURL})\n`));

    // Générer le QR code
    qrcode.generate(localURL, { small: true });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
