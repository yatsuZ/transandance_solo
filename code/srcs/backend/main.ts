import chalk from 'chalk';
import os from 'os';
import qrcode from 'qrcode-terminal';
import { buildFastify } from './config/fastify.js';

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

if (process.env.NODE_ENV !== 'test') {
  const start = async () => {
    console.log(chalk.magenta("\nServeur demarre avec Fastify + EJS\n"));

    try {
      const fastify = await buildFastify();
      const port = parseInt(process.env.FASTIFY_PORT || '3000', 10);
      const host = '0.0.0.0';

      await fastify.listen({ port, host });

      const hostIP = process.env.HOST_IP || getLocalIP();
      const localURL = `https://${hostIP}`;

      console.log(chalk.cyanBright(`\nAccessible sur ton PC : https://localhost`));
      console.log(chalk.greenBright(`Scan ce QR code pour ouvrir sur ton telephone :`));
      console.log(chalk.yellowBright(`(${localURL})\n`));
      console.log(chalk.gray(`Fastify ecoute en interne sur le port ${port} (forwarding via nginx HTTPS)`));

      qrcode.generate(localURL, { small: true });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  start();
}
